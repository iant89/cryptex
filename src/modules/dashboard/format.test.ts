import { formatUnits, formatUsd, formatUsdCompact, usd } from './format';

describe('dashboard formatting (BigInt only)', () => {
  it('formats base units with rounding', () => {
    expect(formatUnits(2_500_000n, 8, 4)).toBe('0.0250');
    expect(formatUnits(2_500_000_000_000_000_000n, 18, 4)).toBe('2.5000');
    expect(formatUnits(12_400_000_000n, 6, 2)).toBe('12,400.00');
    expect(formatUnits(15n, 1, 0)).toBe('2');
    expect(formatUnits(-1_234_567n, 6, 2)).toBe('-1.23');
    expect(formatUnits(5n, 0, 2)).toBe('5.00');
  });

  it('formats USD', () => {
    expect(formatUsd(usd(12_400))).toBe('$12,400');
    expect(formatUsdCompact(usd(412_800_000))).toBe('$412.8M');
    expect(formatUsdCompact(41_289_000_000_000_000n)).toBe('$412.8M');
    expect(formatUsdCompact(usd(9_840_000_000))).toBe('$9.84B');
    expect(formatUsdCompact(usd(1_920_000))).toBe('$1.92M');
    expect(formatUsdCompact(usd(14_700_000))).toBe('$14.7M');
    expect(formatUsdCompact(usd(850))).toBe('$850');
  });
});
