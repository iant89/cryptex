import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/renderApp';
import { ALL_NAV_ITEMS, NAV_GROUPS } from './navigation';

const nav = () => screen.getByRole('navigation', { name: 'Main navigation' });

describe('app shell', () => {
  it('redirects / to the Exchange Dashboard', async () => {
    const { router } = renderApp('/');
    expect(await screen.findByRole('heading', { level: 1, name: 'Exchange Dashboard' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/overview/dashboard');
  });

  it('renders all 8 nav groups and a persistent simulation badge', async () => {
    renderApp('/wallets/hot');
    await screen.findByRole('heading', { level: 1, name: 'Hot Wallets' });
    for (const g of NAV_GROUPS) {
      expect(within(nav()).getByRole('button', { name: g.label })).toBeInTheDocument();
    }
    expect(screen.getByTestId('simulation-badge')).toHaveTextContent(/Simulation: Running/);
  });

  it('highlights the active route', async () => {
    renderApp('/wallets/hot');
    const link = await within(nav()).findByRole('link', { name: 'Hot Wallets' });
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(within(nav()).getByRole('link', { name: 'Cold Storage' })).not.toHaveAttribute('aria-current');
  });

  it('switches routes from the side navigation', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/wallets/hot');
    await user.click(await within(nav()).findByRole('link', { name: 'Cold Storage' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Cold Storage' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/wallets/cold-storage');
  });

  it('reaches a collapsed group by keyboard', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/overview/dashboard');
    const group = await within(nav()).findByRole('button', { name: 'Simulation' });
    expect(group).toHaveAttribute('aria-expanded', 'false');
    group.focus();
    await user.keyboard('{Enter}');
    expect(group).toHaveAttribute('aria-expanded', 'true');
    within(nav()).getByRole('link', { name: 'Scenario Builder' }).focus();
    await user.keyboard('{Enter}');
    expect(router.state.location.pathname).toBe('/simulation/scenario-builder');
  });

  it.each(ALL_NAV_ITEMS.map((i) => [i.path, i.label]))('deep link %s renders its page', async (path, label) => {
    renderApp(path);
    expect(await screen.findByRole('heading', { level: 1, name: label })).toBeInTheDocument();
  });

  it('renders a 404 for unknown routes', async () => {
    renderApp('/does/not/exist');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('closes and reopens the Activity panel', async () => {
    const user = userEvent.setup();
    renderApp('/wallets/hot');
    expect(await screen.findByRole('complementary', { name: 'Activity' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close activity panel' }));
    expect(screen.queryByRole('complementary', { name: 'Activity' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Activity panel, 7 alerts/ }));
    expect(screen.getByRole('complementary', { name: 'Activity' })).toBeInTheDocument();
  });

  it('changes the simulation speed', async () => {
    const user = userEvent.setup();
    renderApp('/wallets/hot');
    const speed = await screen.findByRole('group', { name: 'Simulation speed' });
    await user.click(within(speed).getByRole('button', { name: 'Pause' }));
    expect(within(speed).getByRole('button', { name: 'Pause' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('simulation-badge')).toHaveTextContent(/Simulation: Paused/);
  });
});

it('always shows the simulation-only notice', async () => {
  renderApp('/overview/dashboard');
  expect(await screen.findByText(/simulation only/i)).toBeInTheDocument();
});
