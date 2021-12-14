export default class StringKeyMap<K, V> implements Map<K, V> {
  #map: Map<string, V> = new Map<string, V>();
  #keyFn: (key: K) => string;

  constructor(keyFn: (key: K) => string) {
    this.#keyFn = keyFn;
  }

  clear(): void {
    this.#map.clear();
  }

  delete(key: K): boolean {
    return this.#map.delete(this.#keyFn(key));
  }

  forEach(
    callbackfn: (value: V, key: K, map: Map<K, V>) => void,
    thisArg?: unknown
  ): void {
    throw new Error('Method not implemented.');
  }

  get(key: K): V | undefined {
    return this.#map.get(this.#keyFn(key));
  }

  has(key: K): boolean {
    return this.#map.has(this.#keyFn(key));
  }

  set(key: K, value: V): this {
    this.#map.set(this.#keyFn(key), value);
    return this;
  }

  get size(): number {
    return this.#map.size;
  }

  entries(): IterableIterator<[K, V]> {
    throw new Error('Method not implemented.');
  }

  keys(): IterableIterator<K> {
    throw new Error('Method not implemented.');
  }

  values(): IterableIterator<V> {
    throw new Error('Method not implemented.');
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    throw new Error('Method not implemented.');
  }

  [Symbol.toStringTag]: string;
}
