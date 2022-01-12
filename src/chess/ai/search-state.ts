import { Remote } from 'comlink';
import Timer from '../../lib/timer';
import { Move } from '../types';
import { ISearchState } from './types';

export default class SearchState implements ISearchState {
  killerMoves: Move[];
  timer: Remote<Timer> | null = null;

  constructor(depth: number) {
    this.killerMoves = new Array(depth);
  }

  async timeoutReached() {
    return this.timer ? this.timer.brrring() : false;
  }
}
