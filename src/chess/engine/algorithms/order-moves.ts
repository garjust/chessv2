import { Move, Position } from '../../types';
import Core from '../../core';
import Diagnotics from '../lib/diagnostics';
import Context from '../lib/context';
import {
  SearchInterface,
  SearchConstructor,
  InfoReporter,
} from '../search-interface';

const MAX_DEPTH = 6;

// Add move ordering to the alpha-beta tree search. Searching better moves
// earlier at a particular node allows alpha-beta to prune more branches of
// the tree.
//
// This is the first expansion in "work" done by the search algorithm
// separate from core engine work (move generation and execution).
export default class OrderMoves implements SearchInterface {
  maxDepth: number;
  core: Core;
  context: Context;
  diagnostics?: Diagnotics;

  constructor(infoReporter: InfoReporter) {
    this.maxDepth = MAX_DEPTH;
    this.core = new Core();
    this.context = new Context(this.label, MAX_DEPTH, this.core, {
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
    this.core.position = position;

    const [{ move }, diagnostics] = await this.context.withDiagnostics(
      this.maxDepth,
    );

    this.diagnostics = diagnostics;
    return move;
  }

  ponderMove(_1: Position, _2: Move) {
    throw new Error(`search ${this.label} cannot ponder`);
  }
}
const _: SearchConstructor = OrderMoves;
