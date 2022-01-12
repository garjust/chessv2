import { ChessComputer, SearchContext } from './types';
import { MoveWithExtraData, Position } from '../types';
import Engine from '../engine';
import Diagnotics from './diagnostics';
import { search } from './search';
import SearchState from './search-state';

const DEPTH = 4;

// Algorithm:
// - simple alpha-beta negamax search
export default class v4 implements ChessComputer {
  engine: Engine;
  diagnostics: Diagnotics;
  context: SearchContext;

  constructor() {
    this.engine = new Engine();
    this.diagnostics = new Diagnotics('v4', DEPTH);

    this.context = {
      engine: this.engine,
      diagnostics: this.diagnostics,
      state: new SearchState(DEPTH),
      configuration: {
        pruneNodes: true,
        quiescenceSearch: false,
        orderMoves: (moves: MoveWithExtraData[]) => moves,
      },
    };
  }

  get diagnosticsResult() {
    return this.diagnostics.result ?? null;
  }

  resetDiagnostics() {
    this.diagnostics = new Diagnotics('v4', DEPTH);
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
    return 'justins chess computer v4';
  }
}
