import Search from './search';
import Core from '../../core';
import { Move, MoveWithExtraData, Position } from '../../types';
import Diagnostics from './diagnostics';
import { orderMoves } from './move-ordering';
import PVTable from './pv-table';
import { extractPV } from './score-utils';
import State from './state';
import { InfoReporter, SearchResult } from '../types';
import { DEFAULT_CONFIGURATION } from './config';
import TimerSync from '../../../lib/timer-sync';
import Sampler from './sampler';

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
  readonly reporter: InfoReporter;
  readonly core: Core;
  readonly configuration: typeof DEFAULT_CONFIGURATION;
  readonly state: State;
  diagnostics?: Diagnostics;
  timer: TimerSync;
  sampler: Sampler;

  constructor(
    reporter: InfoReporter,
    config: Partial<typeof DEFAULT_CONFIGURATION> = {},
  ) {
    this.reporter = reporter;
    this.core = new Core();
    this.state = new State();
    this.core.zobrist = this.state.tTable.currentKey;
    this.configuration = { ...DEFAULT_CONFIGURATION, ...config };
    this.timer = new TimerSync(0);
    this.sampler = new Sampler();
  }

  async search(
    position: Position,
    maxDepth: number,
    movesToSearch: Move[],
  ): Promise<[SearchResult, Diagnostics]> {
    this.diagnostics = new Diagnostics(maxDepth);
    const result = await this.run(position, maxDepth, movesToSearch);
    this.diagnostics.recordResult(result, this.state);

    return [result, this.diagnostics];
  }

  useTTForPV = true;

  async run(position: Position, maxDepth: number, movesToSearch: Move[]) {
    this.core.position = position;

    // Before executing a search update state.
    this.state.pvTable = new PVTable(maxDepth);

    const result = await new Search(this).search(maxDepth, movesToSearch);

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
