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
  context: Context;
  diagnostics?: Diagnotics;

  constructor() {
    this.engine = new Engine();

    this.context = new Context(this.label, MAX_DEPTH, this.engine);
    this.context.configuration.pruneNodes = true;
    this.context.configuration.moveOrdering = true;
  }

  get diagnosticsResult() {
    return this.diagnostics?.result ?? null;
  }

  get label() {
    return 'alphabeta-v2-move-ordered';
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
