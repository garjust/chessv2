import { Move, Position } from '../../types';
import Diagnotics from '../lib/diagnostics';
import Context from '../lib/context';
import {
  SearchInterface,
  SearchConstructor,
  InfoReporter,
  SearchLimit,
} from '../search-interface';
import { MAX_DEPTH } from '../lib/state';

// The most basic tree search algorithm (minimax) but optimized to a single
// recursive function.
export default class Negamax implements SearchInterface {
  context: Context;
  diagnostics?: Diagnotics;

  constructor(reporter: InfoReporter) {
    this.context = new Context(this.label, reporter);
  }

  get diagnosticsResult() {
    return this.diagnostics?.result ?? null;
  }

  get label() {
    return 'negamax';
  }

  async nextMove(
    position: Position,
    _1: Move[],
    _2: number,
    limits: SearchLimit,
  ) {
    this.diagnostics = undefined;

    const [{ move }, diagnostics] = await this.context.withDiagnostics(
      position,
      limits.depth ?? MAX_DEPTH,
    );

    this.diagnostics = diagnostics;
    return move;
  }

  ponderMove(_1: Position, _2: Move) {
    throw new Error(`search ${this.label} cannot ponder`);
  }
}
const _: SearchConstructor = Negamax;
