import { Remote } from 'comlink';
import Timer from '../../../lib/timer';
import HistoryTable from '../../engine/history-table';
import PVTable from '../../engine/pv-table';
import TranspositionTable from '../../engine/transposition-table';
import { Move, Position } from '../../types';
import { TranspositionTableEntry } from './types';

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

export default class State {
  killerMoves: Move[];
  historyTable: HistoryTable;
  pvTable: PVTable;
  tTable: TranspositionTable<TranspositionTableEntry>;
  timer: Remote<Timer> | null = null;

  moveExecutionOptions: {
    table?: TranspositionTable<TranspositionTableEntry>;
  };

  _timerSampleCounter = 0;

  constructor(position: Position, depth: number) {
    this.killerMoves = new Array(depth);
    this.historyTable = new HistoryTable();
    this.pvTable = new PVTable(depth);
    this.tTable = new TranspositionTable(position);
    this.moveExecutionOptions = {
      table: this.tTable,
    };
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
}
