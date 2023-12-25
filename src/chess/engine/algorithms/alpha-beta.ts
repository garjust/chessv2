import { Move, Position } from '../../types';
import Context from '../lib/context';
import {
  InfoReporter,
  SearchConstructor,
  SearchInterface,
  SearchLimit,
} from '../types';
import { MAX_DEPTH } from '../lib/state';
import Logger from '../../../lib/logger';
import { DEFAULT_CONFIGURATION } from '../lib/config';

/**
 * A step up from the negamax algorithm, this is the classic tree search
 * algorithm used for games like chess.
 *
 * Alpha-beta adds tree-pruning to the negamax tree search in a way that is
 * completely safe. Alpha-beta will always return the same move as negamax.
 */
export default class AlphaBeta implements SearchInterface {
  context: Context;
  logger: Logger;

  constructor(
    reporter: InfoReporter,
    options: Partial<typeof DEFAULT_CONFIGURATION> = {},
  ) {
    this.context = new Context(reporter, {
      pruneNodes: true,
      ...options,
    });
    this.logger = new Logger('alpha-beta');
  }

  get label() {
    return 'alpha-beta';
  }

  nextMove(
    position: Position,
    movesToSearch: Move[],
    _2: number,
    limits: SearchLimit,
  ) {
    const [{ pv, bestScore }, diagnosticsResult] = this.context.search(
      position,
      limits.depth ?? MAX_DEPTH,
      movesToSearch,
    );

    this.context.reporter({
      depth: diagnosticsResult.depth.toString(),
      score: diagnosticsResult.evaluation,
      time: diagnosticsResult.timing.toString(),
      nodes: diagnosticsResult.totalNodes.toString(),
      nps: (
        (diagnosticsResult.totalNodes / diagnosticsResult.timing) *
        1000
      ).toFixed(0),
      pv: diagnosticsResult.principleVariation?.join(' '),
    });
    // this.logger.debug(`${this.label} full diagnostic`, diagnosticResults);

    return { move: bestScore.move, evaluation: bestScore.score, pv };
  }

  ponderMove(_1: Position, _2: Move) {
    throw new Error(`search ${this.label} cannot ponder`);
  }
}
const _: SearchConstructor = AlphaBeta;
