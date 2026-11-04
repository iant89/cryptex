import { describe, expect, it } from 'vitest';
import { parseAmount } from '../models';
import { Accounts, deposit, reconcile } from '../engines/accounting';
import { EventBus, type DomainEvent } from '../core/events';
import { InMemoryJournalRepository } from '../core/persistence';
import { ManualClock, SequentialIdGenerator } from '../core/simulation';
import { LedgerService } from './ledgerService';

type Events = { 'deposit.confirmed': { customerId: string; eth: string } };

describe('LedgerService (integration: bus + ledger + repo, fixed seed, manual clock)', () => {
  it('a duplicated deposit event is credited exactly once and persisted once', async () => {
    const clock = new ManualClock(0);
    const ids = new SequentialIdGenerator('i');
    const repo = new InMemoryJournalRepository();
    const svc = await LedgerService.open({ clock, ids, repo });
    const bus = new EventBus<Events>({ clock, ids });
    const pending: Promise<unknown>[] = [];
    bus.on('deposit.confirmed', (e: DomainEvent<'deposit.confirmed', Events['deposit.confirmed']>) => {
      pending.push(svc.post(deposit({ sourceEventId: e.id, correlationId: e.correlationId }, e.payload.customerId, Accounts.depositWallet('w'), parseAmount('ETH', e.payload.eth))));
    });
    const e = bus.create('deposit.confirmed', { customerId: 'c1', eth: '2.5' });
    bus.publish(e);
    bus.publish(e);
    await Promise.all(pending);
    expect(svc.ledger.balanceOf(Accounts.customerAvailable('c1'), 'ETH')).toBe(parseAmount('ETH', '2.5').units);
    expect(await repo.count()).toBe(1);
    expect(reconcile({ transactions: [...svc.ledger.transactions()], cachedBalances: svc.ledger.cachedBalances() }).ok).toBe(true);
  });

  it('reloads history and keeps idempotency across restarts; reversals persist', async () => {
    const repo = new InMemoryJournalRepository();
    const ids = new SequentialIdGenerator('i');
    const svc = await LedgerService.open({ clock: new ManualClock(), ids, repo });
    const d = deposit({ sourceEventId: 'ev-1' }, 'c', Accounts.hotWallet('h'), parseAmount('BTC', '1'));
    const { transaction } = await svc.post(d);
    const reopened = await LedgerService.open({ clock: new ManualClock(), ids, repo });
    expect((await reopened.post(d)).duplicate).toBe(true);
    await reopened.reverse(transaction.id, 'fix');
    expect((await reopened.reverse(transaction.id, 'fix')).duplicate).toBe(true);
    expect(await repo.count()).toBe(2);
    const third = await LedgerService.open({ clock: new ManualClock(), ids, repo });
    expect(third.ledger.balanceOf(Accounts.hotWallet('h'), 'BTC')).toBe(0n);
  });

  it('same seed and inputs → bit-for-bit identical journals', async () => {
    const run = async () => {
      const svc = await LedgerService.open({ clock: new ManualClock(), ids: new SequentialIdGenerator('x'), repo: new InMemoryJournalRepository() });
      for (let i = 0; i < 5; i++) await svc.post(deposit({ sourceEventId: `e${i}` }, `c${i}`, Accounts.hotWallet('h'), parseAmount('SOL', `${i + 1}`)));
      return JSON.stringify(svc.ledger.transactions(), (_k, v) => (typeof v === 'bigint' ? v.toString() : v));
    };
    expect(await run()).toBe(await run());
  });
});
