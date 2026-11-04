/**
 * Supported assets (SPEC §6.1). All eight are modelled from day one; per-tier
 * unlocks (SPEC §17) are a later gameplay flag and do not belong here.
 */
export const ASSET_CODES = ['BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'LTC', 'XRP', 'DOGE'] as const;
export type AssetCode = (typeof ASSET_CODES)[number];

export interface Asset {
  readonly code: AssetCode;
  readonly name: string;
  /** Number of decimal places in one whole unit (base units = 10^decimals). */
  readonly decimals: number;
}

export const ASSETS: Readonly<Record<AssetCode, Asset>> = Object.freeze({
  BTC: { code: 'BTC', name: 'Bitcoin', decimals: 8 },
  ETH: { code: 'ETH', name: 'Ethereum', decimals: 18 },
  USDT: { code: 'USDT', name: 'Tether', decimals: 6 },
  USDC: { code: 'USDC', name: 'USD Coin', decimals: 6 },
  SOL: { code: 'SOL', name: 'Solana', decimals: 9 },
  LTC: { code: 'LTC', name: 'Litecoin', decimals: 8 },
  XRP: { code: 'XRP', name: 'XRP', decimals: 6 },
  DOGE: { code: 'DOGE', name: 'Dogecoin', decimals: 8 },
});

export function isAssetCode(value: unknown): value is AssetCode {
  return typeof value === 'string' && (ASSET_CODES as readonly string[]).includes(value);
}

export function getAsset(code: AssetCode): Asset {
  return ASSETS[code];
}
