import { Move, Position } from '../../types';
import Diagnotics from '../lib/diagnostics';
import Context from '../lib/context';
import {
  InfoReporter,
  SearchConstructor,
  SearchInterface,
  SearchLimit,
} from '../types';
import { MAX_DEPTH } from '../lib/state';

// A step up from the negamax algorithm, this is the classic tree search
// algorithm used for games like chess.
//
// Alpha-beta adds tree-pruning to the negamax tree search in a way that is
// completely safe. Alpha-beta will always return the same move as negamax.
export default class AlphaBeta implements SearchInterface {
  context: Context;
  diagnostics?: Diagnotics;

  constructor(reporter: InfoReporter) {
    this.context = new Context(this.label, reporter, {
      pruneNodes: true,
    });
  }

  get diagnosticsResult() {
    return this.diagnostics?.result ?? null;
  }

  get label() {
    return 'alpha-beta';
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
const _: SearchConstructor = AlphaBeta;
