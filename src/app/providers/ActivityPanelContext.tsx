import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/** UI-only state for the single right-hand panel slot (Activity panel). */
export interface ActivityPanelState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const ActivityPanelContext = createContext<ActivityPanelState | null>(null);

export type ActivityScope = 'dashboard' | 'page';

/**
 * Default (pending Ian's confirmation, README Q3): closed on the Dashboard,
 * open on other pages. A user choice is remembered per scope for the session.
 */
export const ACTIVITY_DEFAULT_OPEN: Record<ActivityScope, boolean> = { dashboard: false, page: true };

export function ActivityPanelProvider({ scope, children }: { scope: ActivityScope; children: ReactNode }) {
  const [choice, setChoice] = useState<Partial<Record<ActivityScope, boolean>>>({});
  const open = choice[scope] ?? ACTIVITY_DEFAULT_OPEN[scope];
  const setOpen = useCallback((next: boolean) => setChoice((c) => (c[scope] === next ? c : { ...c, [scope]: next })), [scope]);
  const value = useMemo(() => ({ open, setOpen, toggle: () => setOpen(!open) }), [open, setOpen]);
  return <ActivityPanelContext.Provider value={value}>{children}</ActivityPanelContext.Provider>;
}

export function useActivityPanel(): ActivityPanelState {
  const ctx = useContext(ActivityPanelContext);
  if (!ctx) throw new Error('useActivityPanel must be used inside ActivityPanelProvider');
  return ctx;
}
