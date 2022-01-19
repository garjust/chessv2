import { ChessComputer } from '../chess-computer';
import { Position } from '../../types';
import Engine from '../../engine';
import Diagnotics from '../search/diagnostics';
import { search } from '../search';
import SearchContext from '../search/search-context';

const DEPTH = 4;

// The most basic tree search algorithm (minimax) but optimized to a single
// recursive function.
export default class Negamax implements ChessComputer {
  engine: Engine;
  diagnostics: Diagnotics;
  context: SearchContext;

  constructor() {
    this.engine = new Engine();
    this.diagnostics = new Diagnotics(this.label, DEPTH);

    this.context = new SearchContext(DEPTH, this.engine, this.diagnostics);
  }

  get diagnosticsResult() {
    return this.diagnostics.result ?? null;
  }

  get label() {
    return 'negamax';
  }

  resetDiagnostics() {
    this.diagnostics = new Diagnotics(this.label, DEPTH);
    this.context.diagnostics = this.diagnostics;
  }

  async nextMove(position: Position) {
    this.resetDiagnostics();

    this.engine.position = position;
    const { scores, move } = await search(DEPTH, this.context);

    this.diagnostics.recordResult(move, scores);
    return move;
  }
}
