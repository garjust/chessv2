import { Remote } from 'comlink';
import Timer from '../../../lib/timer';
import HistoryTable from './history-table';
import PVTable from './pv-table';
import TTableMap from './ttable-map';
import { Move } from '../../types';
import { TranspositionTable, TranspositionTableEntry } from '../types';
import { Int32TupleZobrist } from '../../lib/zobrist/int32-tuple-zobrist';

// Communication with web workers is slow, too slow to do at every node.
//
// Instead of asking the timer if it has reached 0 at every node we instead
// will only check the actual timer once per X ms. X should be larger than or
// equal to the timer tick rate.
const TIMER_SAMPLE_RATE = 200;

// Make an assumption about how long it takes to process a node in the search
// tree.
const MICROSECONDS_PER_NODE = 50;

// Reasonable max depth. Since a search can now be infinite time we need a
// reasonable value for initializing our data structures.
export const MAX_DEPTH = 25;

// Caculate a threshold using the assumption for μs/node and the sample rate.
// We also assume the timer is read exactly once per node.
const TIMER_SAMPLE_THRESHOLD =
  (TIMER_SAMPLE_RATE * 1000) / MICROSECONDS_PER_NODE;

export default class State {
  readonly killerMoves: Move[];
  readonly historyTable: HistoryTable;
  readonly tTable: TranspositionTable<TranspositionTableEntry>;

  pvTable: PVTable;
  currentPV: Move[] = [];
  timer: Remote<Timer> | null = null;

  _timerSampleCounter = 0;

  constructor(maxDepth: number = MAX_DEPTH) {
    this.killerMoves = new Array(maxDepth);
    this.historyTable = new HistoryTable();
    this.tTable = new TTableMap(new Int32TupleZobrist());
    this.pvTable = new PVTable(maxDepth);
  }

  async timeoutReached(): Promise<boolean> {
    this._timerSampleCounter++;
    if (this.timer && this._timerSampleCounter >= TIMER_SAMPLE_THRESHOLD) {
      this._timerSampleCounter = 0;
      return this.timer.brrring();
    } else {
      return false;
    }
  }

  pvMove(depth: number): Move | undefined {
    return this.currentPV[depth - 2];
  }
}
