import { SearchExecutorI } from '../search-executor';
import { Position } from '../../types';
import Core from '../../core';
import Diagnotics from '../lib/diagnostics';
import Context from '../lib/context';

const MAX_DEPTH = 4;

// The most basic tree search algorithm (minimax) but optimized to a single
// recursive function.
export default class Negamax implements SearchExecutorI {
  maxDepth: number;
  engine: Core;
  context: Context;
  diagnostics?: Diagnotics;

  constructor(maxDepth = MAX_DEPTH) {
    this.maxDepth = maxDepth;
    this.engine = new Core();
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
