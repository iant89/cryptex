import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { renderApp } from '../../test/renderApp';
import { AppProviders } from '../../app/providers/AppProviders';
import { routes } from '../../app/routes';
import { DASHBOARD_FIXTURE } from './fixture';
import { DashboardSourceProvider, type DashboardSource } from './source';
import type { DashboardSnapshot } from './types';

const SPEC_METRICS = [
  'Total customers', 'Active customers (24h)', 'Total exchange assets', 'Customer liabilities', 'Exchange reserves',
  'Total trading volume', '24h trading volume', 'Trading fees collected', 'Total deposits', 'Total withdrawals',
  'Pending transactions', 'Failed transactions', 'Hot wallet utilization', 'Cold wallet reserves',
  'Withdrawal liquidity', 'Network health',
];

describe('Exchange Dashboard', () => {
  it('has a slot for every §5.1 metric', async () => {
    renderApp('/overview/dashboard');
    const metrics = await screen.findByRole('region', { name: 'Key metrics' });
    for (const label of SPEC_METRICS) expect(within(metrics).getByRole('heading', { name: label })).toBeInTheDocument();
    expect(within(metrics).getAllByRole('heading')).toHaveLength(16);
    expect(within(metrics).getByText('$412.8M')).toBeInTheDocument();
  });

  it('renders the live feed in an ENTERPRISE-UI table with the row flash on new rows', async () => {
    renderApp('/overview/dashboard');
    const table = await screen.findByRole('table', { name: 'Live transaction feed' });
    expect(within(table).getAllByRole('row')).toHaveLength(DASHBOARD_FIXTURE.feed.length + 1);
    expect(within(table).getByRole('link', { name: 'C-11877' })).toHaveAttribute('href', '/exchange/customers?id=C-11877');
    expect(within(table).getByText('12,400.0000')).toBeInTheDocument();
    for (const f of ['Type', 'Asset', 'Status', 'Pause feed']) expect(screen.getByRole('button', { name: f })).toBeDisabled();
  });

  it('closes the Activity panel on the Dashboard by default and has no Customize widgets button', async () => {
    renderApp('/overview/dashboard');
    await screen.findByRole('heading', { level: 1, name: 'Exchange Dashboard' });
    expect(screen.queryByRole('complementary', { name: 'Activity' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /customize widgets/i })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Activity panel' }));
    expect(screen.getByRole('complementary', { name: 'Activity' })).toBeInTheDocument();
  });

  it('opens transaction detail in place of the System Map', async () => {
    const user = userEvent.setup();
    renderApp('/overview/dashboard');
    expect(await screen.findByRole('group', { name: 'Flow of funds' })).toBeInTheDocument();
    await user.click(screen.getByRole('cell', { name: '09:32:04' }));
    expect(await screen.findByText('Transaction TX-68412')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Flow of funds' })).not.toBeInTheDocument();
    expect(screen.getByText('850.00 USDT')).toBeInTheDocument();
    expect(screen.getByText('Broadcast to mempool')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.getByRole('group', { name: 'Flow of funds' })).toBeInTheDocument();
  });

  it('opens a node operational view from the System Map', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/overview/dashboard');
    await user.click(await screen.findByRole('button', { name: /^Hot Wallets: \$23\.6M/ }));
    expect(router.state.location.pathname).toBe('/wallets/hot');
  });

  it('reads from a swappable source without component changes', () => {
    let snap: DashboardSnapshot = DASHBOARD_FIXTURE;
    const listeners = new Set<() => void>();
    const source: DashboardSource = {
      subscribe: (l) => (listeners.add(l), () => listeners.delete(l)),
      getSnapshot: () => snap,
    };
    const router = createMemoryRouter(routes, { initialEntries: ['/overview/dashboard'] });
    render(
      <AppProviders>
        <DashboardSourceProvider source={source}>
          <RouterProvider router={router} />
        </DashboardSourceProvider>
      </AppProviders>,
    );
    expect(screen.getByText('48,213')).toBeInTheDocument();
    act(() => {
      snap = { ...snap, metrics: snap.metrics.map((m) => (m.id === 'totalCustomers' ? { ...m, value: { kind: 'count', value: 50_000 } } : m)) };
      listeners.forEach((l) => l());
    });
    expect(screen.getByText('50,000')).toBeInTheDocument();
  });
});
