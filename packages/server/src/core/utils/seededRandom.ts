export type SeededRandom = () => number;

export const createSeededRandom = (seed: number): SeededRandom => {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const advanceSeededRandom = (
  random: SeededRandom,
  steps: number
): void => {
  for (let i = 0; i < steps; i++) {
    random();
  }
};
