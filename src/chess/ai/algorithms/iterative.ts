import { ChessComputer } from '../chess-computer';
import { Position } from '../../types';
import Engine from '../../engine';
import Diagnotics from '../search/diagnostics';
import Context from '../search/context';
import { loadTimer } from '../../workers';
import TimeoutError from '../search/timeout-error';
import { SearchResult } from '../search/types';

const MAX_DEPTH = 4;
const INITIAL_DEPTH = 1;
const TIMEOUT = 10_000;

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
export default class Iterative implements ChessComputer {
  maxDepth: number;
  engine: Engine;
  diagnostics?: Diagnotics;
  context: Context;

  constructor(maxDepth = MAX_DEPTH) {
    this.maxDepth = maxDepth;
    this.engine = new Engine();
    this.context = new Context(this.label, maxDepth, this.engine, {
      pruneNodes: true,
      quiescenceSearch: false,
      moveOrdering: true,
      moveOrderingHeuristics: {
        killerMove: true,
        historyTable: true,
        pvMove: true,
        hashMove: true,
      },
      pruneFromTTable: false,
    });
  }

  get diagnosticsResult() {
    return this.diagnostics?.result ?? null;
  }

  get label() {
    return 'alphabeta-iterative';
  }

  async nextMove(position: Position, timeout = TIMEOUT) {
    this.diagnostics = undefined;
    this.engine.position = position;
    let currentResult: SearchResult | null = null;
    let diagnostics: Diagnotics | undefined;

    const [timer, timerCleanup] = await loadTimer(
      `${this.label}-search`,
      timeout
    );
    const [depthTimer, depthTimerCleanup] = await loadTimer(
      `${this.label}-search-for-depth`,
      0,
      false
    );
    this.context.state.timer = depthTimer;

    for (let i = INITIAL_DEPTH; i <= this.maxDepth; i++) {
      await depthTimer.start(await timer.value);

      try {
        [currentResult, diagnostics] = await this.context.withDiagnostics(i);
      } catch (error) {
        if (error instanceof TimeoutError) {
          break;
        } else {
          throw error;
        }
      }

      await depthTimer.stop();

      this.diagnostics = diagnostics;
      console.log(
        '[intermediate result]:',
        this.diagnostics?.result?.logStringLight,
        this.diagnostics?.result?.principleVariation
      );
    }

    timerCleanup();
    depthTimerCleanup();

    if (currentResult === null) {
      throw Error('no search result');
    }
    return currentResult.move;
  }
}
