import type { ReactNode } from 'react';
import { ThemeProvider } from '@enterprise-ui/react';
import { ActivityPanelProvider } from './ActivityPanelContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme="dark" density="compact" className="cx-theme-root">
      <ActivityPanelProvider>{children}</ActivityPanelProvider>
    </ThemeProvider>
  );
}
