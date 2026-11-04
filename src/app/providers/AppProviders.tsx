import type { ReactNode } from 'react';
import { ThemeProvider } from '@enterprise-ui/react';
import { ThemePreferenceProvider } from '../theme/ThemePreference';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemePreferenceProvider>
      {(theme) => (
        <ThemeProvider theme={theme} density="compact" className="cx-theme-root">
          {children}
        </ThemeProvider>
      )}
    </ThemePreferenceProvider>
  );
}
