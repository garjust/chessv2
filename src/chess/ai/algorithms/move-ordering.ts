import { ChessComputer } from '../chess-computer';
import { Position } from '../../types';
import Engine from '../../engine';
import Diagnotics from '../search/diagnostics';
import Search from '../search';
import Context from '../search/context';

const MAX_DEPTH = 4;

// Add move ordering to the alpha-beta tree search. Searching better moves
// earlier at a particular node allows alpha-beta to prune more branches of
// the tree.
//
// This is the first expansion in "work" done by the search algorithm
// separate from core engine work (move generation and execution).
export default class MoveOrdering implements ChessComputer {
  engine: Engine;
  diagnostics: Diagnotics;
  context: Context;

  constructor() {
    this.engine = new Engine();
    this.diagnostics = new Diagnotics(this.label, MAX_DEPTH);

    this.context = new Context(MAX_DEPTH, this.engine, this.diagnostics);
    this.context.configuration.pruneNodes = true;
    this.context.configuration.moveOrdering = true;
  }

  get diagnosticsResult() {
    return this.diagnostics.result ?? null;
  }

  get label() {
    return 'alphabeta-v2-move-ordered';
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
