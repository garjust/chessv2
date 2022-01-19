import Engine from '../../engine';
import { MoveWithExtraData } from '../../types';
import Diagnostics from './diagnostics';
import State from './state';
import { SearchConfiguration } from './types';

// All search features disabled. A search with the default configuration
// will be a plain negamax search.
export const DEFAULT_CONFIGURATION: SearchConfiguration = {
  pruneNodes: false,
  quiescenceSearch: false,
  killerMoveHeuristic: false,
  historyMoveHeuristic: false,
  transpositionTableMoveHeuristic: false,
  orderMoves: (moves: MoveWithExtraData[]) => moves,
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
}
