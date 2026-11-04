import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { ASSET_CODES, amount, type AssetCode } from '../../models';
import { makeLedger } from '../../test/fixtures';
import { Accounts, type AccountId } from './accounts';
import { foldBalances, LedgerError, type Entry } from './journal';
import * as P from './postings';
import { reconcile } from './reconcile';

const assetArb = fc.constantFrom<AssetCode>(...ASSET_CODES);
const unitsArb = fc.bigInt({ min: 1n, max: 10n ** 24n });
const ACCOUNTS: AccountId[] = [
  Accounts.depositWallet('d1'), Accounts.hotWallet('h1'), Accounts.coldWallet('k1'), Accounts.reserveWallet('r1'),
  Accounts.inTransit('t1'), Accounts.customerAvailable('c1'), Accounts.customerReserved('c1'), Accounts.customerAvailable('c2'),
  Accounts.tradingFees, Accounts.withdrawalFees, Accounts.networkFees, Accounts.operationalReserves,
  Accounts.openingCapital, Accounts.conversionClearing,
];
const accountArb = fc.constantFrom(...ACCOUNTS);
const NON_CUSTOMER = ACCOUNTS.filter((a) => !a.startsWith('liability:customer:'));
const nonCustomerArb = fc.constantFrom(...NON_CUSTOMER);
const isCustomer = (k: string) => k.startsWith('liability:customer:');

/** A random balanced transaction: per asset, a set of debits mirrored by credits. */
const entriesFrom = (acct: fc.Arbitrary<AccountId>) => fc
  .array(fc.record({ asset: assetArb, units: unitsArb, from: acct, to: acct }), { minLength: 1, maxLength: 6 })
  .map((legs) => legs.flatMap((l): Entry[] => [
    { accountId: l.to, asset: l.asset, side: 'debit', units: l.units },
    { accountId: l.from, asset: l.asset, side: 'credit', units: l.units },
  ]));
/** Any accounts, including customer liabilities (may attempt overdrafts). */
const balancedEntries = entriesFrom(accountArb);
/** Exchange-side accounts only: never trips the customer overdraft guard. */
const exchangeEntries = entriesFrom(nonCustomerArb);

describe('ledger invariants (property-based)', () => {
  it('N random balanced transactions: trial balance 0, cache == fold, reconcile clean, no customer overdraft', () => {
    fc.assert(fc.property(fc.array(balancedEntries, { maxLength: 40 }), (txs) => {
      const { ledger } = makeLedger();
      txs.forEach((entries, i) => {
        const before = ledger.size;
        try {
          ledger.post({ kind: 'adjustment', sourceEventId: `e${i}`, entries });
        } catch (err) {
          expect(err).toBeInstanceOf(LedgerError);
          expect((err as LedgerError).code).toBe('INSUFFICIENT_CUSTOMER_BALANCE');
          expect(ledger.size).toBe(before);
        }
      });
      for (const v of ledger.trialBalance().values()) expect(v).toBe(0n);
      expect(ledger.cachedBalances()).toEqual(foldBalances(ledger.transactions()));
      const r = reconcile({ transactions: [...ledger.transactions()], cachedBalances: ledger.cachedBalances() });
      expect(r.discrepancies).toEqual([]);
    }));
  });

  it('a draft is rejected for overdraft iff some customer account would go negative (model check)', () => {
    fc.assert(fc.property(fc.array(balancedEntries, { maxLength: 30 }), (txs) => {
      const { ledger } = makeLedger();
      txs.forEach((entries, i) => {
        const model = foldBalances([...ledger.transactions(), { entries } as never]);
        const wouldOverdraft = [...model].some(([k, v]) => isCustomer(k) && v < 0n);
        let rejected = false;
        try {
          ledger.post({ kind: 'adjustment', sourceEventId: `e${i}`, entries });
        } catch (err) {
          rejected = true;
          const e = err as LedgerError;
          expect(e.code).toBe('INSUFFICIENT_CUSTOMER_BALANCE');
          expect(e.details.shortfall! > 0n).toBe(true);
          expect(isCustomer(e.details.accountId!)).toBe(true);
        }
        expect(rejected).toBe(wouldOverdraft);
        for (const [k, v] of ledger.cachedBalances()) if (isCustomer(k)) expect(v >= 0n).toBe(true);
      });
    }));
  });

  it('any per-asset imbalance is rejected and nothing is appended', () => {
    fc.assert(fc.property(balancedEntries, fc.integer({ min: 0, max: 100 }), fc.bigInt({ min: 1n, max: 1000n }), (entries, idx, delta) => {
      const { ledger } = makeLedger();
      const i = idx % entries.length;
      const broken = entries.map((e, j) => (j === i ? { ...e, units: e.units + delta } : e));
      expect(() => ledger.post({ kind: 'adjustment', sourceEventId: 'x', entries: broken })).toThrow(LedgerError);
      expect(ledger.size).toBe(0);
    }));
  });

  it('posting the same source event any number of times has the effect of posting once', () => {
    fc.assert(fc.property(exchangeEntries, fc.integer({ min: 1, max: 5 }), (entries, n) => {
      const a = makeLedger().ledger;
      const b = makeLedger().ledger;
      a.post({ kind: 'adjustment', sourceEventId: 'e', entries });
      for (let k = 0; k < n; k++) b.post({ kind: 'adjustment', sourceEventId: 'e', entries });
      expect(b.size).toBe(1);
      expect(b.cachedBalances()).toEqual(a.cachedBalances());
    }));
  });

  it('a reversal restores every balance to its prior value and keeps history', () => {
    fc.assert(fc.property(fc.array(exchangeEntries, { minLength: 1, maxLength: 10 }), fc.nat(), (txs, pick) => {
      const { ledger } = makeLedger();
      const posted = txs.map((entries, i) => ledger.post({ kind: 'adjustment', sourceEventId: `e${i}`, entries }).transaction);
      const target = posted[pick % posted.length]!;
      const others = posted.filter((t) => t !== target);
      ledger.reverse(target.id, 'rev');
      expect(ledger.size).toBe(posted.length + 1);
      const net = foldBalances(ledger.transactions());
      const expected = foldBalances(others);
      for (const k of new Set([...net.keys(), ...expected.keys()])) expect(net.get(k) ?? 0n).toBe(expected.get(k) ?? 0n);
    }));
  });

  it('wallet transfers conserve assets; only the network fee leaves, as an expense', () => {
    const wallets = ACCOUNTS.filter((a) => a.startsWith('asset:'));
    fc.assert(fc.property(
      fc.array(fc.record({ from: fc.constantFrom(...wallets), to: fc.constantFrom(...wallets), asset: assetArb, units: unitsArb, fee: fc.bigInt({ min: 0n, max: 10n ** 6n }) }), { maxLength: 30 }),
      (moves) => {
        const { ledger } = makeLedger();
        let fees = new Map<AssetCode, bigint>();
        moves.forEach((m, i) => {
          if (m.from === m.to) return;
          ledger.post(P.walletTransfer({ sourceEventId: `m${i}` }, { from: m.from, to: m.to, amount: amount(m.asset, m.units), networkFee: amount(m.asset, m.fee) }));
          fees = new Map(fees).set(m.asset, (fees.get(m.asset) ?? 0n) + m.fee);
        });
        for (const s of reconcile({ transactions: [...ledger.transactions()] }).assets) {
          const fee = fees.get(s.asset) ?? 0n;
          expect(s.networkFeeExpense).toBe(fee);
          expect(s.blockchainAssets + s.operationalReserveAssets).toBe(-fee);
          expect(s.customerLiabilities).toBe(0n);
        }
      },
    ));
  });

  it('random customer flows keep customer liabilities = deposits − settled withdrawals', () => {
    fc.assert(fc.property(fc.array(fc.tuple(fc.constantFrom('dep', 'wd', 'fail'), fc.bigInt({ min: 1n, max: 10n ** 12n })), { maxLength: 40 }), (ops) => {
      const { ledger } = makeLedger();
      const H = Accounts.hotWallet('h');
      let expected = 0n;
      ops.forEach(([op, u], i) => {
        const a = amount('ETH', u);
        if (op === 'dep') { ledger.post(P.deposit({ sourceEventId: `d${i}` }, 'c', H, a)); expected += u; return; }
        if (ledger.balanceOf(Accounts.customerAvailable('c'), 'ETH') < u) return;
        ledger.post(P.reserveWithdrawal({ sourceEventId: `r${i}` }, 'c', a));
        if (op === 'fail') ledger.post(P.releaseWithdrawal({ sourceEventId: `f${i}` }, 'c', a));
        else { ledger.post(P.settleWithdrawal({ sourceEventId: `s${i}` }, { customerId: 'c', hotWallet: H, sent: a, withdrawalFee: amount('ETH', 0n), networkFee: amount('ETH', 0n) })); expected -= u; }
      });
      const r = reconcile({ transactions: [...ledger.transactions()] });
      expect(r.ok).toBe(true);
      expect(r.assets.find((s) => s.asset === 'ETH')!.customerLiabilities).toBe(expected);
      expect(ledger.balanceOf(Accounts.customerReserved('c'), 'ETH')).toBe(0n);
    }));
  });
});
