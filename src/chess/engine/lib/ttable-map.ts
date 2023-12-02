import { CurrentZobrist } from '../../lib/zobrist/types';
import { TranspositionTable } from './types';

type Entry<T> = {
  data: T;
  checkKey: [number, number];
};

export default class TTableMap<T> implements TranspositionTable<T> {
  private readonly map;
  private zobrist;

  private hits = 0;
  private miss = 0;
  private type1 = 0;

  constructor(zobrist: CurrentZobrist<[number, number]>) {
    this.map = new Map<number, Map<number, Entry<T>>>();
    this.zobrist = zobrist;
  }

  set(data: T): void {
    const key = this.zobrist.key;
    if (!this.map.has(key[0])) {
      this.map.set(key[0], new Map());
    }
    this.map.get(key[0])?.set(key[1], { data, checkKey: key });
  }

  get(): T | undefined {
    const key = this.zobrist.key;
    const entry = this.map.get(key[0])?.get(key[1]);
    if (entry === undefined) {
      this.miss++;
    } else if (entry.checkKey === key) {
      this.type1++;
      return undefined;
    } else {
      this.hits++;
    }
    return entry?.data;
  }

  get currentKey() {
    return this.zobrist;
  }

  stats() {
    return {
      hits: this.hits,
      miss: this.miss,
      type1: this.type1,
    };
  }
}
