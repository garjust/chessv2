import { Move } from '../../types';

export default class PVTable {
  _table: Move[][] = [[]];
  _currentPV: Move[];

  constructor(maxDepth: number) {
    this._currentPV = [];
    this.nextIteration(maxDepth);
  }

  nextIteration(maxDepth: number): void {
    this._currentPV = [...this._table[this._table.length - 1]].reverse();
    this._table = Array(maxDepth);
    for (let i = 0; i <= maxDepth; i++) {
      this._table[i] = [];
    }
  }

  set(depth: number, move: Move): void {
    this._table[depth] = [move, ...this._table[depth - 1]];
  }

  get currentPV(): Move[] {
    return [...this._currentPV].reverse();
  }

  pvMove(depth: number): Move | undefined {
    return this._currentPV[depth - 2];
  }
}
