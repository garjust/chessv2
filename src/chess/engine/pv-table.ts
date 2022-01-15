import { Move } from '../types';
import { IPrincipalVariationTable } from './types';

export default class PVTable implements IPrincipalVariationTable {
  readonly _table: Move[][];

  constructor(maxDepth: number) {
    this._table = [];
    for (let i = 0; i < maxDepth; i++) {
      this._table[i] = [];
    }
  }

  set(searchDepth: number, depth: number, move: Move) {
    this._table[searchDepth - 1][depth - 1] = move;
  }

  get(searchDepth: number, depth: number) {
    return this._table[searchDepth - 1][depth - 1];
  }

  get pv() {
    return [...this._table[0]].reverse();
  }
}
