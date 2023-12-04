export const isKthBitOn = (n: number, k: number): boolean => (n & (1 << k)) > 0;

export const isKthBitOff = (n: number, k: number): boolean =>
  (~n & (1 << k)) > 0;

export const setKthBit = (n: number, k: number): number => n | (1 << k);

export const setKthBitOff = (n: number, k: number): number => n & ~(1 << k);
