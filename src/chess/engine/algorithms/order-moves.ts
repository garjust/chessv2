import { SearchInterface } from '../search-executor';
import { Position } from '../../types';
import Core from '../../core';
import Diagnotics from '../lib/diagnostics';
import Context from '../lib/context';

const MAX_DEPTH = 6;

// Add move ordering to the alpha-beta tree search. Searching better moves
// earlier at a particular node allows alpha-beta to prune more branches of
// the tree.
//
// This is the first expansion in "work" done by the search algorithm
// separate from core engine work (move generation and execution).
export default class OrderMoves implements SearchInterface {
  maxDepth: number;
  engine: Core;
  context: Context;
  diagnostics?: Diagnotics;

  constructor(maxDepth = MAX_DEPTH) {
    this.maxDepth = maxDepth;
    this.engine = new Core();
    this.context = new Context(this.label, maxDepth, this.engine, {
      pruneNodes: true,
      moveOrdering: true,
    });
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

    const [{ move }, diagnostics] = await this.context.withDiagnostics(
      this.maxDepth,
    );

    this.diagnostics = diagnostics;
    return move;
  }
}
