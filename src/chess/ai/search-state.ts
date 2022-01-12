import { Move } from '../types';
import { ISearchState } from './types';

export default class SearchState implements ISearchState {
  killerMoves: Move[];

  constructor(depth: number) {
    this.killerMoves = new Array(depth);
  }
}
