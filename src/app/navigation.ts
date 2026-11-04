/**
 * Primary navigation (SPEC §4). Single source of truth for the side navigation,
 * the router and the breadcrumbs.
 */
export interface NavItem {
  /** Stable id, also used as the SideNavigation item id. */
  id: string;
  label: string;
  /** Absolute route path. */
  path: string;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const group = (id: string, label: string, items: [string, string][]): NavGroup => ({
  id,
  label,
  items: items.map(([slug, itemLabel]) => ({ id: `${id}/${slug}`, label: itemLabel, path: `/${id}/${slug}` })),
});

export const NAV_GROUPS: readonly NavGroup[] = [
  group('overview', 'Overview', [
    ['dashboard', 'Exchange Dashboard'],
    ['live-activity', 'Live Activity'],
    ['system-health', 'System Health'],
  ]),
  group('exchange', 'Exchange', [
    ['customers', 'Customers'],
    ['trading', 'Trading'],
    ['order-books', 'Order Books'],
    ['markets', 'Markets'],
    ['liquidity', 'Liquidity'],
    ['internal-ledger', 'Internal Ledger'],
  ]),
  group('wallets', 'Wallets', [
    ['overview', 'Wallet Overview'],
    ['deposit', 'Deposit Wallets'],
    ['hot', 'Hot Wallets'],
    ['cold-storage', 'Cold Storage'],
    ['transfers', 'Wallet Transfers'],
    ['withdrawal-queue', 'Withdrawal Queue'],
  ]),
  group('blockchain', 'Blockchain', [
    ['explorer', 'Blockchain Explorer'],
    ['network-monitor', 'Network Monitor'],
    ['transaction-queue', 'Transaction Queue'],
    ['blocks', 'Block Explorer'],
    ['gas-tracker', 'Gas Tracker'],
  ]),
  group('development', 'Development', [
    ['solidity-ide', 'Solidity IDE'],
    ['smart-contracts', 'Smart Contracts'],
    ['deployments', 'Contract Deployments'],
    ['contract-explorer', 'Contract Explorer'],
  ]),
  group('operations', 'Operations', [
    ['transaction-monitoring', 'Transaction Monitoring'],
    ['security-center', 'Security Center'],
    ['risk-management', 'Risk Management'],
    ['incidents', 'Incident Management'],
    ['audit-logs', 'Audit Logs'],
  ]),
  group('analytics', 'Analytics', [
    ['exchange-performance', 'Exchange Performance'],
    ['trading', 'Trading Analytics'],
    ['wallets', 'Wallet Analytics'],
    ['revenue-fees', 'Revenue and Fees'],
    ['customers', 'Customer Analytics'],
  ]),
  group('simulation', 'Simulation', [
    ['controls', 'Simulation Controls'],
    ['customer-behavior', 'Customer Behavior'],
    ['market-conditions', 'Market Conditions'],
    ['scenario-builder', 'Scenario Builder'],
    ['historical-replay', 'Historical Replay'],
  ]),
];

export const ALL_NAV_ITEMS: readonly NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export const HOME_PATH = '/overview/dashboard';

export interface NavMatch {
  group: NavGroup;
  item: NavItem;
}

/** Finds the nav entry for a pathname (exact match, trailing slash ignored). */
export function findNavItem(pathname: string): NavMatch | undefined {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  for (const g of NAV_GROUPS) {
    const item = g.items.find((i) => i.path === normalized);
    if (item) return { group: g, item };
  }
  return undefined;
}
