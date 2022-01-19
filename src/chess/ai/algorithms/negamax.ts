import { ChessComputer } from '../chess-computer';
import { Position } from '../../types';
import Engine from '../../engine';
import Diagnotics from '../search/diagnostics';
import { search } from '../search';
import Context from '../search/context';

const MAX_DEPTH = 4;

// The most basic tree search algorithm (minimax) but optimized to a single
// recursive function.
export default class Negamax implements ChessComputer {
  engine: Engine;
  diagnostics: Diagnotics;
  context: Context;

  constructor() {
    this.engine = new Engine();
    this.diagnostics = new Diagnotics(this.label, MAX_DEPTH);

    this.context = new Context(MAX_DEPTH, this.engine, this.diagnostics);
  }

  get diagnosticsResult() {
    return this.diagnostics.result ?? null;
  }

  get label() {
    return 'negamax';
  }

  resetDiagnostics() {
    this.diagnostics = new Diagnotics(this.label, MAX_DEPTH);
    this.context.diagnostics = this.diagnostics;
  }

  async nextMove(position: Position) {
    this.resetDiagnostics();

    this.engine.position = position;
    const { scores, move } = await search(MAX_DEPTH, this.context);

    this.diagnostics.recordResult(move, scores);
    return move;
  }
}
