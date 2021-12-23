import { Square } from './types';

export class SquareMap<T> implements Map<Square, T> {
  #map: T[];

  constructor() {
    this.#map = Array(64);
  }

  clear(): void {
    this.#map = Array(64);
  }

  delete(key: Square): boolean {
    const exists = this.#map[key.rank * 8 + key.file] !== undefined;
    delete this.#map[key.rank * 8 + key.file];
    return exists;
  }

  forEach(
    callbackfn: (value: T, key: Square, map: Map<Square, T>) => void,
    thisArg?: unknown
  ): void {
    throw new Error('Method not implemented.');
  }

  get(key: Square): T | undefined {
    if (key.rank < 0 || key.rank >= 8 || key.file < 0 || key.file >= 8) {
      return undefined;
    }

    return this.#map[key.rank * 8 + key.file];
  }

  has(key: Square): boolean {
    return this.#map[key.rank * 8 + key.file] !== undefined;
  }

  set(key: Square, value: T): this {
    this.#map[key.rank * 8 + key.file] = value;
    return this;
  }

  get size() {
    let counter = 0;
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        counter += this.#map[rank * 8 + file] !== undefined ? 1 : 0;
      }
    }
    return counter;
  }

  entries(): IterableIterator<[Square, T]> {
    const map = this.#map;

    return (function* entriesGenerator() {
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const value = map[rank * 8 + file];

          if (value !== undefined) {
            const tuple: [Square, T] = [{ rank, file }, value];
            yield tuple;
          }
        }
      }
    })();
  }

  keys(): IterableIterator<Square> {
    const map = this.#map;

    return (function* () {
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const value = map[rank * 8 + file];

          if (value !== undefined) {
            yield { rank, file };
          }
        }
      }
    })();
  }

  values(): IterableIterator<T> {
    const map = this.#map;

    return (function* () {
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const value = map[rank * 8 + file];
          if (value !== undefined) {
            yield value;
          }
        }
      }
    })();
  }

  [Symbol.iterator](): IterableIterator<[Square, T]> {
    return this.entries();
  }

  [Symbol.toStringTag] = 'SquareMap';
}
