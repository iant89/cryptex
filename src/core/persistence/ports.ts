import type { JournalTransaction } from '../../engines/accounting';

/**
 * Append-only journal storage port. There is deliberately no update or delete:
 * corrections are reversing transactions.
 */
export interface JournalRepository {
  /** Append one transaction. Rejects if its id or sourceEventId already exists. */
  append(tx: JournalTransaction): Promise<void>;
  /** All transactions in posting (sequence) order. */
  loadAll(): Promise<JournalTransaction[]>;
  count(): Promise<number>;
}

/** Small key/value store for metadata (processed event ids, RNG state, ...). */
export interface MetaRepository {
  get<T = unknown>(key: string): Promise<T | undefined>;
  put(key: string, value: unknown): Promise<void>;
}

export class DuplicateRecordError extends Error {
  constructor(what: string) {
    super(`Duplicate record: ${what}`);
    this.name = 'DuplicateRecordError';
  }
}
