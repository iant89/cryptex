import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  ASSETS, ASSET_CODES, getAsset, isAssetCode,
  amount, zero, add, sub, neg, compare, equals, isZero, isPositive, isNegative, sum,
  parseAmount, formatAmount, parseFixed, formatFixed, MixedAssetError, AmountFormatError,
  USD_DECIMALS, USD_SCALE, usdPrice, roundDownToUsd, parseUsd, formatUsd, valueInUsd,
  type Amount, type UsdPrice,
} from './index';

describe('assets (SPEC §6.1)', () => {
  it('models all eight assets with plan decimals', () => {
    expect(ASSET_CODES).toEqual(['BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'LTC', 'XRP', 'DOGE']);
    expect(Object.fromEntries(ASSET_CODES.map((c) => [c, ASSETS[c].decimals]))).toEqual({
      BTC: 8, ETH: 18, USDT: 6, USDC: 6, SOL: 9, LTC: 8, XRP: 6, DOGE: 8,
    });
    expect(getAsset('ETH').name).toBe('Ethereum');
    expect(Object.isFrozen(ASSETS)).toBe(true);
  });
  it('isAssetCode guards', () => {
    expect(isAssetCode('BTC')).toBe(true);
    expect(isAssetCode('btc')).toBe(false);
    expect(isAssetCode(1)).toBe(false);
  });
});

describe('Amount', () => {
  const b = (u: bigint) => amount('BTC', u);
  it('is bigint-only (no number for money)', () => {
    expectTypeOf<Amount['units']>().toEqualTypeOf<bigint>();
    expectTypeOf<UsdPrice['usdPerUnit']>().toEqualTypeOf<bigint>();
    // @ts-expect-error number is not allowed
    expect(() => amount('BTC', 1)).toThrow(AmountFormatError);
    // @ts-expect-error unknown asset
    expect(() => amount('FOO', 1n)).toThrow(AmountFormatError);
    expect(Object.isFrozen(b(1n))).toBe(true);
  });
  it('arithmetic', () => {
    expect(add(b(2n), b(3n))).toEqual(b(5n));
    expect(sub(b(2n), b(3n))).toEqual(b(-1n));
    expect(neg(b(4n))).toEqual(b(-4n));
    expect(sum('BTC', [b(1n), b(2n), b(3n)])).toEqual(b(6n));
    expect(sum('BTC', [])).toEqual(zero('BTC'));
    expect(compare(b(1n), b(2n))).toBe(-1);
    expect(compare(b(2n), b(2n))).toBe(0);
    expect(compare(b(3n), b(2n))).toBe(1);
    expect(equals(b(1n), b(1n))).toBe(true);
    expect(equals(b(1n), amount('LTC', 1n))).toBe(false);
    expect(isZero(zero('ETH'))).toBe(true);
    expect(isPositive(b(1n))).toBe(true);
    expect(isNegative(b(-1n))).toBe(true);
  });
  it('rejects mixed assets', () => {
    const e = amount('ETH', 1n);
    expect(() => add(b(1n), e)).toThrow(MixedAssetError);
    expect(() => sub(b(1n), e)).toThrow(MixedAssetError);
    expect(() => compare(b(1n), e)).toThrow(MixedAssetError);
    expect(() => sum('BTC', [e])).toThrow(MixedAssetError);
  });
  it('parses and formats exactly', () => {
    expect(parseAmount('ETH', '2.5').units).toBe(2_500_000_000_000_000_000n);
    expect(parseAmount('BTC', '0.00000001').units).toBe(1n);
    expect(parseAmount('BTC', '-1').units).toBe(-100_000_000n);
    expect(parseAmount('USDT', ' 10 ').units).toBe(10_000_000n);
    expect(formatAmount(amount('ETH', 2_500_000_000_000_000_000n))).toBe('2.5');
    expect(formatAmount(amount('BTC', 1n))).toBe('0.00000001');
    expect(formatAmount(amount('BTC', -150_000_000n))).toBe('-1.5');
    expect(formatAmount(zero('SOL'))).toBe('0');
    expect(formatFixed(123n, 0)).toBe('123');
    expect(parseFixed('7', 0)).toBe(7n);
  });
  it('rejects excess precision and garbage instead of rounding', () => {
    expect(() => parseAmount('BTC', '0.000000001')).toThrow(AmountFormatError);
    expect(() => parseAmount('BTC', '1e3')).toThrow(AmountFormatError);
    expect(() => parseAmount('BTC', '')).toThrow(AmountFormatError);
    expect(() => parseAmount('BTC', '1.')).toThrow(AmountFormatError);
  });
  it('round-trips for every asset', () => {
    for (const c of ASSET_CODES) {
      for (const u of [0n, 1n, -1n, 10n ** 30n + 7n]) {
        expect(parseAmount(c, formatAmount(amount(c, u))).units).toBe(u);
      }
    }
  });
});

describe('USD fixed-point (8 decimals)', () => {
  it('constants', () => {
    expect(USD_DECIMALS).toBe(8);
    expect(USD_SCALE).toBe(100_000_000n);
  });
  it('parse/format with no display rounding', () => {
    expect(parseUsd('65000.12345678')).toBe(6_500_012_345_678n);
    expect(formatUsd(6_500_012_345_678n)).toBe('65000.12345678');
    expect(() => parseUsd('0.000000001')).toThrow(AmountFormatError);
  });
  it('roundDownToUsd is the single precision rule (toward zero)', () => {
    expect(roundDownToUsd(199n, 100n)).toBe(1n);
    expect(roundDownToUsd(200n, 100n)).toBe(2n);
    expect(roundDownToUsd(0n, 7n)).toBe(0n);
    expect(roundDownToUsd(-199n, 100n)).toBe(-1n);
    expect(() => roundDownToUsd(1n, 0n)).toThrow(RangeError);
  });
  it('values amounts, truncating at 8 USD decimals', () => {
    const btc = usdPrice('BTC', parseUsd('65000'));
    expect(valueInUsd(parseAmount('BTC', '0.5'), btc)).toBe(parseUsd('32500'));
    const eth = usdPrice('ETH', parseUsd('3000.5'));
    expect(valueInUsd(parseAmount('ETH', '0.000000000000000001'), eth)).toBe(0n);
    expect(valueInUsd(parseAmount('ETH', '2'), eth)).toBe(parseUsd('6001'));
    expect(() => valueInUsd(parseAmount('BTC', '1'), eth)).toThrow(RangeError);
    expect(() => usdPrice('BTC', -1n)).toThrow(RangeError);
  });
});
