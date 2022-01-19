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
  moveOrderingHeuristics: {
    killerMove: false,
    historyMove: false,
    pvMove: false,
    hashMove: false,
  },
  quiescenceSearch: false,
};

export default class Context {
  label: string;
  engine: Engine;
  state: State;
  configuration: SearchConfiguration = DEFAULT_CONFIGURATION;
  diagnostics?: Diagnostics;

  constructor(label: string, maxDepth: number, engine: Engine) {
    this.label = label;
    this.engine = engine;
    this.state = new State(engine.position, maxDepth);
  }

  newDiagnostics(maxDepth: number) {
    this.diagnostics = new Diagnostics(this.label, maxDepth);
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
        this.configuration.moveOrderingHeuristics.hashMove
          ? this.state.tTable.get()?.move
          : undefined,
        this.configuration.moveOrderingHeuristics.pvMove
          ? this.state.pvTable.pvMove(currentDepth)
          : undefined,
        this.configuration.moveOrderingHeuristics.killerMove
          ? this.state.killerMoves[currentDepth]
          : undefined,
        this.configuration.moveOrderingHeuristics.historyMove
          ? this.state.historyTable
          : undefined
      );
    } else {
      return moves;
    }
  }
}
