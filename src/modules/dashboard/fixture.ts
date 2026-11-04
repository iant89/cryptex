/** Static, illustrative dashboard data matching the approved mockups (02/03). */
import { ASSET_DECIMALS, type AssetCode, type DashboardSnapshot, type FeedRow } from './types';
import { usd } from './format';

/** Decimal string → base units, BigInt only. */
const u = (asset: AssetCode, amount: string): bigint => {
  const [i = '0', f = ''] = amount.split('.');
  const d = ASSET_DECIMALS[asset];
  return BigInt(i) * 10n ** BigInt(d) + BigInt((f + '0'.repeat(d)).slice(0, d) || '0');
};

const row = (r: Omit<FeedRow, 'units' | 'usd'> & { amount: string; usd: number }): FeedRow => {
  const { amount, usd: dollars, ...rest } = r;
  return { ...rest, units: u(r.asset, amount), usd: usd(dollars) };
};

export const DASHBOARD_FIXTURE: DashboardSnapshot = {
  metrics: [
    { id: 'totalCustomers', label: 'Total customers', value: { kind: 'count', value: 48_213 }, detail: '+312 today', detailTone: 'success' },
    { id: 'activeCustomers', label: 'Active customers (24h)', value: { kind: 'count', value: 6_904 }, detail: '+4.1%', detailTone: 'success' },
    { id: 'totalAssets', label: 'Total exchange assets', value: { kind: 'usd', value: usd(412_800_000) }, detail: '+1.2%', detailTone: 'success' },
    { id: 'customerLiabilities', label: 'Customer liabilities', value: { kind: 'usd', value: usd(398_100_000) }, detail: '+1.1%', detailTone: 'success' },
    { id: 'exchangeReserves', label: 'Exchange reserves', value: { kind: 'usd', value: usd(14_700_000) }, detail: '3.7% of liab.' },
    { id: 'totalTradingVolume', label: 'Total trading volume', value: { kind: 'usd', value: usd(9_840_000_000) }, detail: 'all-time' },
    { id: 'tradingVolume24h', label: '24h trading volume', value: { kind: 'usd', value: usd(61_200_000) }, detail: '−3.4%', detailTone: 'error' },
    { id: 'tradingFees', label: 'Trading fees collected', value: { kind: 'usd', value: usd(1_920_000) }, detail: '+$58.1K 24h', detailTone: 'success' },
    { id: 'totalDeposits', label: 'Total deposits', value: { kind: 'usd', value: usd(2_110_000_000) }, detail: '+$7.4M 24h', detailTone: 'success' },
    { id: 'totalWithdrawals', label: 'Total withdrawals', value: { kind: 'usd', value: usd(1_710_000_000) }, detail: '+$6.9M 24h', detailTone: 'success' },
    { id: 'pendingTransactions', label: 'Pending transactions', value: { kind: 'count', value: 137 }, detail: '42 withdrawals' },
    { id: 'failedTransactions', label: 'Failed transactions', value: { kind: 'count', value: 9 }, detail: '24h · 0.2%', detailTone: 'error' },
    { id: 'hotWalletUtilization', label: 'Hot wallet utilization', value: { kind: 'percent', basisPoints: 8_200 } },
    { id: 'coldWalletReserves', label: 'Cold wallet reserves', value: { kind: 'usd', value: usd(371_500_000) }, detail: '90% of assets' },
    { id: 'withdrawalLiquidity', label: 'Withdrawal liquidity', value: { kind: 'usd', value: usd(23_600_000) }, detail: '≈ 3.4 days' },
    { id: 'networkHealth', label: 'Network health', value: { kind: 'health', label: 'Healthy', tone: 'success' }, detail: 'ETH 18 gwei · BTC 12 s/vB' },
  ],
  feed: [
    row({ id: 'TX-68420', time: '09:32:08', type: 'Deposit', asset: 'BTC', assetLabel: 'BTC', amount: '0.025', usd: 1_712, customerId: 'C-10482', status: 'Confirming', isNew: true }),
    row({ id: 'TX-68419', time: '09:32:06', type: 'Conversion', asset: 'ETH', assetLabel: 'ETH/BTC', amount: '0.75', usd: 2_980, customerId: 'C-20931', status: 'Completed' }),
    row({
      id: 'TX-68412', time: '09:32:04', type: 'Withdrawal', asset: 'USDT', assetLabel: 'USDT', amount: '850', usd: 850,
      customerId: 'C-11877', customerName: 'Dana Ortiz', status: 'Processing',
      detail: {
        network: 'ERC-20', feeUnits: u('USDT', '2.50'), sourceWallet: 'HW-ETH-01 (hot)', destination: '0x7f3a…c91e',
        txHash: '0x5be1…02af', networkFee: '21 gwei · $1.84', risk: { label: 'Low · 12', tone: 'success' },
        lifecycle: [
          { id: 'l1', label: 'Request submitted', time: '09:31:40', state: 'done' },
          { id: 'l2', label: 'Account & balance check', time: '09:31:41', state: 'done' },
          { id: 'l3', label: 'Risk checks passed', time: '09:31:42', state: 'done' },
          { id: 'l4', label: 'Queued · hot liquidity OK', time: '09:31:55', state: 'done' },
          { id: 'l5', label: 'Broadcast to mempool', time: '09:32:04', state: 'current' },
          { id: 'l6', label: 'Included in block', state: 'pending' },
          { id: 'l7', label: 'Confirmations 0/12', state: 'pending' },
          { id: 'l8', label: 'Ledger settlement', state: 'pending' },
        ],
      },
    }),
    row({ id: 'TX-68410', time: '09:32:03', type: 'Trade', asset: 'BTC', assetLabel: 'BTC', amount: '0.015', usd: 1_027, customerId: 'C-30012', status: 'Filled' }),
    row({ id: 'TX-68408', time: '09:32:01', type: 'Deposit', asset: 'ETH', assetLabel: 'ETH', amount: '2.5', usd: 9_935, customerId: 'C-10482', status: 'Confirmed' }),
    row({ id: 'TX-68405', time: '09:31:59', type: 'Wallet Transfer', asset: 'ETH', assetLabel: 'ETH', amount: '15', usd: 59_610, status: 'Processing' }),
    row({ id: 'TX-68401', time: '09:31:57', type: 'Withdrawal', asset: 'BTC', assetLabel: 'BTC', amount: '0.41', usd: 28_077, customerId: 'C-41290', status: 'Failed' }),
    row({ id: 'TX-68398', time: '09:31:55', type: 'Trade', asset: 'SOL', assetLabel: 'SOL', amount: '42', usd: 7_224, customerId: 'C-22018', status: 'Filled' }),
    row({ id: 'TX-68395', time: '09:31:52', type: 'Deposit', asset: 'USDC', assetLabel: 'USDC', amount: '12400', usd: 12_400, customerId: 'C-50311', status: 'Confirmed' }),
    row({ id: 'TX-68391', time: '09:31:50', type: 'Trade', asset: 'ETH', assetLabel: 'ETH', amount: '1.2', usd: 4_769, customerId: 'C-19004', status: 'Filled' }),
    row({ id: 'TX-68388', time: '09:31:47', type: 'Withdrawal', asset: 'ETH', assetLabel: 'ETH', amount: '3', usd: 11_922, customerId: 'C-33107', status: 'Queued' }),
  ],
  feedSummary: '1,284 tx in last hour',
  map: {
    nodes: [
      { id: 'customerIn', title: 'Customer Wallets', value: '1,284 tx/h', sub: 'in: $7.4M 24h', path: '/exchange/customers' },
      { id: 'deposit', title: 'Deposit Wallets', value: '$3.9M', sub: '312 addrs · 18 pending', path: '/wallets/deposit' },
      { id: 'hot', title: 'Hot Wallets', value: '$23.6M', sub: '4 wallets', utilizationBp: 8_200, warning: true, path: '/wallets/hot' },
      { id: 'cold', title: 'Cold Storage', value: '$371.5M', sub: '6 vaults · 1 transfer', path: '/wallets/cold-storage' },
      { id: 'withdrawal', title: 'Withdrawal Processing', value: '42 queued', sub: '$1.1M · avg 4m 10s', path: '/wallets/withdrawal-queue' },
      { id: 'mempool', title: 'Mempool / Network', value: '96 tx', sub: 'ETH 18 gwei', path: '/blockchain/network-monitor' },
      { id: 'customerOut', title: 'Customer Wallets', value: 'out: $6.9M', sub: '24h withdrawals', path: '/exchange/customers' },
    ],
    edges: [
      { from: 'customerIn', to: 'deposit', flow: 'inbound', live: true },
      { from: 'deposit', to: 'hot', flow: 'internal', live: true },
      { from: 'hot', to: 'cold', flow: 'internal' },
      { from: 'cold', to: 'hot', flow: 'internal', pending: true },
      { from: 'hot', to: 'withdrawal', flow: 'outbound', pending: true },
      { from: 'withdrawal', to: 'mempool', flow: 'outbound', live: true },
      { from: 'mempool', to: 'customerOut', flow: 'outbound', live: true },
    ],
  },
};
