import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../../test/renderApp';
import { DEFAULT_THEME, THEME_STORAGE_KEY, readStoredTheme } from './ThemePreference';

const themeRoot = () => document.querySelector('[data-eui-theme]');

beforeEach(() => localStorage.clear());

describe('theme system', () => {
  it('defaults to dark', async () => {
    expect(DEFAULT_THEME).toBe('dark');
    renderApp('/wallets/hot');
    await screen.findByRole('heading', { level: 1, name: 'Hot Wallets' });
    expect(themeRoot()).toHaveAttribute('data-eui-theme', 'dark');
    expect(document.querySelector('img.cx-header-logo')).toHaveAttribute('src', '/logo-dark.svg');
  });

  it('switches without reload and persists the choice', async () => {
    const user = userEvent.setup();
    const { unmount } = renderApp('/wallets/hot');
    await user.click(await screen.findByRole('button', { name: 'Switch to light theme' }));
    expect(themeRoot()).toHaveAttribute('data-eui-theme', 'light');
    expect(document.querySelector('img.cx-header-logo')).toHaveAttribute('src', '/logo-light.svg');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    unmount();

    renderApp('/wallets/hot');
    await screen.findByRole('button', { name: 'Switch to dark theme' });
    expect(themeRoot()).toHaveAttribute('data-eui-theme', 'light');
  });

  it('ignores invalid stored values', () => {
    expect(readStoredTheme({ getItem: () => 'neon' })).toBe('dark');
    expect(readStoredTheme({ getItem: () => 'light' })).toBe('light');
    expect(readStoredTheme(undefined)).toBe('dark');
  });
});
