import HistoryTable from './history-table';
import PVTable from './pv-table';
import TTableMap from './ttable/ttable-map';
import { Move } from '../../types';
import { TranspositionTable, TranspositionTableEntry } from '../types';
import { Int32TupleZobrist } from '../../lib/zobrist/int32-tuple-zobrist';

// Reasonable max depth. Since a search can now be infinite time we need a
// reasonable value for initializing our data structures.
export const MAX_DEPTH = 25;

export default class State {
  readonly killerMoves: Move[];
  readonly historyTable: HistoryTable;
  readonly tTable: TranspositionTable<TranspositionTableEntry>;

  pvTable: PVTable;
  currentPV: Move[] = [];

  constructor(maxDepth: number = MAX_DEPTH) {
    this.killerMoves = new Array(maxDepth);
    this.historyTable = new HistoryTable();
    this.tTable = new TTableMap(new Int32TupleZobrist());
    this.pvTable = new PVTable(maxDepth);
  }

  pvMove(depth: number): Move | undefined {
    return this.currentPV[depth - 2];
  }
}
