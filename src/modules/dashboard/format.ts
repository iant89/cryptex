import type { Usd8 } from './types';

const USD_SCALE = 100_000_000n;

/** Exact decimal string of base units, trimmed/padded to `dp` places (round half up). */
export function formatUnits(units: bigint, decimals: number, dp: number): string {
  const neg = units < 0n;
  let abs = neg ? -units : units;
  if (dp < decimals) {
    const f = 10n ** BigInt(decimals - dp);
    abs = (abs + f / 2n) / f;
  } else {
    abs *= 10n ** BigInt(dp - decimals);
  }
  const s = abs.toString().padStart(dp + 1, '0');
  const int = s.slice(0, s.length - dp).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const frac = dp > 0 ? `.${s.slice(s.length - dp)}` : '';
  return `${neg ? '-' : ''}${int}${frac}`;
}

/** Whole dollars with thousands separators, e.g. $12,400. */
export function formatUsd(value: Usd8): string {
  return `$${formatUnits(value, 8, 0)}`;
}

/** Compact USD for tiles (truncates): $412.8M, $9.84B, $1.92M, $850. */
export function formatUsdCompact(value: Usd8): string {
  const dollars = value / USD_SCALE;
  const scales: [bigint, string][] = [[1_000_000_000n, 'B'], [1_000_000n, 'M'], [1_000n, 'K']];
  for (const [scale, suffix] of scales) {
    if (dollars >= scale) {
      // Two decimals below 10 units of the scale, otherwise one ($9.84B, $412.8M).
      const dp = dollars / scale >= 10n ? 1 : 2;
      return `$${formatUnits((value * 10n ** BigInt(dp)) / (scale * USD_SCALE), dp, dp)}${suffix}`;
    }
  }
  return formatUsd(value);
}

export const usd = (dollars: number | bigint): Usd8 => BigInt(dollars) * USD_SCALE;
