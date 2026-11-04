import { describe, expect, it, vi } from 'vitest';
import { ManualClock, SequentialIdGenerator } from '../simulation';
import { EventBus, idempotent, type DomainEvent } from './bus';

type Events = { 'deposit.confirmed': { units: bigint }; 'withdrawal.failed': { reason: string } };
const make = () => new EventBus<Events>({ clock: new ManualClock(5), ids: new SequentialIdGenerator('b') });

describe('EventBus', () => {
  it('creates events with injected id/time and correlation', () => {
    const bus = make();
    const e = bus.create('deposit.confirmed', { units: 1n });
    expect(e).toMatchObject({ id: 'evt-b-000001', occurredAt: 5, correlationId: 'evt-b-000001', type: 'deposit.confirmed' });
    const child = bus.create('withdrawal.failed', { reason: 'x' }, { correlationId: e.correlationId, causationId: e.id });
    expect(child).toMatchObject({ correlationId: e.id, causationId: e.id });
    expect(Object.isFrozen(e)).toBe(true);
  });
  it('dispatches synchronously by type and to onAny; unsubscribe works', () => {
    const bus = make();
    const typed = vi.fn();
    const any = vi.fn();
    const off = bus.on('deposit.confirmed', typed);
    const offAny = bus.onAny(any);
    bus.publish(bus.create('deposit.confirmed', { units: 2n }));
    bus.publish(bus.create('withdrawal.failed', { reason: 'r' }));
    expect(typed).toHaveBeenCalledTimes(1);
    expect(any).toHaveBeenCalledTimes(2);
    off();
    offAny();
    bus.publish(bus.create('deposit.confirmed', { units: 3n }));
    expect(typed).toHaveBeenCalledTimes(1);
    expect(any).toHaveBeenCalledTimes(2);
  });
});

describe('idempotent handler', () => {
  it('processes each event id once, even when re-published', () => {
    const bus = make();
    const seen: bigint[] = [];
    const h = idempotent((e: DomainEvent<'deposit.confirmed', { units: bigint }>) => seen.push(e.payload.units));
    bus.on('deposit.confirmed', h);
    const e = bus.create('deposit.confirmed', { units: 9n });
    bus.publish(e);
    bus.publish(e);
    expect(seen).toEqual([9n]);
    expect(h.processed.has(e.id)).toBe(true);
  });
  it('does not mark an event processed if the handler throws (retry-safe)', () => {
    let fail = true;
    const calls = vi.fn();
    const h = idempotent((_e: { id: string }) => { calls(); if (fail) throw new Error('boom'); });
    expect(() => h({ id: 'a' })).toThrow('boom');
    fail = false;
    h({ id: 'a' });
    h({ id: 'a' });
    expect(calls).toHaveBeenCalledTimes(2);
  });
  it('accepts an injected processed set', () => {
    const processed = new Set(['a']);
    const fn = vi.fn();
    idempotent(fn, processed)({ id: 'a' });
    expect(fn).not.toHaveBeenCalled();
  });
});
