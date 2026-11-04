import type { Amount } from '../../models/amount';
import type { AssetCode } from '../../models/asset';
import { Accounts, parseAccount, type AccountId } from './accounts';
import type { Entry, JournalTransactionDraft } from './journal';

/**
 * Pure builders for common ledger postings (SPEC §11 examples). Each returns a
 * draft; Ledger.post validates and applies it. Zero-unit legs (e.g. a zero
 * fee) are omitted because entries must be strictly positive.
 */

export interface Meta {
  readonly sourceEventId: string;
  readonly correlationId?: string;
  readonly memo?: string;
}

const dr = (accountId: AccountId, a: Amount): Entry => ({ accountId, asset: a.asset, side: 'debit', units: a.units });
const cr = (accountId: AccountId, a: Amount): Entry => ({ accountId, asset: a.asset, side: 'credit', units: a.units });

function positive(name: string, a: Amount): void {
  if (a.units <= 0n) throw new RangeError(`${name} must be positive`);
}
function nonNegative(name: string, a: Amount, asset: AssetCode): void {
  if (a.units < 0n) throw new RangeError(`${name} must not be negative`);
  if (a.asset !== asset) throw new RangeError(`${name} must be in ${asset}`);
}
function assetAccount(id: AccountId): void {
  if (parseAccount(id).type !== 'asset') throw new RangeError(`${id} is not an asset account`);
}
const nonZero = (entries: Entry[]): Entry[] => entries.filter((e) => e.units > 0n);

/** Exchange capital injection into an exchange wallet. */
export function openingCapital(m: Meta, wallet: AccountId, a: Amount): JournalTransactionDraft {
  positive('amount', a);
  assetAccount(wallet);
  return { ...m, kind: 'opening-capital', entries: [dr(wallet, a), cr(Accounts.openingCapital, a)] };
}

/** Fund an exchange-owned operational reserve wallet (never customer funds). */
export function fundOperationalReserve(m: Meta, reserveWallet: AccountId, a: Amount): JournalTransactionDraft {
  positive('amount', a);
  if (parseAccount(reserveWallet).category !== 'operational-reserve-asset') {
    throw new RangeError(`${reserveWallet} is not an operational reserve wallet`);
  }
  return { ...m, kind: 'operational-reserve', entries: [dr(reserveWallet, a), cr(Accounts.operationalReserves, a)] };
}

/** Confirmed customer deposit: wallet asset up, customer liability up (SPEC §9). */
export function deposit(m: Meta, customerId: string, depositWallet: AccountId, a: Amount): JournalTransactionDraft {
  positive('amount', a);
  assetAccount(depositWallet);
  return { ...m, kind: 'deposit', entries: [dr(depositWallet, a), cr(Accounts.customerAvailable(customerId), a)] };
}

/** Reserve customer funds before a withdrawal is processed (SPEC §20.7). `a` includes the fee. */
export function reserveWithdrawal(m: Meta, customerId: string, a: Amount): JournalTransactionDraft {
  positive('amount', a);
  return {
    ...m,
    kind: 'withdrawal-reserve',
    entries: [dr(Accounts.customerAvailable(customerId), a), cr(Accounts.customerReserved(customerId), a)],
  };
}

/** Release a failed withdrawal's reserve back to available (SPEC §20.8). */
export function releaseWithdrawal(m: Meta, customerId: string, a: Amount): JournalTransactionDraft {
  positive('amount', a);
  return {
    ...m,
    kind: 'withdrawal-release',
    entries: [dr(Accounts.customerReserved(customerId), a), cr(Accounts.customerAvailable(customerId), a)],
  };
}

/**
 * Final settlement of a withdrawal. The customer's reserved liability falls by
 * `sent + withdrawalFee`; the hot wallet pays `sent + networkFee`; the network
 * fee is booked separately as an expense, the withdrawal fee as revenue.
 */
export function settleWithdrawal(
  m: Meta,
  p: { customerId: string; hotWallet: AccountId; sent: Amount; withdrawalFee: Amount; networkFee: Amount },
): JournalTransactionDraft {
  positive('sent', p.sent);
  nonNegative('withdrawalFee', p.withdrawalFee, p.sent.asset);
  nonNegative('networkFee', p.networkFee, p.sent.asset);
  assetAccount(p.hotWallet);
  const reserved = { asset: p.sent.asset, units: p.sent.units + p.withdrawalFee.units };
  const paid = { asset: p.sent.asset, units: p.sent.units + p.networkFee.units };
  return {
    ...m,
    kind: 'withdrawal-settle',
    entries: nonZero([
      dr(Accounts.customerReserved(p.customerId), reserved),
      cr(Accounts.withdrawalFees, p.withdrawalFee),
      dr(Accounts.networkFees, p.networkFee),
      cr(p.hotWallet, paid),
    ]),
  };
}

/**
 * Wallet-to-wallet transfer (sweep, replenishment, hot↔cold). Total assets
 * are conserved except the network fee, which is a separate expense (SPEC §20.9–10).
 */
export function walletTransfer(
  m: Meta,
  p: { from: AccountId; to: AccountId; amount: Amount; networkFee: Amount },
): JournalTransactionDraft {
  positive('amount', p.amount);
  nonNegative('networkFee', p.networkFee, p.amount.asset);
  assetAccount(p.from);
  assetAccount(p.to);
  if (p.from === p.to) throw new RangeError('from and to must differ');
  return {
    ...m,
    kind: 'wallet-transfer',
    entries: nonZero([
      dr(p.to, p.amount),
      dr(Accounts.networkFees, p.networkFee),
      cr(p.from, { asset: p.amount.asset, units: p.amount.units + p.networkFee.units }),
    ]),
  };
}

/** On-chain leg 1: funds leave `from` into an in-transit account; fee expensed. */
export function dispatchTransfer(
  m: Meta,
  p: { transferId: string; from: AccountId; amount: Amount; networkFee: Amount },
): JournalTransactionDraft {
  return { ...walletTransfer(m, { from: p.from, to: Accounts.inTransit(p.transferId), amount: p.amount, networkFee: p.networkFee }), kind: 'transfer-dispatch' };
}

/** On-chain leg 2: in-transit funds land in `to`. */
export function arriveTransfer(m: Meta, p: { transferId: string; to: AccountId; amount: Amount }): JournalTransactionDraft {
  positive('amount', p.amount);
  assetAccount(p.to);
  return { ...m, kind: 'transfer-arrive', entries: [dr(p.to, p.amount), cr(Accounts.inTransit(p.transferId), p.amount)] };
}

/**
 * Cross-asset trade between two customers, posted through the approved
 * clearing account so every asset leg balances on its own.
 * Buyer pays `quote` and receives `base`; seller the reverse. Optional fees
 * (in the asset each side receives) go to trading-fee revenue.
 */
export function trade(
  m: Meta,
  p: {
    buyerId: string;
    sellerId: string;
    base: Amount;
    quote: Amount;
    buyerFee?: Amount;
    sellerFee?: Amount;
  },
): JournalTransactionDraft {
  positive('base', p.base);
  positive('quote', p.quote);
  if (p.base.asset === p.quote.asset) throw new RangeError('base and quote assets must differ');
  const buyerFee = p.buyerFee ?? { asset: p.base.asset, units: 0n };
  const sellerFee = p.sellerFee ?? { asset: p.quote.asset, units: 0n };
  nonNegative('buyerFee', buyerFee, p.base.asset);
  nonNegative('sellerFee', sellerFee, p.quote.asset);
  if (buyerFee.units > p.base.units || sellerFee.units > p.quote.units) throw new RangeError('fee exceeds proceeds');
  const C = Accounts.conversionClearing;
  return {
    ...m,
    kind: 'trade',
    entries: nonZero([
      // quote leg: buyer → clearing → seller (+ fee)
      dr(Accounts.customerAvailable(p.buyerId), p.quote),
      cr(C, p.quote),
      dr(C, p.quote),
      cr(Accounts.customerAvailable(p.sellerId), { asset: p.quote.asset, units: p.quote.units - sellerFee.units }),
      cr(Accounts.tradingFees, sellerFee),
      // base leg: seller → clearing → buyer (+ fee)
      dr(Accounts.customerAvailable(p.sellerId), p.base),
      cr(C, p.base),
      dr(C, p.base),
      cr(Accounts.customerAvailable(p.buyerId), { asset: p.base.asset, units: p.base.units - buyerFee.units }),
      cr(Accounts.tradingFees, buyerFee),
    ]),
  };
}

/**
 * Customer converts `from` into `to` against the exchange. The clearing
 * account carries the exchange's resulting position in each asset.
 */
export function conversion(m: Meta, p: { customerId: string; from: Amount; to: Amount; fee?: Amount }): JournalTransactionDraft {
  positive('from', p.from);
  positive('to', p.to);
  if (p.from.asset === p.to.asset) throw new RangeError('conversion assets must differ');
  const fee = p.fee ?? { asset: p.to.asset, units: 0n };
  nonNegative('fee', fee, p.to.asset);
  if (fee.units > p.to.units) throw new RangeError('fee exceeds proceeds');
  const C = Accounts.conversionClearing;
  return {
    ...m,
    kind: 'conversion',
    entries: nonZero([
      dr(Accounts.customerAvailable(p.customerId), p.from),
      cr(C, p.from),
      dr(C, p.to),
      cr(Accounts.customerAvailable(p.customerId), { asset: p.to.asset, units: p.to.units - fee.units }),
      cr(Accounts.tradingFees, fee),
    ]),
  };
}
