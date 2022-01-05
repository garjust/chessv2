import { Square } from './types';
import { isLegalSquare } from './utils';

const entriesIterator = function* <T>(array: { square: Square; item: T }[]) {
  for (const { square, item } of array) {
    yield [square, item] as [Square, T];
  }
};

const keysIterator = function* <T>(array: { square: Square; item: T }[]) {
  for (const { square } of array) {
    yield square;
  }
};

const valuesIterator = function* <T>(array: { square: Square; item: T }[]) {
  for (const { item } of array) {
    yield item;
  }
};

export class SquareMapWithList<T> implements Map<Square, T> {
  map: T[];
  list: { square: Square; item: T }[];

  constructor() {
    this.map = Array(64);
    this.list = [];
  }

  clear(): void {
    this.map = Array(64);
    this.list = [];
  }

  delete(key: Square): boolean {
    const exists = this.map[key] !== undefined;
    if (exists) {
      delete this.list[this.list.findIndex(({ square }) => square === key)];
    }
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
    delete this.list[this.list.findIndex((x) => x?.square === key)];
    this.list.push({ square: key, item: value });
    return this;
  }

  get size() {
    return this.list.length;
  }

  entries(): IterableIterator<[Square, T]> {
    return entriesIterator(this.list);
  }

  keys(): IterableIterator<Square> {
    return keysIterator(this.list);
  }

  values(): IterableIterator<T> {
    return valuesIterator(this.list);
  }

  [Symbol.iterator](): IterableIterator<[Square, T]> {
    return this.entries();
  }

  [Symbol.toStringTag] = 'SquareMapWithList';
}
