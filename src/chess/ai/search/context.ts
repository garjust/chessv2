import Engine from '../../engine';
import { MoveWithExtraData } from '../../types';
import Diagnostics from './diagnostics';
import { orderMoves } from './move-ordering';
import State from './state';
import { SearchConfiguration } from './types';

// All search features disabled. A search with the default configuration
// will be a plain negamax search.
export const DEFAULT_CONFIGURATION: SearchConfiguration = {
  pruneNodes: false,
  moveOrdering: false,
  quiescenceSearch: false,
  killerMoveHeuristic: false,
  historyMoveHeuristic: false,
  transpositionTableMoveHeuristic: false,
};

export default class Context {
  engine: Engine;
  diagnostics: Diagnostics;
  state: State;
  configuration: SearchConfiguration = DEFAULT_CONFIGURATION;

  constructor(maxDepth: number, engine: Engine, diagnostics: Diagnostics) {
    this.engine = engine;
    this.diagnostics = diagnostics;
    this.state = new State(engine.position, maxDepth);
  }

  quiescenceOrderMoves(moves: MoveWithExtraData[]) {
    return orderMoves(moves);
  }

  orderMoves(
    moves: MoveWithExtraData[],
    currentDepth: number
  ): MoveWithExtraData[] {
    if (this.configuration.moveOrdering) {
      return orderMoves(
        moves,
        this.configuration.transpositionTableMoveHeuristic
          ? this.state.tTable.get()?.move
          : undefined,
        this.state.pvTable.pvMove(currentDepth),
        this.state.killerMoves[currentDepth],
        this.state.historyTable
      );
    } else {
      return moves;
    }
  }
}
