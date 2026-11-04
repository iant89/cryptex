import type { SimTime } from './ids';

/** Injected time source. Domain code never calls Date.now(). */
export interface Clock {
  now(): SimTime;
}

/** Injected seeded randomness. Domain code never calls Math.random(). */
export interface Rng {
  /** Uniform 32-bit unsigned integer. */
  nextUint32(): number;
  /** Uniform float in [0, 1). Not for money. */
  nextFloat(): number;
  /** Uniform integer in [min, max] inclusive. */
  nextInt(min: number, max: number): number;
  /** Uniform bigint in [0, bound). */
  nextBigInt(bound: bigint): bigint;
}

/** Injected id source. Domain code never calls crypto.randomUUID(). */
export interface IdGenerator {
  next(prefix: string): string;
}
