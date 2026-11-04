import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type CryptexTheme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'cryptex.theme';
/** Approved by Ian: dark by default. */
export const DEFAULT_THEME: CryptexTheme = 'dark';

export function readStoredTheme(storage: Pick<Storage, 'getItem'> | undefined = safeStorage()): CryptexTheme {
  const v = storage?.getItem(THEME_STORAGE_KEY);
  return v === 'light' || v === 'dark' ? v : DEFAULT_THEME;
}

function safeStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

interface ThemePreferenceValue {
  theme: CryptexTheme;
  setTheme: (theme: CryptexTheme) => void;
  toggleTheme: () => void;
}

const ThemePreferenceContext = createContext<ThemePreferenceValue | null>(null);

/** UI-only theme preference, persisted in localStorage. Applies without reload. */
export function ThemePreferenceProvider({ children }: { children: (theme: CryptexTheme) => ReactNode }) {
  const [theme, setThemeState] = useState<CryptexTheme>(() => readStoredTheme());
  const setTheme = useCallback((next: CryptexTheme) => {
    setThemeState(next);
    try {
      safeStorage()?.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage unavailable: keep in-memory preference */
    }
  }, []);
  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark') }),
    [theme, setTheme],
  );
  return <ThemePreferenceContext.Provider value={value}>{children(theme)}</ThemePreferenceContext.Provider>;
}

export function useThemePreference(): ThemePreferenceValue {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) throw new Error('useThemePreference must be used inside ThemePreferenceProvider');
  return ctx;
}
