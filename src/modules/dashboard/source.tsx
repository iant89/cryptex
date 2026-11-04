import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import type { DashboardSnapshot } from './types';
import { DASHBOARD_FIXTURE } from './fixture';

/**
 * Dashboard data port. Components only read through `useDashboardSnapshot`,
 * so a live store (Phase 2+) replaces the static fixture without component changes.
 */
export interface DashboardSource {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => DashboardSnapshot;
}

export function staticDashboardSource(snapshot: DashboardSnapshot): DashboardSource {
  return { subscribe: () => () => undefined, getSnapshot: () => snapshot };
}

const DashboardSourceContext = createContext<DashboardSource>(staticDashboardSource(DASHBOARD_FIXTURE));

export function DashboardSourceProvider({ source, children }: { source: DashboardSource; children: ReactNode }) {
  return <DashboardSourceContext.Provider value={source}>{children}</DashboardSourceContext.Provider>;
}

export function useDashboardSnapshot(): DashboardSnapshot {
  const source = useContext(DashboardSourceContext);
  return useSyncExternalStore(source.subscribe, source.getSnapshot, source.getSnapshot);
}
