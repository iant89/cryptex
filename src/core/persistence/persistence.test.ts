import 'fake-indexeddb/auto';
import type { JournalTransaction } from '../../engines/accounting';
import { describe, expect, it } from 'vitest';
import { parseAmount } from '../../models';
import { Accounts, P } from '../../test/accounting';
import { makeLedger } from '../../test/fixtures';
import {
  DB_MIGRATIONS, DuplicateRecordError, ENVELOPE_MIGRATIONS, IdbJournalRepository, IdbMetaRepository,
  InMemoryJournalRepository, InMemoryMetaRepository, SCHEMA_VERSION, fromStored, migrateEnvelope,
  openCryptexDb, runDbMigrations, toStored, type ExportEnvelope, type JournalRepository, type UpgradeDb,
} from './index';

function sample() {
  const { ledger } = makeLedger();
  ledger.post(P.deposit({ sourceEventId: 'd' }, 'c', Accounts.hotWallet('h'), parseAmount('ETH', '123456789.123456789123456789')));
  ledger.post(P.walletTransfer({ sourceEventId: 't' }, { from: Accounts.hotWallet('h'), to: Accounts.coldWallet('k'), amount: parseAmount('ETH', '1'), networkFee: parseAmount('ETH', '0.0001') }));
  return ledger;
}

const contract = (name: string, make: () => Promise<JournalRepository>) =>
  describe(`${name} JournalRepository`, () => {
    it('round-trips BigInt exactly, in sequence order', async () => {
      const repo = await make();
      const ledger = sample();
      for (const tx of [...ledger.transactions()].reverse()) await repo.append(tx);
      const loaded = await repo.loadAll();
      expect(loaded).toEqual([...ledger.transactions()]);
      expect(await repo.count()).toBe(2);
    });
    it('is append-only: duplicate ids/source events are rejected', async () => {
      const repo = await make();
      const [tx] = sample().transactions();
      await repo.append(tx!);
      await expect(repo.append(tx!)).rejects.toBeInstanceOf(DuplicateRecordError);
      await expect(repo.append({ ...tx!, id: 'tx-other' as JournalTransaction['id'], sequence: 99 })).rejects.toBeInstanceOf(DuplicateRecordError);
      expect(await repo.count()).toBe(1);
    });
  });

contract('in-memory', async () => new InMemoryJournalRepository());
let n = 0;
contract('idb', async () => new IdbJournalRepository(await openCryptexDb(`test-${++n}`)));

describe('meta repositories', () => {
  it.each([
    ['memory', async () => new InMemoryMetaRepository()],
    ['idb', async () => new IdbMetaRepository(await openCryptexDb(`meta-${++n}`))],
  ])('%s get/put', async (_n, make) => {
    const m = await make();
    expect(await m.get('x')).toBeUndefined();
    await m.put('x', { ids: ['a'], seed: 1 });
    expect(await m.get('x')).toEqual({ ids: ['a'], seed: 1 });
  });
});

describe('schema and migrations', () => {
  it('version constant matches the ordered migration list', () => {
    expect(SCHEMA_VERSION).toBe(1);
    expect(DB_MIGRATIONS.map((m) => m.version)).toEqual(Array.from({ length: SCHEMA_VERSION }, (_, i) => i + 1));
    expect(ENVELOPE_MIGRATIONS).toEqual([]);
  });
  it('runDbMigrations only runs pending steps', () => {
    const created: string[] = [];
    const db: UpgradeDb = { createObjectStore: (name) => { created.push(name); return { createIndex: () => undefined }; } };
    runDbMigrations(db, 1, 1);
    expect(created).toEqual([]);
    runDbMigrations(db, 0, 1);
    expect(created).toEqual(['journal', 'meta']);
    const steps: number[] = [];
    runDbMigrations(db, 1, 3, [1, 2, 3].map((v) => ({ version: v, description: '', upgrade: () => steps.push(v) })));
    expect(steps).toEqual([2, 3]);
  });
  it('opened IDB has the expected stores and version', async () => {
    const db = await openCryptexDb(`schema-${++n}`);
    expect(db.version).toBe(SCHEMA_VERSION);
    expect([...db.objectStoreNames].sort()).toEqual(['journal', 'meta']);
  });
  it('migrates export envelopes step by step and rejects bad ones', () => {
    const env: ExportEnvelope = { format: 'cryptex-export', schemaVersion: 1, transactions: [], meta: {} };
    expect(migrateEnvelope(env)).toBe(env);
    const v0 = { ...env, schemaVersion: 0 };
    const m = [{ from: 0, to: 1, migrate: (e: ExportEnvelope) => ({ ...e, schemaVersion: 1, meta: { migrated: true } }) }];
    expect(migrateEnvelope(v0, 1, m).meta).toEqual({ migrated: true });
    expect(() => migrateEnvelope(v0, 1, [])).toThrow(/No migration/);
    expect(() => migrateEnvelope({ ...env, schemaVersion: 2 })).toThrow(/newer/);
    expect(() => migrateEnvelope({ ...env, format: 'x' } as unknown as ExportEnvelope)).toThrow(/Not a Cryptex/);
    expect(() => migrateEnvelope(v0, 1, [{ from: 0, to: 1, migrate: (e) => e }])).toThrow(/produced/);
  });
  it('serialization rejects corrupt rows', () => {
    const [tx] = sample().transactions();
    const s = toStored(tx!);
    expect(JSON.parse(JSON.stringify(s)).entries[0].units).toMatch(/^\d+$/);
    expect(fromStored(JSON.parse(JSON.stringify(s)))).toEqual(tx);
    expect(() => fromStored({ ...s, entries: [{ ...s.entries[0]!, units: '1.5' }, s.entries[1]!] })).toThrow(/Corrupt units/);
    expect(() => fromStored({ ...s, entries: [{ ...s.entries[0]!, asset: 'FOO' }, s.entries[1]!] })).toThrow(/Corrupt asset/);
    expect(() => fromStored({ ...s, entries: [s.entries[0]!] })).toThrow(/UNBALANCED/);
  });
});
