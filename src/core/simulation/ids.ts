import type { IdGenerator } from '../../models/ports';

/** Deterministic id generator: `<prefix>-<namespace>-<counter>` per prefix. */
export class SequentialIdGenerator implements IdGenerator {
  readonly #counters = new Map<string, number>();
  readonly #namespace: string;
  constructor(namespace = 'sim') {
    this.#namespace = namespace;
  }
  next(prefix: string): string {
    const n = (this.#counters.get(prefix) ?? 0) + 1;
    this.#counters.set(prefix, n);
    return `${prefix}-${this.#namespace}-${n.toString().padStart(6, '0')}`;
  }
}
