import { isAssetCode } from '../../models/asset';
import { validateDraft, type Entry, type JournalTransaction } from '../../engines/accounting';

/** JSON-safe transaction: BigInt units are decimal strings. */
export interface StoredEntry {
  accountId: string;
  asset: string;
  side: 'debit' | 'credit';
  units: string;
}
export interface StoredTransaction extends Omit<JournalTransaction, 'entries'> {
  entries: StoredEntry[];
}

export function toStored(tx: JournalTransaction): StoredTransaction {
  return { ...tx, entries: tx.entries.map((e) => ({ ...e, units: e.units.toString() })) };
}

export function fromStored(s: StoredTransaction): JournalTransaction {
  const entries: Entry[] = s.entries.map((e) => {
    if (!/^-?\d+$/.test(e.units)) throw new Error(`Corrupt units "${e.units}" in ${s.id}`);
    if (!isAssetCode(e.asset)) throw new Error(`Corrupt asset "${e.asset}" in ${s.id}`);
    return { accountId: e.accountId as Entry['accountId'], asset: e.asset, side: e.side, units: BigInt(e.units) };
  });
  const tx: JournalTransaction = { ...s, entries };
  validateDraft(tx);
  return tx;
}
