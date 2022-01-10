import { ChessComputer, SearchContext } from './types';
import { Position } from '../types';
import Engine from '../engine';
import { orderMoves } from '../engine/move-ordering';
import Diagnotics from './diagnostics';
import { search } from './search';

const DEPTH = 4;

// Algorithm:
// - move-ordered alpha-beta negamax search
export default class v5 implements ChessComputer {
  engine: Engine;
  diagnostics: Diagnotics;
  context: SearchContext;

  constructor() {
    this.engine = new Engine();
    this.diagnostics = new Diagnotics('v5', DEPTH);

    this.context = {
      engine: this.engine,
      diagnostics: this.diagnostics,
      pruneNodes: true,
      quiescenceSearch: false,
      orderMoves,
    };
  }

  get diagnosticsResult() {
    return this.diagnostics.result ?? null;
  }

  resetDiagnostics() {
    this.diagnostics = new Diagnotics('v5', DEPTH);
    this.context.diagnostics = this.diagnostics;
  }

  async nextMove(position: Position) {
    this.resetDiagnostics();

    this.engine.position = position;
    const { scores, move } = search(DEPTH, this.context);

    this.diagnostics.recordResult(move, scores);
    return move;
  }

  toJSON(): string {
    return 'justins chess computer v5';
  }
}
