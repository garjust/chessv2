import { ChessComputer, ISearchContext } from './types';
import { Position } from '../types';
import Engine from '../engine';
import Diagnotics from './search/diagnostics';
import { search } from './search/search';
import SearchContext from './search/search-context';

const DEPTH = 4;

// Algorithm:
// - simple negamax search
export default class v3 implements ChessComputer {
  engine: Engine;
  diagnostics: Diagnotics;
  context: ISearchContext;

  constructor() {
    this.engine = new Engine();
    this.diagnostics = new Diagnotics('v3', DEPTH);

    this.context = new SearchContext(DEPTH, this.engine, this.diagnostics);
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
    const { scores, move } = await search(DEPTH, this.context);

    this.diagnostics.recordResult(move, scores);
    return move;
  }

  toJSON(): string {
    return 'justins chess computer v3';
  }
}
