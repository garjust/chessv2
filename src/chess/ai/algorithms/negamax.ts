import { ChessComputer } from '../chess-computer';
import { Position } from '../../types';
import Engine from '../../engine';
import Diagnotics from '../search/diagnostics';
import Search from '../search';
import Context from '../search/context';

const MAX_DEPTH = 4;

// The most basic tree search algorithm (minimax) but optimized to a single
// recursive function.
export default class Negamax implements ChessComputer {
  engine: Engine;
  context: Context;
  diagnostics?: Diagnotics;

  constructor() {
    this.engine = new Engine();

    this.context = new Context(this.label, MAX_DEPTH, this.engine);
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

    const [{ move }, diagnostics] = await new Search(
      MAX_DEPTH,
      this.context
    ).run();

    this.diagnostics = diagnostics;
    return move;
  }
}
