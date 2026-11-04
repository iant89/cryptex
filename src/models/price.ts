import { getAsset, type AssetCode } from './asset';
import { formatFixed, parseFixed, type Amount } from './amount';

/**
 * USD values and prices are BigInt fixed-point with 8 decimals
 * (1 USD = 100_000_000 micro-units). Display rounding to cents is a UI concern.
 */
export const USD_DECIMALS = 8;
export const USD_SCALE = 10n ** BigInt(USD_DECIMALS);

export interface UsdValue {
  readonly usd: bigint;
}

/** Price of one whole unit of `asset`, in USD fixed-point (8 decimals). */
export interface UsdPrice {
  readonly asset: AssetCode;
  readonly usdPerUnit: bigint;
}

export function usdPrice(asset: AssetCode, usdPerUnit: bigint): UsdPrice {
  if (usdPerUnit < 0n) throw new RangeError('Price cannot be negative');
  return Object.freeze({ asset, usdPerUnit });
}

export const parseUsd = (text: string): bigint => parseFixed(text, USD_DECIMALS);
export const formatUsd = (usd: bigint): string => formatFixed(usd, USD_DECIMALS);

/**
 * THE single USD precision rule for the domain: reduce an exact scaled product
 * to USD fixed-point (8 decimals) by rounding toward zero (round-down for
 * non-negative values; BigInt division semantics). Sub-1e-8 USD remainders are
 * dropped. This is a precision limit, not display rounding; rounding to cents
 * for display belongs to the UI. Every USD computation must go through here.
 */
export function roundDownToUsd(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new RangeError('denominator must be positive');
  return numerator / denominator;
}

/** USD value of an amount at a price; precision per `roundDownToUsd`. */
export function valueInUsd(a: Amount, price: UsdPrice): bigint {
  if (a.asset !== price.asset) throw new RangeError(`Price is for ${price.asset}, amount is ${a.asset}`);
  return roundDownToUsd(a.units * price.usdPerUnit, 10n ** BigInt(getAsset(a.asset).decimals));
}
