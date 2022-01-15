import { Move } from '../types';
import { IHistoryTable } from './types';

export default class HistoryTable implements IHistoryTable {
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

  get(move: Move) {
    return this._table[move.from][move.to];
  }

  increment(move: Move, depth: number) {
    this._table[move.from][move.to] += depth * depth;
  }
}
