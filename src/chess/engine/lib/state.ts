import HistoryTable from './history-table';
import PVTable from './pv-table';
import TTableMap from './ttable/ttable-map';
import { Move } from '../../types';
import { TranspositionTable, TranspositionTableEntry } from '../types';
import { Int32TupleZobrist } from '../../lib/zobrist/int32-tuple-zobrist';
import TTableArrayBuffer from './ttable/ttable-array-buffer';

// Reasonable max depth. Since a search can now be infinite time we need a
// reasonable value for initializing our data structures.
export const MAX_DEPTH = 25;

export default class State {
  readonly tTable: TranspositionTable<TranspositionTableEntry>;
  readonly killerMoves: Move[];
  readonly historyTable: HistoryTable;
  pvTable: PVTable;
  currentPV: Move[] = [];

  constructor(maxPlies: number = MAX_DEPTH) {
    // this.tTable = new TTableMap(new Int32TupleZobrist());
    this.tTable = new TTableArrayBuffer(256, new Int32TupleZobrist()); // 256MB
    this.killerMoves = new Array(maxPlies);
    this.historyTable = new HistoryTable();
    this.pvTable = new PVTable(maxPlies);
  }

  pvMove(depth: number): Move | undefined {
    return this.currentPV[depth - 2];
  }
}
