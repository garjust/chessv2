import { Move } from '../types';
import { IPVTable } from './types';

export default class PVTable implements IPVTable {
  readonly _table: Move[][];

  constructor(maxDepth: number) {
    this._table = Array(maxDepth);
    for (let i = 0; i <= maxDepth; i++) {
      this._table[i] = [];
    }
  }

  set(depth: number, move: Move) {
    this._table[depth] = [move, ...this._table[depth - 1]];
  }

  get pv() {
    return [...this._table[this._table.length - 1]].reverse();
  }
}
