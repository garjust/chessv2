import { ZobristKey } from '../../core/types';

export default class TranspositionTable<T> {
  _map;

  constructor() {
    this._map = new Map<number, Map<number, T>>();
  }

  set(key: ZobristKey, value: T): void {
    if (!this._map.has(key[0])) {
      this._map.set(key[0], new Map());
    }
    this._map.get(key[0])?.set(key[1], value);
  }

  get(key: ZobristKey): T | undefined {
    return this._map.get(key[0])?.get(key[1]);
  }
}
