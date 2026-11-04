import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { ManualClock, SeededRng, SequentialIdGenerator } from './index';

describe('ManualClock', () => {
  it('starts, advances, and never goes backwards', () => {
    const c = new ManualClock();
    expect(c.now()).toBe(0);
    expect(c.advance(250)).toBe(250);
    c.set(1000);
    expect(c.now()).toBe(1000);
    expect(() => c.set(999)).toThrow(RangeError);
    expect(() => c.advance(-1)).toThrow(RangeError);
    expect(() => c.advance(0.5)).toThrow(RangeError);
    expect(() => new ManualClock(-1)).toThrow(RangeError);
  });
});

describe('SeededRng (xoshiro128**)', () => {
  it('same seed → identical sequences; different seeds differ', () => {
    const seq = (seed: number) => { const r = new SeededRng(seed); return Array.from({ length: 50 }, () => r.nextUint32()); };
    expect(seq(42)).toEqual(seq(42));
    expect(seq(42)).not.toEqual(seq(43));
    expect(seq(0).some((x) => x !== 0)).toBe(true);
  });
  it('is pinned to known output (guards accidental algorithm changes)', () => {
    const r = new SeededRng(1);
    const first = [r.nextUint32(), r.nextUint32(), r.nextUint32()];
    expect(first).toMatchInlineSnapshot(`
      [
        2442144158,
        3238099751,
        3819917871,
      ]
    `);
  });
  it('ranges are respected', () => {
    fc.assert(fc.property(fc.integer(), fc.integer({ min: -1000, max: 1000 }), fc.integer({ min: 0, max: 1000 }), (seed, min, span) => {
      const r = new SeededRng(seed);
      const f = r.nextFloat();
      expect(f >= 0 && f < 1).toBe(true);
      const n = r.nextInt(min, min + span);
      expect(n >= min && n <= min + span).toBe(true);
      const b = r.nextBigInt(10n ** 30n);
      expect(b >= 0n && b < 10n ** 30n).toBe(true);
      expect(r.nextUint32()).toBeLessThan(2 ** 32);
    }));
  });
  it('state can be saved and restored for replay', () => {
    const a = new SeededRng(7);
    a.nextUint32();
    const b = SeededRng.fromState(a.getState());
    expect(Array.from({ length: 10 }, () => b.nextUint32())).toEqual(Array.from({ length: 10 }, () => a.nextUint32()));
  });
  it('rejects bad arguments', () => {
    const r = new SeededRng(1);
    expect(() => new SeededRng(1.5)).toThrow(RangeError);
    expect(() => r.nextInt(5, 4)).toThrow(RangeError);
    expect(() => r.nextBigInt(0n)).toThrow(RangeError);
  });
});

describe('SequentialIdGenerator', () => {
  it('is deterministic per prefix', () => {
    const g = new SequentialIdGenerator('s');
    expect([g.next('tx'), g.next('tx'), g.next('evt')]).toEqual(['tx-s-000001', 'tx-s-000002', 'evt-s-000001']);
    expect(new SequentialIdGenerator().next('x')).toBe('x-sim-000001');
  });
});
