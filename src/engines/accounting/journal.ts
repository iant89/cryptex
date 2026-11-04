import { isAssetCode, type AssetCode } from '../../models/asset';
import type { CorrelationId, EventId, SimTime, TransactionId } from '../../models/ids';
import type { Clock, IdGenerator } from '../../models/ports';
import { isValidAccount, parseAccount, type AccountId, type Side } from './accounts';

export interface Entry {
  readonly accountId: AccountId;
  readonly asset: AssetCode;
  readonly side: Side;
  /** Strictly positive base units. */
  readonly units: bigint;
}

export type TransactionKind =
  | 'opening-capital'
  | 'operational-reserve'
  | 'deposit'
  | 'withdrawal-reserve'
  | 'withdrawal-release'
  | 'withdrawal-settle'
  | 'wallet-transfer'
  | 'transfer-dispatch'
  | 'transfer-arrive'
  | 'trade'
  | 'conversion'
  | 'trading-fee'
  | 'reversal'
  | 'adjustment';

export interface JournalTransactionDraft {
  readonly kind: TransactionKind;
  /** Idempotency key: posting the same source event twice has no effect. */
  readonly sourceEventId: EventId | string;
  readonly correlationId?: CorrelationId | string;
  readonly memo?: string;
  readonly entries: readonly Entry[];
}

export interface JournalTransaction extends Required<JournalTransactionDraft> {
  readonly id: TransactionId;
  readonly occurredAt: SimTime;
  readonly sequence: number;
  readonly reversesTransactionId?: TransactionId;
}

export type LedgerErrorCode =
  | 'EMPTY'
  | 'NON_POSITIVE'
  | 'NOT_BIGINT'
  | 'UNBALANCED'
  | 'UNKNOWN_ACCOUNT'
  | 'UNKNOWN_ASSET'
  | 'MISSING_SOURCE_EVENT'
  | 'UNKNOWN_TRANSACTION'
  | 'ALREADY_REVERSED'
  | 'SOURCE_EVENT_CONFLICT'
  | 'INSUFFICIENT_CUSTOMER_BALANCE'
  | 'CORRUPT_HISTORY';

export interface LedgerErrorDetails {
  readonly accountId?: string;
  readonly asset?: AssetCode;
  /** For INSUFFICIENT_CUSTOMER_BALANCE: how far below zero the account would go (> 0). */
  readonly shortfall?: bigint;
}

export class LedgerError extends Error {
  readonly code: LedgerErrorCode;
  readonly details: LedgerErrorDetails;
  constructor(code: LedgerErrorCode, message: string, details: LedgerErrorDetails = {}) {
    super(`${code}: ${message}`);
    this.name = 'LedgerError';
    this.code = code;
    this.details = details;
  }
}

export interface PostResult {
  readonly transaction: JournalTransaction;
  /** True when the source event was already posted; nothing was appended. */
  readonly duplicate: boolean;
}

export const balanceKey = (accountId: string, asset: AssetCode): string => `${accountId}|${asset}`;

/** Validate a draft. Throws LedgerError; returns nothing on success. */
export function validateDraft(draft: JournalTransactionDraft): void {
  if (!draft.sourceEventId) throw new LedgerError('MISSING_SOURCE_EVENT', 'sourceEventId is required');
  if (draft.entries.length === 0) throw new LedgerError('EMPTY', 'transaction has no entries');
  const net = new Map<AssetCode, bigint>();
  for (const e of draft.entries) {
    if (!isAssetCode(e.asset)) throw new LedgerError('UNKNOWN_ASSET', String(e.asset));
    if (!isValidAccount(e.accountId)) throw new LedgerError('UNKNOWN_ACCOUNT', String(e.accountId));
    if (typeof e.units !== 'bigint') throw new LedgerError('NOT_BIGINT', `${e.accountId} units must be bigint`);
    if (e.units <= 0n) throw new LedgerError('NON_POSITIVE', `${e.accountId} units must be > 0`);
    if (e.side !== 'debit' && e.side !== 'credit') throw new LedgerError('UNBALANCED', `bad side ${String(e.side)}`);
    net.set(e.asset, (net.get(e.asset) ?? 0n) + (e.side === 'debit' ? e.units : -e.units));
  }
  for (const [asset, n] of net) {
    if (n !== 0n) throw new LedgerError('UNBALANCED', `${asset} debits - credits = ${n}`);
  }
}

/** Signed effect of an entry on its account, positive on the account's normal side. */
export function signedEffect(e: Entry): bigint {
  return parseAccount(e.accountId).normalSide === e.side ? e.units : -e.units;
}

/** Pure fold: balances of every (account, asset) touched by the transactions. */
export function foldBalances(transactions: Iterable<JournalTransaction>): Map<string, bigint> {
  const out = new Map<string, bigint>();
  for (const tx of transactions) {
    for (const e of tx.entries) {
      const k = balanceKey(e.accountId, e.asset);
      out.set(k, (out.get(k) ?? 0n) + signedEffect(e));
    }
  }
  return out;
}

export interface LedgerDeps {
  readonly clock: Clock;
  readonly ids: IdGenerator;
}

function freezeTx(tx: JournalTransaction): JournalTransaction {
  return Object.freeze({ ...tx, entries: Object.freeze(tx.entries.map((e) => Object.freeze({ ...e }))) });
}

function sameContent(a: JournalTransactionDraft, b: JournalTransactionDraft): boolean {
  if (a.kind !== b.kind || a.entries.length !== b.entries.length) return false;
  return a.entries.every((e, i) => {
    const f = b.entries[i];
    return !!f && e.accountId === f.accountId && e.asset === f.asset && e.side === f.side && e.units === f.units;
  });
}

/**
 * Append-only double-entry journal. Balances are always derived from entries;
 * the incremental cache is a read model that can be rebuilt and compared.
 */
export class Ledger {
  readonly #txs: JournalTransaction[] = [];
  readonly #bySource = new Map<string, JournalTransaction>();
  readonly #byId = new Map<string, JournalTransaction>();
  readonly #reversedBy = new Map<string, TransactionId>();
  readonly #cache = new Map<string, bigint>();
  readonly #deps: LedgerDeps;

  constructor(deps: LedgerDeps, history: readonly JournalTransaction[] = []) {
    this.#deps = deps;
    // Replay persisted history. Structural problems (unbalanced, duplicate id or
    // sourceEventId, out-of-order sequence) are rejected; customer overdrafts in
    // loaded history are left for reconcile() to report, never silently fixed.
    for (const tx of history) {
      validateDraft(tx);
      if (this.#byId.has(tx.id)) throw new LedgerError('CORRUPT_HISTORY', `duplicate transaction id ${tx.id}`);
      if (this.#bySource.has(tx.sourceEventId)) {
        throw new LedgerError('CORRUPT_HISTORY', `duplicate sourceEventId ${tx.sourceEventId}`);
      }
      if (tx.sequence !== this.#txs.length) {
        throw new LedgerError('CORRUPT_HISTORY', `${tx.id} has sequence ${tx.sequence}, expected ${this.#txs.length}`);
      }
      this.#append(freezeTx(tx));
    }
  }

  /**
   * Post a balanced transaction. Idempotent on sourceEventId: a repeat post
   * returns the existing transaction and appends nothing. A repeat with
   * different content is rejected as a conflict rather than silently ignored.
   */
  post(draft: JournalTransactionDraft): PostResult {
    const existing = this.#bySource.get(draft.sourceEventId);
    if (existing) {
      if (!sameContent(existing, draft)) {
        throw new LedgerError('SOURCE_EVENT_CONFLICT', `${draft.sourceEventId} already posted with different entries`);
      }
      return { transaction: existing, duplicate: true };
    }
    validateDraft(draft);
    this.#assertNoCustomerOverdraft(draft);
    return { transaction: this.#commit(draft), duplicate: false };
  }

  /** Correct a transaction by posting its mirror image. The original is never edited. */
  reverse(transactionId: TransactionId | string, sourceEventId: EventId | string, memo?: string): PostResult {
    const existing = this.#bySource.get(sourceEventId);
    if (existing) {
      if (existing.reversesTransactionId === transactionId) return { transaction: existing, duplicate: true };
      throw new LedgerError('SOURCE_EVENT_CONFLICT', `${sourceEventId} already used`);
    }
    const original = this.#byId.get(transactionId);
    if (!original) throw new LedgerError('UNKNOWN_TRANSACTION', transactionId);
    if (this.#reversedBy.has(transactionId)) throw new LedgerError('ALREADY_REVERSED', transactionId);
    const draft: JournalTransactionDraft = {
      kind: 'reversal',
      sourceEventId,
      correlationId: original.correlationId,
      memo: memo ?? `Reversal of ${original.id}`,
      entries: original.entries.map((e) => ({ ...e, side: e.side === 'debit' ? 'credit' : 'debit' })),
    };
    validateDraft(draft);
    this.#assertNoCustomerOverdraft(draft);
    return { transaction: this.#commit(draft, original.id), duplicate: false };
  }

  /**
   * Customer liability accounts (available and reserved) may never go below
   * zero. Computes each touched account's post-transaction balance and rejects
   * the whole draft if any would be negative.
   */
  #assertNoCustomerOverdraft(draft: JournalTransactionDraft): void {
    const delta = new Map<string, { accountId: string; asset: AssetCode; units: bigint }>();
    for (const e of draft.entries) {
      if (parseAccount(e.accountId).category !== 'customer-liability') continue;
      const k = balanceKey(e.accountId, e.asset);
      const d = delta.get(k) ?? { accountId: e.accountId, asset: e.asset, units: 0n };
      d.units += signedEffect(e);
      delta.set(k, d);
    }
    for (const [k, d] of delta) {
      const after = (this.#cache.get(k) ?? 0n) + d.units;
      if (after < 0n) {
        throw new LedgerError('INSUFFICIENT_CUSTOMER_BALANCE', `${d.accountId} ${d.asset} short by ${-after}`, {
          accountId: d.accountId,
          asset: d.asset,
          shortfall: -after,
        });
      }
    }
  }

  #commit(draft: JournalTransactionDraft, reverses?: TransactionId): JournalTransaction {
    const tx: JournalTransaction = {
      id: this.#deps.ids.next('tx') as TransactionId,
      occurredAt: this.#deps.clock.now(),
      sequence: this.#txs.length,
      kind: draft.kind,
      sourceEventId: draft.sourceEventId,
      correlationId: draft.correlationId ?? draft.sourceEventId,
      memo: draft.memo ?? '',
      entries: draft.entries,
      ...(reverses ? { reversesTransactionId: reverses } : {}),
    };
    const frozen = freezeTx(tx);
    this.#append(frozen);
    return frozen;
  }

  #append(tx: JournalTransaction): void {
    this.#txs.push(tx);
    this.#bySource.set(tx.sourceEventId, tx);
    this.#byId.set(tx.id, tx);
    if (tx.reversesTransactionId) this.#reversedBy.set(tx.reversesTransactionId, tx.id);
    for (const e of tx.entries) {
      const k = balanceKey(e.accountId, e.asset);
      this.#cache.set(k, (this.#cache.get(k) ?? 0n) + signedEffect(e));
    }
  }

  /** Read-only snapshot of the journal in posting order. */
  transactions(): readonly JournalTransaction[] {
    return Object.freeze([...this.#txs]);
  }

  get size(): number {
    return this.#txs.length;
  }

  getTransaction(id: TransactionId | string): JournalTransaction | undefined {
    return this.#byId.get(id);
  }

  findBySourceEvent(sourceEventId: EventId | string): JournalTransaction | undefined {
    return this.#bySource.get(sourceEventId);
  }

  reversedBy(id: TransactionId | string): TransactionId | undefined {
    return this.#reversedBy.get(id);
  }

  /** Authoritative balance: a fold over all entries (normal side positive). */
  balanceOf(accountId: AccountId | string, asset: AssetCode): bigint {
    let total = 0n;
    for (const tx of this.#txs) {
      for (const e of tx.entries) if (e.accountId === accountId && e.asset === asset) total += signedEffect(e);
    }
    return total;
  }

  /** Incrementally maintained read model. Must always equal the fold. */
  cachedBalances(): ReadonlyMap<string, bigint> {
    return new Map(this.#cache);
  }

  /** Per asset: Σdebits − Σcredits over the whole journal (always 0 if healthy). */
  trialBalance(): Map<AssetCode, bigint> {
    return trialBalance(this.#txs);
  }
}

export function trialBalance(transactions: Iterable<JournalTransaction>): Map<AssetCode, bigint> {
  const out = new Map<AssetCode, bigint>();
  for (const tx of transactions) {
    for (const e of tx.entries) out.set(e.asset, (out.get(e.asset) ?? 0n) + (e.side === 'debit' ? e.units : -e.units));
  }
  return out;
}
