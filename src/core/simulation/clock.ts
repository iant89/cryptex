import type { Clock } from '../../models/ports';
import type { SimTime } from '../../models/ids';

/** Deterministic simulation clock, advanced explicitly by the simulation loop or tests. */
export class ManualClock implements Clock {
  #now: SimTime;
  constructor(start: SimTime = 0) {
    if (!Number.isSafeInteger(start) || start < 0) throw new RangeError('start must be a non-negative safe integer');
    this.#now = start;
  }
  now(): SimTime {
    return this.#now;
  }
  advance(ms: number): SimTime {
    if (!Number.isSafeInteger(ms) || ms < 0) throw new RangeError('advance must be a non-negative safe integer');
    this.#now += ms;
    return this.#now;
  }
  set(t: SimTime): void {
    if (!Number.isSafeInteger(t) || t < this.#now) throw new RangeError('time cannot move backwards');
    this.#now = t;
  }
}
