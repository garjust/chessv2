import { Square } from './types';
import { isLegalSquare, rankFileToSquare } from './utils';

export class SquareMap<T> implements Map<Square, T> {
  #map: T[];

  constructor() {
    this.#map = Array(64);
  }

  clear(): void {
    this.#map = Array(64);
  }

  delete(key: Square): boolean {
    const exists = this.#map[key] !== undefined;
    delete this.#map[key];
    return exists;
  }

  forEach(
    callbackfn: (value: T, key: Square, map: Map<Square, T>) => void,
    thisArg?: unknown
  ): void {
    throw new Error('Method not implemented.');
  }

  get(key: Square): T | undefined {
    if (!isLegalSquare(key)) {
      return undefined;
    }

    return this.#map[key];
  }

  has(key: Square): boolean {
    return this.#map[key] !== undefined;
  }

  set(key: Square, value: T): this {
    this.#map[key] = value;
    return this;
  }

  get size() {
    let counter = 0;
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        counter +=
          this.#map[rankFileToSquare({ rank, file })] !== undefined ? 1 : 0;
      }
    }
    return counter;
  }

  entries(): IterableIterator<[Square, T]> {
    const map = this.#map;

    return (function* entriesGenerator() {
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const value = map[rankFileToSquare({ rank, file })];

          if (value !== undefined) {
            const tuple: [Square, T] = [
              rankFileToSquare({ rank, file }),
              value,
            ];
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
          const value = map[rankFileToSquare({ rank, file })];

          if (value !== undefined) {
            yield rankFileToSquare({ rank, file });
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
          const value = map[rankFileToSquare({ rank, file })];
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
