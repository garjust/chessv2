import Search from '.';
import Core from '../../core';
import { MoveWithExtraData, Position } from '../../types';
import Diagnostics from './diagnostics';
import { orderMoves } from './move-ordering';
import PVTable from './pv-table';
import { extractPV } from './score-utils';
import State from './state';
import { InfoReporter, SearchConfiguration, SearchResult } from '../types';

// All search features disabled. A search with the default configuration
// will be a plain negamax search.
export const DEFAULT_CONFIGURATION: SearchConfiguration = {
  pruneNodes: false,
  moveOrdering: false,
  moveOrderingHeuristics: {
    killerMove: false,
    historyTable: false,
    pvMove: false,
    hashMove: false,
  },
  quiescenceSearch: false,
  pruneFromTTable: false,
};

/**
 * The context object contains any information, state, or other objects
 * used by the search algorithm. This includes configuration for how the
 * search should operate, a pointer to the chess core used, various
 * state tables, etc.
 *
 * The context object also provides an entry point to running the search
 * algorithm which will perform some extra work updating state, extracting the
 * PV from the state, etc.
 */
export default class Context {
  readonly label: string;
  readonly reporter: InfoReporter;
  readonly core: Core;
  readonly configuration: SearchConfiguration;
  readonly state: State;
  diagnostics?: Diagnostics;

  constructor(
    label: string,
    reporter: InfoReporter,
    config: Partial<SearchConfiguration> = {},
  ) {
    this.label = label;
    this.reporter = reporter;
    this.core = new Core();
    this.state = new State();
    this.core.zobrist = this.state.tTable.currentKey;
    this.configuration = { ...DEFAULT_CONFIGURATION, ...config };
  }

  // Run a search with diagnostics.
  async withDiagnostics(
    position: Position,
    maxDepth: number,
  ): Promise<[SearchResult, Diagnostics]> {
    this.diagnostics = new Diagnostics(this.label, maxDepth);
    const result = await this.run(position, maxDepth);
    this.diagnostics.recordResult(result, this.state);

    return [result, this.diagnostics];
  }

  useTTForPV = true;

  async run(position: Position, maxDepth: number) {
    this.core.position = position;

    // Before executing a search update state.
    this.state.pvTable = new PVTable(maxDepth);

    const result = await new Search(this).search(maxDepth);

    // If we want to use the TT to extract the PV we overwrite the result's
    // PV.
    if (this.useTTForPV) {
      result.pv = extractPV(this.state.tTable, this.core);
    }
    // Extract the PV from the result for future searches with this context.
    this.state.currentPV = [...result.pv].reverse();

    return result;
  }

  quiescenceOrderMoves(moves: MoveWithExtraData[]) {
    return orderMoves(this.core.position.pieces, moves);
  }

  orderMoves(
    moves: MoveWithExtraData[],
    currentDepth: number,
  ): MoveWithExtraData[] {
    if (this.configuration.moveOrdering) {
      return orderMoves(
        this.core.position.pieces,
        moves,
        this.configuration.moveOrderingHeuristics.hashMove
          ? this.state.tTable.get()?.move
          : undefined,
        this.configuration.moveOrderingHeuristics.pvMove
          ? this.state.pvMove(currentDepth)
          : undefined,
        this.configuration.moveOrderingHeuristics.killerMove
          ? this.state.killerMoves[currentDepth]
          : undefined,
        this.configuration.moveOrderingHeuristics.historyTable
          ? this.state.historyTable
          : undefined,
      );
    } else {
      return moves;
    }
  }
}
