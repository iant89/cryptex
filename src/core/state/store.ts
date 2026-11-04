/**
 * Minimal external store (PM decision: custom stores). React subscribes later
 * via useSyncExternalStore(store.subscribe, store.getState).
 */
export interface Store<S> {
  getState(): S;
  setState(update: S | ((prev: S) => S)): void;
  subscribe(listener: () => void): () => void;
  /** Group several updates into one notification. */
  batch(fn: () => void): void;
}

export function createStore<S>(initial: S): Store<S> {
  let state = initial;
  let depth = 0;
  let dirty = false;
  const listeners = new Set<() => void>();
  const notify = () => {
    dirty = false;
    for (const l of [...listeners]) l();
  };
  return {
    getState: () => state,
    setState(update) {
      const next = typeof update === 'function' ? (update as (p: S) => S)(state) : update;
      if (Object.is(next, state)) return;
      state = next;
      if (depth > 0) dirty = true;
      else notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    batch(fn) {
      depth++;
      try {
        fn();
      } finally {
        depth--;
        if (depth === 0 && dirty) notify();
      }
    },
  };
}

/** Derived read-only view; recomputes only when the source state changes. */
export function select<S, T>(store: Store<S>, selector: (s: S) => T): () => T {
  let last: S | undefined;
  let value: T;
  let init = false;
  return () => {
    const s = store.getState();
    if (!init || !Object.is(s, last)) {
      value = selector(s);
      last = s;
      init = true;
    }
    return value;
  };
}
