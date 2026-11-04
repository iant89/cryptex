import { describe, expect, it } from 'vitest';
import { makeLedger } from '../../test/fixtures';
import { Accounts } from './accounts';
import { Ledger, LedgerError, foldBalances, signedEffect, trialBalance, validateDraft, balanceKey, type Entry, type JournalTransactionDraft } from './journal';

const H = Accounts.hotWallet('h1');
const C = Accounts.customerAvailable('c1');
const e = (accountId: Entry['accountId'], side: Entry['side'], units: bigint, asset: Entry['asset'] = 'BTC'): Entry => ({ accountId, asset, side, units });
const draft = (sourceEventId: string, entries: Entry[]): JournalTransactionDraft => ({ kind: 'deposit', sourceEventId, entries });
const ok = (src = 'e1', u = 100n) => draft(src, [e(H, 'debit', u), e(C, 'credit', u)]);

const code = (fn: () => unknown) => {
  try { fn(); } catch (err) { return (err as LedgerError).code; }
  return 'NO_ERROR';
};

describe('Ledger.post validation', () => {
  it('rejects empty, zero, negative, non-bigint, unknown account/asset, unbalanced, mixed-asset', () => {
    const { ledger } = makeLedger();
    expect(code(() => ledger.post(draft('x', [])))).toBe('EMPTY');
    expect(code(() => ledger.post(draft('x', [e(H, 'debit', 0n), e(C, 'credit', 0n)])))).toBe('NON_POSITIVE');
    expect(code(() => ledger.post(draft('x', [e(H, 'debit', -5n), e(C, 'credit', -5n)])))).toBe('NON_POSITIVE');
    expect(code(() => ledger.post(draft('x', [e(H, 'debit', 5 as unknown as bigint), e(C, 'credit', 5n)])))).toBe('NOT_BIGINT');
    expect(code(() => ledger.post(draft('x', [e('nope' as Entry['accountId'], 'debit', 5n), e(C, 'credit', 5n)])))).toBe('UNKNOWN_ACCOUNT');
    expect(code(() => ledger.post(draft('x', [e(H, 'debit', 5n, 'FOO' as Entry['asset']), e(C, 'credit', 5n)])))).toBe('UNKNOWN_ASSET');
    expect(code(() => ledger.post(draft('x', [e(H, 'debit', 5n), e(C, 'credit', 4n)])))).toBe('UNBALANCED');
    // balanced in total units but not per asset
    expect(code(() => ledger.post(draft('x', [e(H, 'debit', 5n, 'BTC'), e(C, 'credit', 5n, 'ETH')])))).toBe('UNBALANCED');
    expect(code(() => ledger.post(draft('x', [e(H, 'sideways' as Entry['side'], 5n)])))).toBe('UNBALANCED');
    expect(code(() => ledger.post(draft('', [e(H, 'debit', 5n), e(C, 'credit', 5n)])))).toBe('MISSING_SOURCE_EVENT');
    expect(ledger.size).toBe(0);
    expect(code(() => validateDraft(ok()))).toBe('NO_ERROR');
  });
});

describe('Ledger.post', () => {
  it('appends with injected id/time and derives balances', () => {
    const { ledger, clock } = makeLedger();
    clock.advance(500);
    const { transaction, duplicate } = ledger.post({ ...ok(), memo: 'm', correlationId: 'corr' });
    expect(duplicate).toBe(false);
    expect(transaction).toMatchObject({ id: 'tx-t-000001', occurredAt: 1_500, sequence: 0, memo: 'm', correlationId: 'corr' });
    expect(ledger.balanceOf(H, 'BTC')).toBe(100n);
    expect(ledger.balanceOf(C, 'BTC')).toBe(100n);
    expect(ledger.balanceOf(C, 'ETH')).toBe(0n);
    expect(ledger.getTransaction(transaction.id)).toBe(transaction);
    expect(ledger.findBySourceEvent('e1')).toBe(transaction);
    expect(ledger.trialBalance().get('BTC')).toBe(0n);
  });
  it('defaults correlationId to sourceEventId and memo to empty', () => {
    const { ledger } = makeLedger();
    expect(ledger.post(ok()).transaction).toMatchObject({ correlationId: 'e1', memo: '' });
  });
  it('is idempotent on sourceEventId', () => {
    const { ledger } = makeLedger();
    const first = ledger.post(ok());
    const second = ledger.post(ok());
    expect(second.duplicate).toBe(true);
    expect(second.transaction).toBe(first.transaction);
    expect(ledger.size).toBe(1);
    expect(ledger.balanceOf(H, 'BTC')).toBe(100n);
  });
  it('rejects re-use of a sourceEventId with different content', () => {
    const { ledger } = makeLedger();
    ledger.post(ok('e1', 100n));
    expect(code(() => ledger.post(ok('e1', 101n)))).toBe('SOURCE_EVENT_CONFLICT');
    expect(code(() => ledger.post({ ...ok('e1'), kind: 'trade' }))).toBe('SOURCE_EVENT_CONFLICT');
    expect(code(() => ledger.post(draft('e1', [e(H, 'debit', 100n), e(C, 'credit', 50n), e(C, 'credit', 50n)])))).toBe('SOURCE_EVENT_CONFLICT');
    expect(ledger.size).toBe(1);
  });
  it('is append-only: history and entries are frozen', () => {
    const { ledger } = makeLedger();
    const { transaction } = ledger.post(ok());
    expect(Object.isFrozen(transaction)).toBe(true);
    expect(Object.isFrozen(transaction.entries)).toBe(true);
    expect(Object.isFrozen(transaction.entries[0])).toBe(true);
    const list = ledger.transactions();
    expect(() => (list as unknown as unknown[]).push(1)).toThrow();
    expect(ledger.size).toBe(1);
  });
  it('does not alias caller-owned entries', () => {
    const { ledger } = makeLedger();
    const entries = [e(H, 'debit', 1n), e(C, 'credit', 1n)];
    ledger.post(draft('a', entries));
    (entries[0] as { units: bigint }).units = 999n;
    expect(ledger.balanceOf(H, 'BTC')).toBe(1n);
  });
});

describe('Ledger.reverse', () => {
  it('corrects with a mirror-image transaction, leaving the original intact', () => {
    const { ledger } = makeLedger();
    const orig = ledger.post(ok()).transaction;
    const rev = ledger.reverse(orig.id, 'fix-1', 'oops').transaction;
    expect(rev.kind).toBe('reversal');
    expect(rev.reversesTransactionId).toBe(orig.id);
    expect(rev.memo).toBe('oops');
    expect(rev.entries.map((x) => x.side)).toEqual(['credit', 'debit']);
    expect(ledger.getTransaction(orig.id)).toEqual(orig);
    expect(ledger.balanceOf(H, 'BTC')).toBe(0n);
    expect(ledger.size).toBe(2);
    expect(ledger.reversedBy(orig.id)).toBe(rev.id);
  });
  it('is idempotent and refuses double / unknown reversals', () => {
    const { ledger } = makeLedger();
    const orig = ledger.post(ok()).transaction;
    const r1 = ledger.reverse(orig.id, 'fix-1');
    expect(r1.transaction.memo).toBe(`Reversal of ${orig.id}`);
    expect(ledger.reverse(orig.id, 'fix-1').duplicate).toBe(true);
    expect(code(() => ledger.reverse(orig.id, 'fix-2'))).toBe('ALREADY_REVERSED');
    expect(code(() => ledger.reverse('tx-missing', 'fix-3'))).toBe('UNKNOWN_TRANSACTION');
    const other = ledger.post(ok('e2')).transaction;
    expect(code(() => ledger.reverse(other.id, 'e1'))).toBe('SOURCE_EVENT_CONFLICT');
    expect(ledger.size).toBe(3);
  });
});

describe('derived balances', () => {
  it('cache equals fold, signed by normal side', () => {
    const { ledger } = makeLedger();
    ledger.post(ok('a', 100n));
    ledger.post({ kind: 'wallet-transfer', sourceEventId: 'b', entries: [e(Accounts.coldWallet('c'), 'debit', 30n), e(H, 'credit', 30n)] });
    expect(ledger.cachedBalances()).toEqual(foldBalances(ledger.transactions()));
    expect(ledger.cachedBalances().get(balanceKey(H, 'BTC'))).toBe(70n);
    expect(signedEffect(e(H, 'credit', 5n))).toBe(-5n);
    expect(signedEffect(e(C, 'credit', 5n))).toBe(5n);
    expect(trialBalance(ledger.transactions()).get('BTC')).toBe(0n);
  });
  it('rebuilds from history', () => {
    const { ledger, clock, ids } = makeLedger();
    ledger.post(ok('a'));
    const rebuilt = new Ledger({ clock, ids }, ledger.transactions());
    expect(rebuilt.cachedBalances()).toEqual(ledger.cachedBalances());
    expect(rebuilt.post(ok('a')).duplicate).toBe(true);
  });
  it('refuses corrupt history', () => {
    const { ledger, clock, ids } = makeLedger();
    const tx = ledger.post(ok('a')).transaction;
    const bad = { ...tx, entries: [tx.entries[0]!] };
    expect(() => new Ledger({ clock, ids }, [bad])).toThrow(LedgerError);
  });
});
