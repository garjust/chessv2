import { Move } from '../../types';

export default class PVTable {
  _table: Move[][] = [[]];

  constructor(maxDepth: number) {
    this._table = Array(maxDepth);
    for (let i = 0; i <= maxDepth; i++) {
      this._table[i] = [];
    }
  }

  set(depth: number, move: Move): void {
    this._table[depth] = [move, ...this._table[depth - 1]];
  }

  get pv(): Move[] {
    return [...this._table[this._table.length - 1]];
  }
}
