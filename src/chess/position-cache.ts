import { ComputedPositionData } from './types';

export default class PositionCache {
  #map = new Map<string, ComputedPositionData>();

  // Currently just pass through the key. This means exact FEN strings will be
  // cached. For the purpose of transpositions much data in the FEN string is not
  // always relevant during normal play: move counts, turn, en passant state.
  #keyFn(key: string): string {
    return key;
  }

  set(key: string, value: ComputedPositionData): this {
    this.#map.set(this.#keyFn(key), value);
    return this;
  }

  get(key: string): ComputedPositionData | undefined {
    return this.#map.get(this.#keyFn(key));
  }

  has(key: string): boolean {
    return this.#map.has(this.#keyFn(key));
  }
}
