/**
 * Seeded Random Number Generator
 *
 * Provides deterministic random number generation for reproducible simulations.
 * Uses the Mulberry32 algorithm - fast and sufficient for simulation purposes.
 */

/**
 * Seeded RNG state
 */
export interface RandomGenerator {
  /** Get next random float [0, 1) */
  random: () => number;
  /** Get random integer in range [min, max] inclusive */
  randInt: (min: number, max: number) => number;
  /** Get random float in range [min, max) */
  randFloat: (min: number, max: number) => number;
  /** Get random boolean with given probability of true */
  randBool: (probability?: number) => boolean;
  /** Pick random element from array */
  pick: <T>(array: T[]) => T;
  /** Pick random element from array with weights */
  pickWeighted: <T>(array: T[], weights: number[]) => T;
  /** Shuffle array in place */
  shuffle: <T>(array: T[]) => T[];
  /** Get current seed state (for saving) */
  getState: () => number;
  /** Reset to a new seed */
  reset: (seed: number) => void;
}

/**
 * Create a seeded random number generator using Mulberry32
 */
export function createRNG(seed: number = 12345): RandomGenerator {
  let state = seed;

  // Mulberry32 algorithm
  function next(): number {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function random(): number {
    return next();
  }

  function randInt(min: number, max: number): number {
    return Math.floor(random() * (max - min + 1)) + min;
  }

  function randFloat(min: number, max: number): number {
    return random() * (max - min) + min;
  }

  function randBool(probability: number = 0.5): boolean {
    return random() < probability;
  }

  function pick<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    return array[randInt(0, array.length - 1)];
  }

  function pickWeighted<T>(array: T[], weights: number[]): T {
    if (array.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    if (array.length !== weights.length) {
      throw new Error('Array and weights must have same length');
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let r = random() * totalWeight;

    for (let i = 0; i < array.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        return array[i];
      }
    }

    return array[array.length - 1];
  }

  function shuffle<T>(array: T[]): T[] {
    // Fisher-Yates shuffle
    for (let i = array.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function getState(): number {
    return state;
  }

  function reset(newSeed: number): void {
    state = newSeed;
  }

  return {
    random,
    randInt,
    randFloat,
    randBool,
    pick,
    pickWeighted,
    shuffle,
    getState,
    reset,
  };
}

/**
 * Generate a random seed from current time
 */
export function generateSeed(): number {
  return Date.now() ^ (Math.random() * 0x100000000);
}
