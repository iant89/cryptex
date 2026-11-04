import type { ReactNode } from 'react';
import { ThemeProvider } from '@enterprise-ui/react';
import { ActivityPanelProvider } from './ActivityPanelContext';
import { ThemePreferenceProvider } from '../theme/ThemePreference';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemePreferenceProvider>
      {(theme) => (
        <ThemeProvider theme={theme} density="compact" className="cx-theme-root">
          <ActivityPanelProvider>{children}</ActivityPanelProvider>
        </ThemeProvider>
      )}
    </ThemePreferenceProvider>
  );
}
