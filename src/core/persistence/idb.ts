import { openDB, type IDBPDatabase } from 'idb';
import type { JournalTransaction } from '../../engines/accounting';
import { DuplicateRecordError, type JournalRepository, type MetaRepository } from './ports';
import { DB_NAME, SCHEMA_VERSION, STORES, runDbMigrations, type UpgradeDb } from './schema';
import { fromStored, toStored, type StoredTransaction } from './serialization';

/** Open (and migrate) the Cryptex IndexedDB database via `idb`. */
export function openCryptexDb(name = DB_NAME, version = SCHEMA_VERSION): Promise<IDBPDatabase> {
  return openDB(name, version, {
    upgrade(db, oldVersion, newVersion) {
      runDbMigrations(db as unknown as UpgradeDb, oldVersion, newVersion ?? version);
    },
  });
}

export class IdbJournalRepository implements JournalRepository {
  readonly #db: IDBPDatabase;
  constructor(db: IDBPDatabase) {
    this.#db = db;
  }
  async append(tx: JournalTransaction): Promise<void> {
    try {
      // `add` (not `put`) so existing records can never be overwritten.
      await this.#db.add(STORES.journal, toStored(tx));
    } catch (err) {
      if ((err as { name?: unknown } | null)?.name === 'ConstraintError') throw new DuplicateRecordError(`transaction ${tx.id}`);
      throw err;
    }
  }
  async loadAll(): Promise<JournalTransaction[]> {
    const rows = (await this.#db.getAllFromIndex(STORES.journal, 'bySequence')) as StoredTransaction[];
    return rows.map(fromStored);
  }
  count(): Promise<number> {
    return this.#db.count(STORES.journal);
  }
}

export class IdbMetaRepository implements MetaRepository {
  readonly #db: IDBPDatabase;
  constructor(db: IDBPDatabase) {
    this.#db = db;
  }
  async get<T>(key: string): Promise<T | undefined> {
    return (await this.#db.get(STORES.meta, key)) as T | undefined;
  }
  async put(key: string, value: unknown): Promise<void> {
    await this.#db.put(STORES.meta, value, key);
  }
}
