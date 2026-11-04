import type { CorrelationId, EventId, SimTime } from '../../models/ids';
import type { Clock, IdGenerator } from '../../models/ports';

export interface DomainEvent<T extends string = string, P = unknown> {
  readonly id: EventId;
  readonly type: T;
  readonly occurredAt: SimTime;
  readonly correlationId: CorrelationId;
  readonly causationId?: EventId;
  readonly payload: P;
}

/** Map of event type → payload; extended by later phases. */
export type EventMap = Record<string, unknown>;
export type EventOf<M extends EventMap, K extends keyof M & string = keyof M & string> = {
  [T in K]: DomainEvent<T, M[T]>;
}[K];
export type Handler<E> = (event: E) => void;

/** In-process, synchronous, typed event bus (SPEC §19.2). */
export class EventBus<M extends EventMap> {
  readonly #handlers = new Map<string, Set<Handler<never>>>();
  readonly #any = new Set<Handler<EventOf<M>>>();
  readonly #deps: { clock: Clock; ids: IdGenerator };

  constructor(deps: { clock: Clock; ids: IdGenerator }) {
    this.#deps = deps;
  }

  /** Build a new event with injected id and time. */
  create<K extends keyof M & string>(
    type: K,
    payload: M[K],
    opts: { correlationId?: string; causationId?: EventId } = {},
  ): DomainEvent<K, M[K]> {
    const id = this.#deps.ids.next('evt') as EventId;
    return Object.freeze({
      id,
      type,
      occurredAt: this.#deps.clock.now(),
      correlationId: (opts.correlationId ?? id) as CorrelationId,
      ...(opts.causationId ? { causationId: opts.causationId } : {}),
      payload,
    });
  }

  on<K extends keyof M & string>(type: K, handler: Handler<DomainEvent<K, M[K]>>): () => void {
    const set = this.#handlers.get(type) ?? new Set();
    set.add(handler as Handler<never>);
    this.#handlers.set(type, set);
    return () => set.delete(handler as Handler<never>);
  }

  onAny(handler: Handler<EventOf<M>>): () => void {
    this.#any.add(handler);
    return () => this.#any.delete(handler);
  }

  publish<K extends keyof M & string>(event: DomainEvent<K, M[K]>): void {
    for (const h of [...(this.#handlers.get(event.type) ?? [])]) (h as Handler<DomainEvent<K, M[K]>>)(event);
    for (const h of [...this.#any]) h(event as unknown as EventOf<M>);
  }
}

/**
 * Wrap a handler so each event id is processed at most once (SPEC §9, §20.6).
 * The processed-id set is injectable so it can be persisted.
 */
export function idempotent<E extends { readonly id: string }>(
  handler: Handler<E>,
  processed: Set<string> = new Set(),
): Handler<E> & { readonly processed: ReadonlySet<string> } {
  const wrapped = (event: E) => {
    if (processed.has(event.id)) return;
    handler(event);
    processed.add(event.id);
  };
  return Object.assign(wrapped, { processed });
}
