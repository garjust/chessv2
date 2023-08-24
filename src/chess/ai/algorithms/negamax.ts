import { ChessComputer } from '../chess-computer';
import { Position } from '../../types';
import Engine from '../../engine';
import Diagnotics from '../search/diagnostics';
import Context from '../search/context';

const MAX_DEPTH = 4;

// The most basic tree search algorithm (minimax) but optimized to a single
// recursive function.
export default class Negamax implements ChessComputer {
  maxDepth: number;
  engine: Engine;
  context: Context;
  diagnostics?: Diagnotics;

  constructor(maxDepth = MAX_DEPTH) {
    this.maxDepth = maxDepth;
    this.engine = new Engine();
    this.context = new Context(this.label, maxDepth, this.engine);
  }

  get diagnosticsResult() {
    return this.diagnostics?.result ?? null;
  }

  get label() {
    return 'negamax';
  }

  async nextMove(position: Position) {
    this.diagnostics = undefined;
    this.engine.position = position;

    const [{ move }, diagnostics] = await this.context.withDiagnostics(
      this.maxDepth,
    );

    this.diagnostics = diagnostics;
    return move;
  }
}
