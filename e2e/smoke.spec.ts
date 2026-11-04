import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('dashboard loads, navigates and inspects a transaction', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/overview\/dashboard$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Exchange Dashboard' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Key metrics' }).getByRole('heading')).toHaveCount(16);

  await page.getByRole('cell', { name: '09:32:04' }).click();
  await expect(page.getByText('Transaction TX-68412')).toBeVisible();

  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Wallets' }).click();
  await page.getByRole('link', { name: 'Hot Wallets' }).click();
  await expect(page).toHaveURL(/\/wallets\/hot$/);
  await expect(page.getByRole('complementary', { name: 'Activity' })).toBeVisible();
});

test('deep link works under vite preview', async ({ page }) => {
  await page.goto('/blockchain/gas-tracker');
  await expect(page.getByRole('heading', { level: 1, name: 'Gas Tracker' })).toBeVisible();
});

test('theme toggle persists across reload', async ({ page }) => {
  await page.goto('/overview/dashboard');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.reload();
  await expect(page.locator('[data-eui-theme="light"]').first()).toBeVisible();
});

for (const theme of ['dark', 'light'] as const) {
  for (const path of ['/overview/dashboard', '/wallets/hot']) {
    test(`axe: no serious/critical violations on ${path} (${theme})`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('cryptex.theme', t), theme);
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });
  }
}
