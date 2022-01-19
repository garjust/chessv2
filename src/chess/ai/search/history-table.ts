import { Move } from '../../types';

export default class HistoryTable {
  readonly _table: number[][];

  constructor() {
    this._table = [];
    for (let i = 0; i < 64; i++) {
      this._table[i] = [];
      for (let j = 0; j < 64; j++) {
        this._table[i][j] = 0;
      }
    }
  }

  get(move: Move): number {
    return this._table[move.from][move.to];
  }

  increment(move: Move, depth: number): void {
    this._table[move.from][move.to] += depth * depth;
  }
}
