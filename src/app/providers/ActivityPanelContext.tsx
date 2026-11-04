import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/** UI-only state for the single right-hand panel slot (Activity panel). */
export interface ActivityPanelState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const ActivityPanelContext = createContext<ActivityPanelState | null>(null);

export function ActivityPanelProvider({ defaultOpen = true, children }: { defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const value = useMemo(() => ({ open, setOpen, toggle: () => setOpen((o) => !o) }), [open]);
  return <ActivityPanelContext.Provider value={value}>{children}</ActivityPanelContext.Provider>;
}

export function useActivityPanel(): ActivityPanelState {
  const ctx = useContext(ActivityPanelContext);
  if (!ctx) throw new Error('useActivityPanel must be used inside ActivityPanelProvider');
  return ctx;
}
