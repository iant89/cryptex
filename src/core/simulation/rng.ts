import type { Rng } from '../../models/ports';

/** splitmix32: expands a single 32-bit seed into well-mixed state words. */
function splitmix32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x9e3779b9) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
    return (z ^ (z >>> 16)) >>> 0;
  };
}

const rotl = (x: number, k: number) => ((x << k) | (x >>> (32 - k))) >>> 0;

/** xoshiro128** seeded PRNG (PM decision D5). Same seed → identical sequence. */
export class SeededRng implements Rng {
  #s: [number, number, number, number];

  constructor(seed: number) {
    if (!Number.isInteger(seed)) throw new RangeError('seed must be an integer');
    const sm = splitmix32(seed);
    this.#s = [sm(), sm(), sm(), sm()];
    if (this.#s.every((x) => x === 0)) this.#s[0] = 1;
  }

  nextUint32(): number {
    const s = this.#s;
    const result = Math.imul(rotl(Math.imul(s[1], 5) >>> 0, 7), 9) >>> 0;
    const t = (s[1] << 9) >>> 0;
    s[2] ^= s[0];
    s[3] ^= s[1];
    s[1] ^= s[2];
    s[0] ^= s[3];
    s[2] ^= t;
    s[3] = rotl(s[3], 11);
    for (let i = 0; i < 4; i++) s[i] = s[i]! >>> 0;
    return result;
  }

  nextFloat(): number {
    return this.nextUint32() / 0x1_0000_0000;
  }

  nextInt(min: number, max: number): number {
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max < min) throw new RangeError('bad range');
    return min + Number(this.nextBigInt(BigInt(max - min + 1)));
  }

  /** Unbiased (rejection-sampled) bigint in [0, bound). */
  nextBigInt(bound: bigint): bigint {
    if (bound <= 0n) throw new RangeError('bound must be positive');
    const bits = bound.toString(2).length;
    const words = Math.ceil(bits / 32);
    const mask = (1n << BigInt(bits)) - 1n;
    for (;;) {
      let v = 0n;
      for (let i = 0; i < words; i++) v = (v << 32n) | BigInt(this.nextUint32());
      v &= mask;
      if (v < bound) return v;
    }
  }

  /** Snapshot state for persistence / replay. */
  getState(): readonly [number, number, number, number] {
    return [...this.#s] as [number, number, number, number];
  }

  static fromState(state: readonly [number, number, number, number]): SeededRng {
    const r = new SeededRng(0);
    r.#s = [...state] as [number, number, number, number];
    return r;
  }
}
