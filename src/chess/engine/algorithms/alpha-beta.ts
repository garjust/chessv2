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
import Logger from '../../../lib/logger';

/**
 * A step up from the negamax algorithm, this is the classic tree search
 * algorithm used for games like chess.
 *
 * Alpha-beta adds tree-pruning to the negamax tree search in a way that is
 * completely safe. Alpha-beta will always return the same move as negamax.
 */
export default class AlphaBeta implements SearchInterface {
  context: Context;
  diagnostics?: Diagnotics;
  logger: Logger;

  constructor(reporter: InfoReporter) {
    this.context = new Context(reporter, {
      pruneNodes: true,
    });
    this.logger = new Logger('alpha-beta');
  }

  get diagnosticsResult() {
    return this.diagnostics?.result ?? null;
  }

  get label() {
    return 'alpha-beta';
  }

  async nextMove(
    position: Position,
    movesToSearch: Move[],
    _2: number,
    limits: SearchLimit,
  ) {
    this.diagnostics = undefined;

    const [{ move }, diagnostics] = await this.context.search(
      position,
      limits.depth ?? MAX_DEPTH,
      movesToSearch,
    );

    this.diagnostics = diagnostics;
    if (diagnostics.result) {
      this.context.reporter({
        depth: diagnostics.result.depth.toString(),
        score: diagnostics.result.evaluation,
        time: diagnostics.result.timing.toString(),
        nodes: diagnostics.result.totalNodes.toString(),
        nps: (
          (diagnostics.result.totalNodes / diagnostics.result.timing) *
          1000
        ).toFixed(0),
        pv: diagnostics.result.principleVariation?.join(' '),
      });
      this.logger.debug(`${this.label} full diagnostic`, diagnostics.result);
    }
    return move;
  }

  ponderMove(_1: Position, _2: Move) {
    throw new Error(`search ${this.label} cannot ponder`);
  }
}
const _: SearchConstructor = AlphaBeta;
