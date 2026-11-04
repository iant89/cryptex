import { ASSET_CODES, type AssetCode } from '../../models/asset';
import { parseAccount, type AccountCategory } from './accounts';
import { balanceKey, foldBalances, signedEffect, type JournalTransaction } from './journal';

export type DiscrepancyKind =
  | 'unbalanced-transaction'
  | 'trial-balance'
  | 'accounting-equation'
  | 'cache-mismatch'
  | 'wallet-vs-chain'
  | 'total-wallets-vs-chain'
  | 'negative-customer-balance';

export interface Discrepancy {
  readonly kind: DiscrepancyKind;
  readonly asset: AssetCode;
  readonly accountId?: string;
  readonly transactionId?: string;
  readonly expected: bigint;
  readonly actual: bigint;
  readonly difference: bigint;
}

export interface AssetSummary {
  readonly asset: AssetCode;
  readonly totalDebits: bigint;
  readonly totalCredits: bigint;
  /** Σ customer-wallet + in-transit asset accounts (exchange-controlled blockchain assets). */
  readonly blockchainAssets: bigint;
  /** Σ exchange-owned operational reserve wallets. */
  readonly operationalReserveAssets: bigint;
  readonly customerLiabilities: bigint;
  readonly revenue: bigint;
  readonly networkFeeExpense: bigint;
  readonly operationalReserveEquity: bigint;
  readonly otherEquity: bigint;
}

export interface ReconciliationInput {
  readonly transactions: readonly JournalTransaction[];
  /** Optional read-model cache to verify against the fold (keys from balanceKey). */
  readonly cachedBalances?: ReadonlyMap<string, bigint>;
  /** Optional simulated on-chain balances keyed by wallet account id (Phase 5+). */
  readonly chainBalances?: ReadonlyMap<string, ReadonlyMap<AssetCode, bigint>>;
}

export interface ReconciliationReport {
  readonly ok: boolean;
  readonly assets: readonly AssetSummary[];
  readonly discrepancies: readonly Discrepancy[];
}

const d = (kind: DiscrepancyKind, asset: AssetCode, expected: bigint, actual: bigint, extra: Partial<Discrepancy> = {}): Discrepancy =>
  Object.freeze({ kind, asset, expected, actual, difference: actual - expected, ...extra });

/**
 * Pure reconciliation (SPEC §20.12). Reads its inputs and returns a report of
 * every discrepancy found. It never mutates, corrects, or posts anything.
 */
export function reconcile(input: ReconciliationInput): ReconciliationReport {
  const discrepancies: Discrepancy[] = [];
  const byCat = new Map<AssetCode, Map<AccountCategory, bigint>>();
  const dc = new Map<AssetCode, { dr: bigint; cr: bigint }>();
  for (const a of ASSET_CODES) {
    byCat.set(a, new Map());
    dc.set(a, { dr: 0n, cr: 0n });
  }

  for (const tx of input.transactions) {
    const net = new Map<AssetCode, bigint>();
    for (const e of tx.entries) {
      const t = dc.get(e.asset);
      if (!t) continue;
      if (e.side === 'debit') t.dr += e.units;
      else t.cr += e.units;
      net.set(e.asset, (net.get(e.asset) ?? 0n) + (e.side === 'debit' ? e.units : -e.units));
      const cat = parseAccount(e.accountId).category;
      const m = byCat.get(e.asset)!;
      m.set(cat, (m.get(cat) ?? 0n) + signedEffect(e));
    }
    for (const [asset, n] of net) {
      if (n !== 0n) discrepancies.push(d('unbalanced-transaction', asset, 0n, n, { transactionId: tx.id }));
    }
  }

  const assets: AssetSummary[] = [];
  for (const asset of ASSET_CODES) {
    const m = byCat.get(asset)!;
    const g = (c: AccountCategory) => m.get(c) ?? 0n;
    const t = dc.get(asset)!;
    const s: AssetSummary = Object.freeze({
      asset,
      totalDebits: t.dr,
      totalCredits: t.cr,
      blockchainAssets: g('blockchain-asset'),
      operationalReserveAssets: g('operational-reserve-asset'),
      customerLiabilities: g('customer-liability'),
      revenue: g('revenue'),
      networkFeeExpense: g('network-fee-expense'),
      operationalReserveEquity: g('operational-reserve-equity'),
      otherEquity: g('equity'),
    });
    assets.push(s);
    if (t.dr !== t.cr) discrepancies.push(d('trial-balance', asset, t.cr, t.dr));
    // Assets + Expenses = Liabilities + Revenue + Equity
    const lhs = s.blockchainAssets + s.operationalReserveAssets + s.networkFeeExpense;
    const rhs = s.customerLiabilities + s.revenue + s.operationalReserveEquity + s.otherEquity;
    if (lhs !== rhs) discrepancies.push(d('accounting-equation', asset, rhs, lhs));
  }

  const folded = foldBalances(input.transactions);
  for (const [key, bal] of folded) {
    const [accountId = '', asset] = key.split('|') as [string, AssetCode];
    if (bal < 0n && parseAccount(accountId).category === 'customer-liability') {
      discrepancies.push(d('negative-customer-balance', asset, 0n, bal, { accountId }));
    }
  }

  if (input.cachedBalances) {
    const keys = new Set([...folded.keys(), ...input.cachedBalances.keys()]);
    for (const key of [...keys].sort()) {
      const expected = folded.get(key) ?? 0n;
      const actual = input.cachedBalances.get(key) ?? 0n;
      if (expected !== actual) {
        const [accountId, asset] = key.split('|') as [string, AssetCode];
        discrepancies.push(d('cache-mismatch', asset, expected, actual, { accountId }));
      }
    }
  }

  if (input.chainBalances) {
    const totals = new Map<AssetCode, { ledger: bigint; chain: bigint }>();
    const walletIds = new Set<string>(input.chainBalances.keys());
    for (const key of folded.keys()) {
      const accountId = key.split('|')[0] ?? '';
      if (parseAccount(accountId).walletKind) walletIds.add(accountId);
    }
    for (const accountId of [...walletIds].sort()) {
      if (!parseAccount(accountId).walletKind) continue;
      for (const asset of ASSET_CODES) {
        const ledger = folded.get(balanceKey(accountId, asset)) ?? 0n;
        const chain = input.chainBalances.get(accountId)?.get(asset) ?? 0n;
        const t = totals.get(asset) ?? { ledger: 0n, chain: 0n };
        t.ledger += ledger;
        t.chain += chain;
        totals.set(asset, t);
        if (ledger !== chain) discrepancies.push(d('wallet-vs-chain', asset, ledger, chain, { accountId }));
      }
    }
    for (const [asset, t] of totals) {
      if (t.ledger !== t.chain) discrepancies.push(d('total-wallets-vs-chain', asset, t.ledger, t.chain));
    }
  }

  return Object.freeze({ ok: discrepancies.length === 0, assets: Object.freeze(assets), discrepancies: Object.freeze(discrepancies) });
}
