/**
 * Read model for the Exchange Operations Dashboard (SPEC §5).
 * Amounts are BigInt base units; USD is BigInt fixed-point with 8 decimals.
 * A live selector (Phase 2+) produces the same shape as the static fixture.
 */
import type { Tone } from '@enterprise-ui/react';

export type AssetCode = 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'SOL' | 'LTC' | 'XRP' | 'DOGE';
export const ASSET_DECIMALS: Record<AssetCode, number> = { BTC: 8, ETH: 18, USDT: 6, USDC: 6, SOL: 9, LTC: 8, XRP: 6, DOGE: 8 };

/** USD with 8 decimal places, e.g. 1 USD = 100_000_000n. */
export type Usd8 = bigint;

export type MetricId =
  | 'totalCustomers' | 'activeCustomers' | 'totalAssets' | 'customerLiabilities'
  | 'exchangeReserves' | 'totalTradingVolume' | 'tradingVolume24h' | 'tradingFees'
  | 'totalDeposits' | 'totalWithdrawals' | 'pendingTransactions' | 'failedTransactions'
  | 'hotWalletUtilization' | 'coldWalletReserves' | 'withdrawalLiquidity' | 'networkHealth';

export type MetricValue =
  | { kind: 'count'; value: number }
  | { kind: 'usd'; value: Usd8 }
  | { kind: 'percent'; basisPoints: number }
  | { kind: 'health'; label: string; tone: Tone };

export interface Metric {
  id: MetricId;
  label: string;
  value: MetricValue;
  /** Secondary line, e.g. "+312 today". */
  detail?: string;
  detailTone?: 'success' | 'error' | 'neutral';
}

export type FeedEventType = 'Deposit' | 'Withdrawal' | 'Trade' | 'Conversion' | 'Wallet Transfer';
export type FeedStatus = 'Confirming' | 'Confirmed' | 'Completed' | 'Processing' | 'Filled' | 'Failed' | 'Queued';

export interface FeedRow {
  id: string;
  time: string;
  type: FeedEventType;
  /** Display pair for conversions, e.g. "ETH/BTC". */
  assetLabel: string;
  asset: AssetCode;
  units: bigint;
  usd: Usd8;
  customerId?: string;
  customerName?: string;
  status: FeedStatus;
  /** Arrived within the highlight window (row flash). */
  isNew?: boolean;
  detail?: TransactionDetail;
}

export interface TransactionDetail {
  network: string;
  feeUnits: bigint;
  sourceWallet: string;
  destination: string;
  txHash: string;
  networkFee: string;
  risk: { label: string; tone: Tone };
  lifecycle: { id: string; label: string; time?: string; state: 'done' | 'current' | 'pending' }[];
}

export type MapNodeId = 'customerIn' | 'deposit' | 'hot' | 'cold' | 'withdrawal' | 'mempool' | 'customerOut';

export interface MapNode {
  id: MapNodeId;
  title: string;
  value: string;
  sub: string;
  /** 0..10000 basis points, shown as a utilization bar. */
  utilizationBp?: number;
  warning?: boolean;
  /** Route of the node's operational view. */
  path: string;
}

export interface MapEdge {
  from: MapNodeId;
  to: MapNodeId;
  flow: 'inbound' | 'internal' | 'outbound';
  pending?: boolean;
  live?: boolean;
}

export interface DashboardSnapshot {
  metrics: Metric[];
  feed: FeedRow[];
  feedSummary: string;
  map: { nodes: MapNode[]; edges: MapEdge[] };
}
