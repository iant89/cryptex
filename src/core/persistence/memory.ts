import type { JournalTransaction } from '../../engines/accounting';
import { DuplicateRecordError, type JournalRepository, type MetaRepository } from './ports';
import { fromStored, toStored, type StoredTransaction } from './serialization';

/** In-memory adapter for tests. Stores serialized copies so callers cannot mutate history. */
export class InMemoryJournalRepository implements JournalRepository {
  readonly #rows: StoredTransaction[] = [];
  readonly #ids = new Set<string>();
  readonly #sources = new Set<string>();

  async append(tx: JournalTransaction): Promise<void> {
    if (this.#ids.has(tx.id)) throw new DuplicateRecordError(`transaction ${tx.id}`);
    if (this.#sources.has(tx.sourceEventId)) throw new DuplicateRecordError(`sourceEventId ${tx.sourceEventId}`);
    this.#rows.push(structuredClone(toStored(tx)));
    this.#ids.add(tx.id);
    this.#sources.add(tx.sourceEventId);
  }
  async loadAll(): Promise<JournalTransaction[]> {
    return [...this.#rows].sort((a, b) => a.sequence - b.sequence).map((r) => fromStored(structuredClone(r)));
  }
  async count(): Promise<number> {
    return this.#rows.length;
  }
}

export class InMemoryMetaRepository implements MetaRepository {
  readonly #map = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> {
    return this.#map.has(key) ? (structuredClone(this.#map.get(key)) as T) : undefined;
  }
  async put(key: string, value: unknown): Promise<void> {
    this.#map.set(key, structuredClone(value));
  }
}
