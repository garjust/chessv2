import Search from './search';
import Core from '../../core';
import { Move, MoveWithExtraData, Position } from '../../types';
import Diagnostics, { DiagnosticsResult } from './diagnostics';
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
  diagnostics: Diagnostics;
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
    this.timer = new TimerSync(0, { label: 'search-timer' });
    this.sampler = new Sampler();
    this.diagnostics = new Diagnostics(1);
  }

  search(
    position: Position,
    maxPlies: number,
    movesToSearch: Move[],
  ): [SearchResult, DiagnosticsResult] {
    this.diagnostics = new Diagnostics(maxPlies);
    const result = this.run(position, maxPlies, movesToSearch);

    const diagnosticsResult = this.diagnostics.recordResult(result, this.state);
    this.reporter({
      string: this.diagnostics.ttableLog(this.state),
    });

    return [result, diagnosticsResult];
  }

  run(position: Position, maxPlies: number, movesToSearch: Move[]) {
    this.core.position = position;

    // Before executing a search update state.
    this.state.pvTable = new PVTable(maxPlies);

    const result = new Search(this).search(maxPlies, movesToSearch);

    // Extract the PV from the result for future searches with this context.
    this.state.setCurrentPV(result.pv);

    return result;
  }

  quiescenceOrderMoves(moves: MoveWithExtraData[]) {
    return orderMoves(this.core.position.pieces, moves);
  }

  orderMoves(
    moves: MoveWithExtraData[],
    depth: number,
    ply: number,
  ): MoveWithExtraData[] {
    if (this.configuration.moveOrdering) {
      return orderMoves(
        this.core.position.pieces,
        moves,
        this.configuration.moveOrderingHeuristics.hashMove
          ? this.state.tTable.get()?.move
          : undefined,
        this.configuration.moveOrderingHeuristics.pvMove
          ? this.state.pvMove(ply)
          : undefined,
        this.configuration.moveOrderingHeuristics.killerMove
          ? this.state.killerMoves[depth]
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
