export default class StringKeyMap<K, V> implements Map<K, V> {
  #map: Map<string, V> = new Map<string, V>();
  #keyFn: (key: K) => string;
  #inverseKeyFn: (str: string) => K;

  constructor(keyFn: (key: K) => string, inverseKeyFN: (str: string) => K) {
    this.#keyFn = keyFn;
    this.#inverseKeyFn = inverseKeyFN;
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
    const map = this.#map;
    const keyFn = this.#inverseKeyFn;

    return (function* () {
      for (const [key, value] of map.entries()) {
        yield [keyFn(key), value] as [K, V];
      }
    })();
  }

  keys(): IterableIterator<K> {
    const map = this.#map;
    const keyFn = this.#inverseKeyFn;

    return (function* () {
      for (const key of map.keys()) {
        yield keyFn(key);
      }
    })();
  }

  values(): IterableIterator<V> {
    return this.#map.values();
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  [Symbol.toStringTag]: string;
}
