import { Move } from '../types';
import { IPVTable } from './types';

export default class PVTable implements IPVTable {
  _table: Move[][] = [[]];
  _currentPV: Move[];

  constructor(maxDepth: number) {
    this._currentPV = [];
    this.nextIteration(maxDepth);
  }

  nextIteration(maxDepth: number) {
    this._currentPV = [...this._table[this._table.length - 1]].reverse();
    this._table = Array(maxDepth);
    for (let i = 0; i <= maxDepth; i++) {
      this._table[i] = [];
    }
  }

  set(depth: number, move: Move) {
    this._table[depth] = [move, ...this._table[depth - 1]];
  }

  get currentPV() {
    return [...this._currentPV].reverse();
  }

  pvMove(depth: number) {
    return this._currentPV[depth - 2];
  }
}
