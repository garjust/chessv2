import { ChessComputer, ISearchContext } from './types';
import { MoveWithExtraData, Position } from '../types';
import Engine from '../engine';
import Diagnotics from './diagnostics';
import { search } from './search';
import SearchState from './search-state';
import SearchContext from './search-context';

const DEPTH = 4;

// Algorithm:
// - simple alpha-beta negamax search
export default class v4 implements ChessComputer {
  engine: Engine;
  diagnostics: Diagnotics;
  context: ISearchContext;

  constructor() {
    this.engine = new Engine();
    this.diagnostics = new Diagnotics('v4', DEPTH);

    this.context = new SearchContext(DEPTH, this.engine, this.diagnostics);
    this.context.configuration.pruneNodes = true;
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
    const { scores, move } = await search(DEPTH, this.context);

    this.diagnostics.recordResult(move, scores);
    return move;
  }

  toJSON(): string {
    return 'justins chess computer v4';
  }
}
