import { getAsset, isAssetCode, type AssetCode } from './asset';

/** An amount of one asset in integer base units. Never a JS number. */
export interface Amount {
  readonly asset: AssetCode;
  readonly units: bigint;
}

export class MixedAssetError extends Error {
  constructor(a: AssetCode, b: AssetCode) {
    super(`Mixed-asset arithmetic: ${a} vs ${b}`);
    this.name = 'MixedAssetError';
  }
}

export class AmountFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AmountFormatError';
  }
}

export function amount(asset: AssetCode, units: bigint): Amount {
  if (!isAssetCode(asset)) throw new AmountFormatError(`Unknown asset: ${String(asset)}`);
  if (typeof units !== 'bigint') throw new AmountFormatError('Amount units must be a bigint');
  return Object.freeze({ asset, units });
}

export const zero = (asset: AssetCode): Amount => amount(asset, 0n);

function same(a: Amount, b: Amount): void {
  if (a.asset !== b.asset) throw new MixedAssetError(a.asset, b.asset);
}

export function add(a: Amount, b: Amount): Amount {
  same(a, b);
  return amount(a.asset, a.units + b.units);
}

export function sub(a: Amount, b: Amount): Amount {
  same(a, b);
  return amount(a.asset, a.units - b.units);
}

export function neg(a: Amount): Amount {
  return amount(a.asset, -a.units);
}

export function compare(a: Amount, b: Amount): -1 | 0 | 1 {
  same(a, b);
  return a.units < b.units ? -1 : a.units > b.units ? 1 : 0;
}

export function equals(a: Amount, b: Amount): boolean {
  return a.asset === b.asset && a.units === b.units;
}

export const isZero = (a: Amount): boolean => a.units === 0n;
export const isPositive = (a: Amount): boolean => a.units > 0n;
export const isNegative = (a: Amount): boolean => a.units < 0n;

export function sum(asset: AssetCode, amounts: readonly Amount[]): Amount {
  return amounts.reduce((acc, x) => add(acc, x), zero(asset));
}

const DECIMAL_RE = /^(-)?(\d+)(?:\.(\d+))?$/;

/**
 * Parse a decimal string (e.g. "2.5") into base units. Exact only: input with
 * more fractional digits than the asset supports is rejected, never rounded.
 */
export function parseAmount(asset: AssetCode, text: string): Amount {
  const decimals = getAsset(asset).decimals;
  return amount(asset, parseFixed(text, decimals));
}

/** Format base units as an exact decimal string (trailing zeros trimmed). */
export function formatAmount(a: Amount): string {
  return formatFixed(a.units, getAsset(a.asset).decimals);
}

export function parseFixed(text: string, decimals: number): bigint {
  const m = DECIMAL_RE.exec(text.trim());
  if (!m) throw new AmountFormatError(`Not a decimal number: "${text}"`);
  const [, sign, whole = '0', frac = ''] = m;
  if (frac.length > decimals) {
    throw new AmountFormatError(`"${text}" has more than ${decimals} decimal places`);
  }
  const units = BigInt(whole + frac.padEnd(decimals, '0'));
  return sign ? -units : units;
}

export function formatFixed(units: bigint, decimals: number): string {
  const negative = units < 0n;
  const abs = negative ? -units : units;
  const s = abs.toString().padStart(decimals + 1, '0');
  const whole = s.slice(0, s.length - decimals);
  const frac = decimals > 0 ? s.slice(s.length - decimals).replace(/0+$/, '') : '';
  return `${negative ? '-' : ''}${whole}${frac ? `.${frac}` : ''}`;
}
