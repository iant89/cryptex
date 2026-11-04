import type { StoredTransaction } from './serialization';

/** IndexedDB / export schema version. Bump together with a new migration. */
export const SCHEMA_VERSION = 1;
export const DB_NAME = 'cryptex';
export const STORES = { journal: 'journal', meta: 'meta' } as const;

/** Minimal surface of an IDB upgrade transaction used by migrations. */
export interface UpgradeDb {
  createObjectStore(name: string, options?: { keyPath?: string }): {
    createIndex(name: string, keyPath: string, options?: { unique?: boolean }): unknown;
  };
}

export interface DbMigration {
  readonly version: number;
  readonly description: string;
  upgrade(db: UpgradeDb): void;
}

/** Ordered IndexedDB schema migrations; index i upgrades to version i + 1. */
export const DB_MIGRATIONS: readonly DbMigration[] = [
  {
    version: 1,
    description: 'journal (append-only) + meta stores',
    upgrade(db) {
      const journal = db.createObjectStore(STORES.journal, { keyPath: 'id' });
      journal.createIndex('bySourceEventId', 'sourceEventId', { unique: true });
      journal.createIndex('bySequence', 'sequence', { unique: true });
      db.createObjectStore(STORES.meta);
    },
  },
];

export function runDbMigrations(db: UpgradeDb, oldVersion: number, newVersion: number, migrations = DB_MIGRATIONS): void {
  for (const m of migrations) if (m.version > oldVersion && m.version <= newVersion) m.upgrade(db);
}

/** Versioned export/import envelope (BigInt as decimal strings). */
export interface ExportEnvelope {
  readonly format: 'cryptex-export';
  readonly schemaVersion: number;
  readonly transactions: StoredTransaction[];
  readonly meta: Record<string, unknown>;
}

export interface EnvelopeMigration {
  readonly from: number;
  readonly to: number;
  migrate(env: ExportEnvelope): ExportEnvelope;
}

/** Data migrations for export envelopes; empty at v1. */
export const ENVELOPE_MIGRATIONS: readonly EnvelopeMigration[] = [];

export function migrateEnvelope(
  env: ExportEnvelope,
  target = SCHEMA_VERSION,
  migrations: readonly EnvelopeMigration[] = ENVELOPE_MIGRATIONS,
): ExportEnvelope {
  if (env.format !== 'cryptex-export') throw new Error('Not a Cryptex export');
  if (env.schemaVersion > target) throw new Error(`Export v${env.schemaVersion} is newer than supported v${target}`);
  let cur = env;
  while (cur.schemaVersion < target) {
    const m = migrations.find((x) => x.from === cur.schemaVersion);
    if (!m) throw new Error(`No migration from v${cur.schemaVersion}`);
    cur = m.migrate(cur);
    if (cur.schemaVersion !== m.to) throw new Error(`Migration ${m.from}->${m.to} produced v${cur.schemaVersion}`);
  }
  return cur;
}
