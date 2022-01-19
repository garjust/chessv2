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
  diagnostics: Diagnotics;
  context: Context;

  constructor() {
    this.engine = new Engine();
    this.diagnostics = new Diagnotics(this.label, MAX_DEPTH);

    this.context = new Context(MAX_DEPTH, this.engine, this.diagnostics);
    this.context.configuration.pruneNodes = true;
  }

  get diagnosticsResult() {
    return this.diagnostics.result ?? null;
  }

  get label() {
    return 'alphabeta';
  }

  resetDiagnostics() {
    this.diagnostics = new Diagnotics(this.label, MAX_DEPTH);
    this.context.diagnostics = this.diagnostics;
  }

  async nextMove(position: Position) {
    this.resetDiagnostics();

    this.engine.position = position;
    const { scores, move } = await new Search(MAX_DEPTH, this.context).run();

    this.diagnostics.recordResult(move, scores);
    return move;
  }
}
