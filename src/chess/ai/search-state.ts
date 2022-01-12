import { Remote } from 'comlink';
import Timer from '../../lib/timer';
import { Move, Square } from '../types';
import { IHistoryTable, ISearchState } from './types';

class HistoryTable implements IHistoryTable {
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

// Communication with web workers is slow, too slow to do at every node.
//
// Instead of asking the timer if it has reached 0 at every node we instead
// will only check the actual timer once per X ms. X should be larger than or
// equal to the timer tick rate.
const TIMER_SAMPLE_RATE = 200;

// Make an assumption about how long it takes to process a node in the search
// tree.
const MICROSECONDS_PER_NODE = 30;

// Caculate a threshold using the assumption for μs/node and the sample rate.
const TIMER_SAMPLE_THRESHOLD =
  (TIMER_SAMPLE_RATE * 1000) / MICROSECONDS_PER_NODE;

export default class SearchState implements ISearchState {
  killerMoves: Move[];
  historyTable: HistoryTable;
  timer: Remote<Timer> | null = null;

  _timerSampleCounter = 0;

  constructor(depth: number) {
    this.killerMoves = new Array(depth);
    this.historyTable = new HistoryTable();
  }

  async timeoutReached() {
    this._timerSampleCounter++;
    if (this.timer && this._timerSampleCounter >= TIMER_SAMPLE_THRESHOLD) {
      this._timerSampleCounter = 0;
      return this.timer.brrring();
    } else {
      return false;
    }
  }
}
