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
  engine: Engine;
  diagnostics?: Diagnotics;
  context: Context;

  constructor() {
    this.engine = new Engine();

    this.context = new Context(this.label, MAX_DEPTH, this.engine);
    this.context.configuration.pruneNodes = true;
    this.context.configuration.moveOrdering = true;
    this.context.configuration.quiescenceSearch = true;
    this.context.configuration.moveOrderingHeuristics.killerMove = true;
    this.context.configuration.moveOrderingHeuristics.historyMove = true;
    this.context.configuration.moveOrderingHeuristics.pvMove = true;
    this.context.configuration.moveOrderingHeuristics.hashMove = true;
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
    let currentResult: SearchResult = {
      move: { from: -1, to: -1 },
      pv: [],
      scores: [],
    };
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

    this.context.state.tTable.newHash(position);

    for (let i = INITIAL_DEPTH; i <= MAX_DEPTH; i++) {
      await depthTimer.start(await timer.value);

      // PVTable needs to be reset each iteration, extract the prior PV before
      // the reset.
      this.context.state.pvTable.nextIteration(i);

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
        this.diagnostics?.result?.logString,
        this.diagnostics?.result?.principleVariation
      );

      if (await timer.brrring()) {
        break;
      }
    }

    timerCleanup();
    depthTimerCleanup();
    return currentResult.move;
  }
}
