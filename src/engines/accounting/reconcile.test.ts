import { describe, expect, it } from 'vitest';
import { parseAmount, type AssetCode } from '../../models';
import { makeLedger } from '../../test/fixtures';
import { Accounts } from './accounts';
import { Ledger, balanceKey, type JournalTransaction } from './journal';
import * as P from './postings';
import { reconcile } from './reconcile';

const btc = (s: string) => parseAmount('BTC', s);
const H = Accounts.hotWallet('h1');
const K = Accounts.coldWallet('k1');

function seeded() {
  const { ledger } = makeLedger();
  ledger.post(P.deposit({ sourceEventId: 'd' }, 'c1', H, btc('2')));
  ledger.post(P.walletTransfer({ sourceEventId: 't' }, { from: H, to: K, amount: btc('1'), networkFee: btc('0.001') }));
  return ledger;
}

/** Deep snapshot including bigints, to prove reconcile never mutates its input. */
const snap = (x: unknown) => JSON.stringify(x, (_k, v) => (typeof v === 'bigint' ? `${v}n` : v));

describe('reconcile', () => {
  it('a healthy ledger reconciles with per-asset summaries', () => {
    const ledger = seeded();
    const r = reconcile({ transactions: [...ledger.transactions()], cachedBalances: ledger.cachedBalances() });
    expect(r.ok).toBe(true);
    expect(r.assets).toHaveLength(8);
    const s = r.assets.find((a) => a.asset === 'BTC')!;
    expect(s.blockchainAssets).toBe(btc('1.999').units);
    expect(s.networkFeeExpense).toBe(btc('0.001').units);
    expect(s.customerLiabilities).toBe(btc('2').units);
    expect(s.totalDebits).toBe(s.totalCredits);
  });

  it('reports an injected unbalanced transaction without changing data', () => {
    const ledger = seeded();
    const txs = [...ledger.transactions()];
    const bad: JournalTransaction = { ...txs[0]!, id: 'tx-bad' as JournalTransaction['id'], entries: [{ accountId: H, asset: 'BTC', side: 'debit', units: 5n }] };
    const input = { transactions: [...txs, bad] };
    const before = snap(input);
    const r = reconcile(input);
    expect(snap(input)).toBe(before);
    expect(r.ok).toBe(false);
    expect(r.discrepancies.map((x) => x.kind).sort()).toEqual(['accounting-equation', 'trial-balance', 'unbalanced-transaction']);
    expect(r.discrepancies.find((x) => x.kind === 'unbalanced-transaction')).toMatchObject({ transactionId: 'tx-bad', difference: 5n });
    expect(ledger.size).toBe(2);
  });

  it('reports cache drift', () => {
    const ledger = seeded();
    const cache = new Map(ledger.cachedBalances());
    cache.set(balanceKey(H, 'BTC'), 1n);
    cache.set(balanceKey(Accounts.networkFees, 'ETH'), 7n);
    const r = reconcile({ transactions: [...ledger.transactions()], cachedBalances: cache });
    expect(r.discrepancies).toEqual([
      expect.objectContaining({ kind: 'cache-mismatch', accountId: H, asset: 'BTC', actual: 1n }),
      expect.objectContaining({ kind: 'cache-mismatch', accountId: Accounts.networkFees, asset: 'ETH', expected: 0n, actual: 7n }),
    ]);
  });

  it('reports wallet ledger vs simulated chain discrepancies, per wallet and in total', () => {
    const ledger = seeded();
    const chain = new Map<string, Map<AssetCode, bigint>>([
      [H, new Map([['BTC', btc('0.999').units]])],
      [K, new Map([['BTC', btc('0.5').units]])],
      [Accounts.coldWallet('ghost'), new Map([['ETH', 3n]])],
    ]);
    const before = snap([...chain].map(([k, v]) => [k, [...v]]));
    const r = reconcile({ transactions: [...ledger.transactions()], chainBalances: chain });
    expect(snap([...chain].map(([k, v]) => [k, [...v]]))).toBe(before);
    const kinds = r.discrepancies.map((x) => `${x.kind}:${x.accountId ?? ''}:${x.asset}:${x.difference}`);
    expect(kinds).toEqual([
      `wallet-vs-chain:${Accounts.coldWallet('ghost')}:ETH:3`,
      `wallet-vs-chain:${K}:BTC:${-btc('0.5').units}`,
      `total-wallets-vs-chain::BTC:${-btc('0.5').units}`,
      'total-wallets-vs-chain::ETH:3',
    ]);
  });

  it('matching chain balances reconcile cleanly', () => {
    const ledger = seeded();
    const chain = new Map([[H, new Map<AssetCode, bigint>([['BTC', btc('0.999').units]])], [K, new Map<AssetCode, bigint>([['BTC', btc('1').units]])]]);
    expect(reconcile({ transactions: [...ledger.transactions()], chainBalances: chain }).ok).toBe(true);
  });

  it('still flags customer overdrafts present in loaded history (backstop)', () => {
    const { clock, ids } = makeLedger();
    const { ledger: src } = makeLedger();
    src.post(P.deposit({ sourceEventId: 'd' }, 'c1', H, btc('1')));
    const [dep] = src.transactions();
    // Hand-built persisted history in which the customer was overdrawn.
    const overdraft: JournalTransaction = {
      ...dep!, id: 'tx-od' as JournalTransaction['id'], sourceEventId: 'od', sequence: 1, kind: 'withdrawal-reserve',
      entries: [
        { accountId: Accounts.customerAvailable('c1'), asset: 'BTC', side: 'debit', units: btc('3').units },
        { accountId: Accounts.customerReserved('c1'), asset: 'BTC', side: 'credit', units: btc('3').units },
      ],
    };
    const ledger = new Ledger({ clock, ids }, [dep!, overdraft]);
    const r = reconcile({ transactions: [...ledger.transactions()] });
    expect(r.discrepancies).toEqual([expect.objectContaining({ kind: 'negative-customer-balance', accountId: Accounts.customerAvailable('c1'), difference: -btc('2').units })]);
    expect(ledger.size).toBe(2);
  });

  it('surfaces the conversion clearing residual separately from opening capital', () => {
    const { ledger } = makeLedger();
    const usdt = (s: string) => parseAmount('USDT', s);
    ledger.post(P.openingCapital({ sourceEventId: 'cap' }, H, btc('10')));
    ledger.post(P.deposit({ sourceEventId: 'd' }, 'c', H, usdt('100')));
    ledger.post(P.conversion({ sourceEventId: 'cv' }, { customerId: 'c', from: usdt('100'), to: btc('0.0015') }));
    const r = reconcile({ transactions: [...ledger.transactions()] });
    expect(r.ok).toBe(true);
    const s = (a: AssetCode) => r.assets.find((x) => x.asset === a)!;
    expect(s('USDT').conversionClearing).toBe(usdt('100').units);
    expect(s('BTC').conversionClearing).toBe(-btc('0.0015').units);
    expect(s('BTC').openingCapital).toBe(btc('10').units);
    expect(s('USDT').openingCapital).toBe(0n);
    expect(s('ETH').conversionClearing).toBe(0n);
  });

  it('customer↔customer trades leave no clearing residual', () => {
    const { ledger } = makeLedger();
    const usdt = (s: string) => parseAmount('USDT', s);
    ledger.post(P.deposit({ sourceEventId: 'd1' }, 'b', H, usdt('100')));
    ledger.post(P.deposit({ sourceEventId: 'd2' }, 's', H, btc('1')));
    ledger.post(P.trade({ sourceEventId: 't' }, { buyerId: 'b', sellerId: 's', base: btc('0.001'), quote: usdt('65') }));
    const r = reconcile({ transactions: [...ledger.transactions()] });
    expect(r.assets.every((a) => a.conversionClearing === 0n)).toBe(true);
  });

  it('report is frozen', () => {
    const r = reconcile({ transactions: [] });
    expect(Object.isFrozen(r)).toBe(true);
    expect(r.ok).toBe(true);
  });
});
