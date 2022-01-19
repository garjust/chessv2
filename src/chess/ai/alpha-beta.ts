import { ChessComputer, ISearchContext } from './types';
import { Position } from '../types';
import Engine from '../engine';
import Diagnotics from './search/diagnostics';
import { search } from './search/search';
import SearchContext from './search/search-context';

const DEPTH = 4;

// A step up from the negamax algorithm, this is the classic tree search
// algorithm used for games like chess.
//
// Alpha-beta adds tree-pruning to the tree search in a way that is completely
// safe. Alpha-beta will always return the same move as negamax.
export default class AlphaBeta implements ChessComputer {
  engine: Engine;
  diagnostics: Diagnotics;
  context: ISearchContext;

  constructor() {
    this.engine = new Engine();
    this.diagnostics = new Diagnotics(this.label, DEPTH);

    this.context = new SearchContext(DEPTH, this.engine, this.diagnostics);
    this.context.configuration.pruneNodes = true;
  }

  get diagnosticsResult() {
    return this.diagnostics.result ?? null;
  }

  get label() {
    return 'alphabeta';
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
