import { Ledger, type JournalTransactionDraft, type PostResult } from '../engines/accounting';
import type { JournalRepository } from '../core/persistence';
import type { Clock, IdGenerator } from '../core/simulation';

/**
 * Ledger + append-only persistence. Loads history from the repository, then
 * persists each newly posted transaction. Duplicates are no-ops end to end.
 */
export class LedgerService {
  readonly ledger: Ledger;
  readonly #repo: JournalRepository;

  private constructor(ledger: Ledger, repo: JournalRepository) {
    this.ledger = ledger;
    this.#repo = repo;
  }

  static async open(deps: { clock: Clock; ids: IdGenerator; repo: JournalRepository }): Promise<LedgerService> {
    const history = await deps.repo.loadAll();
    return new LedgerService(new Ledger({ clock: deps.clock, ids: deps.ids }, history), deps.repo);
  }

  async post(draft: JournalTransactionDraft): Promise<PostResult> {
    const result = this.ledger.post(draft);
    if (!result.duplicate) await this.#repo.append(result.transaction);
    return result;
  }

  async reverse(transactionId: string, sourceEventId: string, memo?: string): Promise<PostResult> {
    const result = this.ledger.reverse(transactionId, sourceEventId, memo);
    if (!result.duplicate) await this.#repo.append(result.transaction);
    return result;
  }
}
