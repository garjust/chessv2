import { Move, Position } from '../../types';
import Core from '../../core';
import Diagnotics from '../lib/diagnostics';
import Context from '../lib/context';
import {
  InfoReporter,
  SearchConstructor,
  SearchInterface,
} from '../search-interface';

const MAX_DEPTH = 4;

// A step up from the negamax algorithm, this is the classic tree search
// algorithm used for games like chess.
//
// Alpha-beta adds tree-pruning to the tree search in a way that is completely
// safe. Alpha-beta will always return the same move as negamax.
export default class AlphaBeta implements SearchInterface {
  maxDepth: number;
  engine: Core;
  context: Context;
  diagnostics?: Diagnotics;

  constructor(infoReporter: InfoReporter) {
    this.maxDepth = MAX_DEPTH;
    this.engine = new Core();
    this.context = new Context(this.label, MAX_DEPTH, this.engine, {
      pruneNodes: true,
    });
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
const _: SearchConstructor = AlphaBeta;
