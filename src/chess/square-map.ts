import { Square } from './types';
import { isLegalSquare } from './utils';

const iterator = function* <T>(array: T[]) {
  for (let i = 0; i < 64; i++) {
    const value = array[i];

    if (value !== undefined) {
      const tuple: [Square, T] = [i, value];
      yield tuple;
    }
  }
};

export class SquareMap<T> implements Map<Square, T> {
  map: T[];

  constructor() {
    this.map = Array(64);
  }

  clear(): void {
    this.map = Array(64);
  }

  delete(key: Square): boolean {
    const exists = this.map[key] !== undefined;
    delete this.map[key];
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

    return this.map[key];
  }

  has(key: Square): boolean {
    return this.map[key] !== undefined;
  }

  set(key: Square, value: T): this {
    this.map[key] = value;
    return this;
  }

  get size() {
    let counter = 0;
    for (let i = 0; i < 64; i++) {
      if (this.map[i] !== undefined) {
        counter++;
      }
    }
    return counter;
  }

  entries(): IterableIterator<[Square, T]> {
    return iterator(this.map);
  }

  keys(): IterableIterator<Square> {
    const map = this.map;

    return (function* () {
      for (let i = 0; i < 64; i++) {
        const value = map[i];

        if (value !== undefined) {
          yield i;
        }
      }
    })();
  }

  values(): IterableIterator<T> {
    const map = this.map;

    return (function* () {
      for (let i = 0; i < 64; i++) {
        const value = map[i];

        if (value !== undefined) {
          yield value;
        }
      }
    })();
  }

  [Symbol.iterator](): IterableIterator<[Square, T]> {
    return this.entries();
  }

  [Symbol.toStringTag] = 'SquareMap';
}
