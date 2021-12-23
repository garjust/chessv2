import { Square } from './types';

export class SquareMap<T> implements Map<Square, T> {
  #map: T[][];

  constructor() {
    this.#map = new Array<Array<T>>(
      new Array<T>(8),
      new Array<T>(8),
      new Array<T>(8),
      new Array<T>(8),
      new Array<T>(8),
      new Array<T>(8),
      new Array<T>(8),
      new Array<T>(8)
    );
  }

  clear(): void {
    this.#map = new Array<Array<T>>(
      new Array<T>(8),
      new Array<T>(8),
      new Array<T>(8),
      new Array<T>(8),
      new Array<T>(8),
      new Array<T>(8),
      new Array<T>(8),
      new Array<T>(8)
    );
  }

  delete(key: Square): boolean {
    return delete this.#map[key.rank][key.file];
  }

  forEach(
    callbackfn: (value: T, key: Square, map: Map<Square, T>) => void,
    thisArg?: any
  ): void {
    throw new Error('Method not implemented.');
  }

  get(key: Square): T | undefined {
    return this.#map[key.rank][key.file];
  }

  has(key: Square): boolean {
    return Boolean(this.#map[key.rank][key.file]);
  }

  set(key: Square, value: T): this {
    this.#map[key.rank][key.file] = value;
    return this;
  }

  get size() {
    let counter = 0;
    for (let rank = 0; rank < 7; rank++) {
      for (let file = 0; file < 7; file++) {
        counter += this.#map[rank][file] === undefined ? 0 : 1;
      }
    }
    return counter;
  }

  entries(): IterableIterator<[Square, T]> {
    const map = this.#map;

    return (function* () {
      for (let rank = 0; rank < 7; rank++) {
        for (let file = 0; file < 7; file++) {
          const value = map[rank][file];

          if (value) {
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
      for (let rank = 0; rank < 7; rank++) {
        for (let file = 0; file < 7; file++) {
          const value = map[rank][file];

          if (value) {
            yield { rank, file };
          }
        }
      }
    })();
  }

  values(): IterableIterator<T> {
    const map = this.#map;

    return (function* () {
      for (let rank = 0; rank < 7; rank++) {
        for (let file = 0; file < 7; file++) {
          const value = map[rank][file];
          if (value) {
            yield value;
          }
        }
      }
    })();
  }

  [Symbol.iterator](): IterableIterator<[Square, T]> {
    return this.entries();
  }

  [Symbol.toStringTag]: string;
}
