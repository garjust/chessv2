import { Move, Position } from '../../types';
import Core from '../../core';
import Diagnotics from '../lib/diagnostics';
import Context from '../lib/context';
import {
  SearchInterface,
  SearchConstructor,
  InfoReporter,
  SearchLimit,
} from '../search-interface';
import { MAX_DEPTH } from '../lib/state';

// Add move ordering to the alpha-beta tree search. Searching better moves
// earlier at a particular node allows alpha-beta to prune more branches of
// the tree.
//
// This is the first expansion in "work" done by the search algorithm
// separate from core engine work (move generation and execution).
export default class OrderMoves implements SearchInterface {
  context: Context;
  diagnostics?: Diagnotics;

  constructor(reporter: InfoReporter) {
    this.context = new Context(this.label, reporter, {
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

  async nextMove(
    position: Position,
    _1: Move[],
    _2: number,
    limits: SearchLimit,
  ) {
    this.diagnostics = undefined;

    const [{ move }, diagnostics] = await this.context.withDiagnostics(
      position,
      limits.depth ?? MAX_DEPTH,
    );

    this.diagnostics = diagnostics;
    return move;
  }

  ponderMove(_1: Position, _2: Move) {
    throw new Error(`search ${this.label} cannot ponder`);
  }
}
const _: SearchConstructor = OrderMoves;
