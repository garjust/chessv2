import { Move, Position } from '../../types';
import Diagnotics from '../lib/diagnostics';
import Context from '../lib/context';
import TimeoutError from '../lib/timeout-error';
import {
  InfoReporter,
  SearchConstructor,
  SearchInterface,
  SearchLimit,
  SearchResult,
} from '../types';
import Logger from '../../../lib/logger';
import { MAX_DEPTH } from '../lib/state';
import { DEFAULT_CONFIGURATION } from '../lib/config';

const INITIAL_DEPTH = 1;

/**
 * An iterative approach to the alpha-beta tree search. This algorithm is a
 * series of progressively deeper alpha-beta tree searches starting at
 * maxDepth = 1.
 *
 * This algorithm is used for two reasons:
 * (1) Playing with time control
 *   If we chose some depth N for the search but it did not complete fast
 *   enough in a time control game we would have no move to play. An iterative
 *   approach ensures we always have a fully complete search at the previous
 *   depth
 * (2) It is often faster
 *   Counter-intuitively, searching iteratively to a depth of N can be faster
 *   than an immediate search at depth N. This is because we create state
 *   during each iteration which can make future iterations faster than they
 *   would otherwise be (better move ordering, more TTable hits, etc).
 */
export default class AlphaBetaIterative implements SearchInterface {
  diagnostics?: Diagnotics;
  context: Context;
  logger: Logger;

  constructor(
    reporter: InfoReporter,
    options: Partial<typeof DEFAULT_CONFIGURATION> = {},
  ) {
    this.context = new Context(reporter, {
      pruneNodes: true,
      quiescenceSearch: true,
      moveOrdering: true,
      moveOrderingHeuristics: {
        killerMove: true,
        historyTable: true,
        pvMove: true,
        hashMove: true,
      },
      pruneFromTTable: true,
      ...options,
    });
    this.logger = new Logger('iterative');
  }

  get diagnosticsResult() {
    return this.diagnostics?.result ?? null;
  }

  get label() {
    return 'alpha-beta-iterative';
  }

  async nextMove(
    position: Position,
    movesToSearch: Move[],
    timeout: number,
    limits?: SearchLimit,
  ) {
    this.diagnostics = undefined;
    let currentResult: SearchResult | null = null;
    let diagnostics: Diagnotics | undefined;

    const maxDepth = limits?.depth ?? MAX_DEPTH;
    this.context.timer.start(limits?.moveTime ?? timeout);

    for (let i = INITIAL_DEPTH; i <= maxDepth; i++) {
      try {
        [currentResult, diagnostics] = await this.context.search(
          position,
          i,
          movesToSearch,
        );
      } catch (error) {
        if (error instanceof TimeoutError) {
          console.warn('search timeout');
          break;
        } else {
          throw error;
        }
      }

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
        this.logger.warn(`${this.label} search result`, diagnostics.result);
      }
    }

    if (currentResult === null) {
      throw Error('no search result');
    }
    return currentResult.move;
  }

  ponderMove(_1: Position, _2: Move) {
    throw new Error(`search ${this.label} cannot ponder`);
  }
}
const _: SearchConstructor = AlphaBetaIterative;
