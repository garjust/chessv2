import { Move, Position } from '../../types';
import Diagnotics from '../lib/diagnostics';
import Context from '../lib/context';
import { loadTimerWorker } from '../../workers';
import TimeoutError from '../lib/timeout-error';
import { SearchResult } from '../lib/types';
import Logger from '../../../lib/logger';
import {
  InfoReporter,
  SearchConstructor,
  SearchInterface,
  SearchLimit,
} from '../search-interface';
import { MAX_DEPTH } from '../lib/state';

const INITIAL_DEPTH = 1;

// An iterative approach to the alpha-beta tree search. This algorithm is a
// series of progressively deeper alpha-beta tree searches starting at
// maxDepth = 1.
//
// This algorithm is used for two reasons:
// (1) Playing with time control
//   If we chose some depth N for the search but it did not complete fast
//   enough in a time control game we would have no move to play. An iterative
//   approach ensures we always have a fully complete search at the previous
//   depth
// (2) It is often faster
//   Counter-intuitively, searching iteratively to a depth of N can be faster
//   than an immediate search at depth N. This is because we create state
//   during each iteration which can make future iterations faster than they
//   would otherwise be (better move ordering, more TTable hits, etc).
export default class Iterative implements SearchInterface {
  diagnostics?: Diagnotics;
  context: Context;
  logger: Logger;

  constructor(reporter: InfoReporter) {
    this.context = new Context(this.label, reporter, {
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
    });
    this.logger = new Logger('iterative-executor');
  }

  get diagnosticsResult() {
    return this.diagnostics?.result ?? null;
  }

  get label() {
    return 'alphabeta-iterative';
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

    const [timer, timerCleanup] = await loadTimerWorker(timeout, {
      label: `${this.label}-search`,
    });
    const [depthTimer, depthTimerCleanup] = await loadTimerWorker(0, {
      autoStart: false,
      label: `${this.label}-search-for-depth`,
    });
    this.context.state.timer = depthTimer;

    for (let i = INITIAL_DEPTH; i <= (limits?.depth ?? MAX_DEPTH); i++) {
      await depthTimer.start(await timer.value);

      try {
        [currentResult, diagnostics] = await this.context.withDiagnostics(
          position,
          i,
        );
      } catch (error) {
        if (error instanceof TimeoutError) {
          break;
        } else {
          throw error;
        }
      }

      await depthTimer.stop();

      this.diagnostics = diagnostics;
      this.logger.debug(
        'intermediate result:',
        this.diagnostics?.result?.logStringLight,
        this.diagnostics.result?.evaluation,
        this.diagnostics?.result?.principleVariation,
      );
    }

    timerCleanup();
    depthTimerCleanup();

    if (currentResult === null) {
      throw Error('no search result');
    }
    return currentResult.move;
  }

  ponderMove(_1: Position, _2: Move) {
    throw new Error(`search ${this.label} cannot ponder`);
  }
}
const _: SearchConstructor = Iterative;
