import { ChessComputer } from '../chess-computer';
import { Position } from '../../types';
import Engine from '../../engine';
import Diagnotics from '../search/diagnostics';
import Search from '../search';
import Context from '../search/context';

const MAX_DEPTH = 4;

// A step up from the negamax algorithm, this is the classic tree search
// algorithm used for games like chess.
//
// Alpha-beta adds tree-pruning to the tree search in a way that is completely
// safe. Alpha-beta will always return the same move as negamax.
export default class AlphaBeta implements ChessComputer {
  engine: Engine;
  context: Context;
  diagnostics?: Diagnotics;

  constructor() {
    this.engine = new Engine();

    this.context = new Context(this.label, MAX_DEPTH, this.engine);
    this.context.configuration.pruneNodes = true;
  }

  get diagnosticsResult() {
    return this.diagnostics?.result ?? null;
  }

  get label() {
    return 'alphabeta';
  }

  async nextMove(position: Position) {
    this.diagnostics = undefined;
    this.engine.position = position;

    const [{ move }, diagnostics] = await new Search(
      MAX_DEPTH,
      this.context
    ).run();

    this.diagnostics = diagnostics;
    return move;
  }
}
