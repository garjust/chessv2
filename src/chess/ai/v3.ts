import { ChessComputer, SearchContext } from './types';
import { MoveWithExtraData, Position } from '../types';
import Engine from '../engine';
import Diagnotics from './diagnostics';
import { search } from './search';

const DEPTH = 4;

// Algorithm:
// - simple negamax search
export default class v3 implements ChessComputer {
  engine: Engine;
  diagnostics: Diagnotics;
  context: SearchContext;

  constructor() {
    this.engine = new Engine();
    this.diagnostics = new Diagnotics('v3', DEPTH);

    this.context = {
      engine: this.engine,
      diagnostics: this.diagnostics,
      pruneNodes: false,
      quiescenceSearch: false,
      orderMoves: (moves: MoveWithExtraData[]) => moves,
    };
  }

  get diagnosticsResult() {
    return this.diagnostics.result ?? null;
  }

  resetDiagnostics() {
    this.diagnostics = new Diagnotics('v3', DEPTH);
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
    return 'justins chess computer v3';
  }
}
