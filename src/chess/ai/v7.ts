import { ChessComputer, ISearchContext, SearchResult } from './types';
import { Position } from '../types';
import Engine from '../engine';
import { orderMoves } from '../engine/move-ordering';
import Diagnotics from './diagnostics';
import { search } from './search';
import SearchContext from './search-context';
import { loadTimer } from '../workers';
import TimeoutError from './timeout-error';

const MAX_DEPTH = 8;
const INITIAL_DEPTH = 1;
const TIMEOUT = 5_000;

// Algorithm:
// - move-ordered alpha-beta negamax search with iterative deepening
// - search through captures
export default class v7 implements ChessComputer {
  label = 'v7';
  engine: Engine;
  diagnostics: Diagnotics[] = [];
  context: ISearchContext;

  constructor() {
    this.engine = new Engine();

    this.context = new SearchContext(
      MAX_DEPTH,
      this.engine,
      this.currentDiagnostics
    );
    this.context.configuration.pruneNodes = true;
    this.context.configuration.quiescenceSearch = true;
    this.context.configuration.killerMoveHeuristic = true;
    this.context.configuration.historyMoveHeuristic = true;
    this.context.configuration.orderMoves = orderMoves;
  }

  get currentDiagnostics() {
    return this.diagnostics[this.diagnostics.length - 1];
  }

  get diagnosticsResult() {
    return this.currentDiagnostics.result ?? null;
  }

  async nextMove(position: Position, timeout = TIMEOUT) {
    this.diagnostics = [];

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

    this.engine.position = position;
    let currentResult: SearchResult = {
      move: { from: -1, to: -1 },
      scores: [],
    };

    for (let i = INITIAL_DEPTH; i <= MAX_DEPTH; i++) {
      await depthTimer.start(await timer.value);
      this.diagnostics.push(new Diagnotics(this.label, i));
      this.context.diagnostics = this.currentDiagnostics;

      try {
        currentResult = await search(i, this.context);
      } catch (error) {
        if (error instanceof TimeoutError) {
          this.diagnostics.pop();
          break;
        } else {
          throw error;
        }
      }

      await depthTimer.stop();
      this.currentDiagnostics.recordResult(
        currentResult.move,
        currentResult.scores,
        this.context.state
      );

      if (await timer.brrring()) {
        break;
      }
    }

    timerCleanup();
    depthTimerCleanup();
    return currentResult.move;
  }

  toJSON(): string {
    return `justins chess computer ${this.label}`;
  }
}
