import { Move, Position } from '../../types';
import Core from '../../core';
import Diagnotics from '../lib/diagnostics';
import Context from '../lib/context';
import {
  SearchInterface,
  SearchConstructor,
  InfoReporter,
} from '../search-interface';

const MAX_DEPTH = 4;

// The most basic tree search algorithm (minimax) but optimized to a single
// recursive function.
export default class Negamax implements SearchInterface {
  maxDepth: number;
  core: Core;
  context: Context;
  diagnostics?: Diagnotics;

  constructor(infoReporter: InfoReporter) {
    this.maxDepth = MAX_DEPTH;
    this.core = new Core();
    this.context = new Context(this.label, MAX_DEPTH, this.core);
  }

  get diagnosticsResult() {
    return this.diagnostics?.result ?? null;
  }

  get label() {
    return 'negamax';
  }

  async nextMove(position: Position) {
    this.diagnostics = undefined;
    this.core.position = position;

    const [{ move }, diagnostics] = await this.context.withDiagnostics(
      this.maxDepth,
    );

    this.diagnostics = diagnostics;
    return move;
  }

  ponderMove(_1: Position, _2: Move) {
    throw new Error(`search ${this.label} cannot ponder`);
  }
}
const _: SearchConstructor = Negamax;
