import { ChessComputer, ISearchContext } from './types';
import { Position } from '../types';
import Engine from '../engine';
import { orderMoves } from '../engine/move-ordering';
import Diagnotics from './search/diagnostics';
import { search } from './search/search';
import SearchContext from './search/search-context';

const DEPTH = 4;

export default class v5 implements ChessComputer {
  engine: Engine;
  diagnostics: Diagnotics;
  context: ISearchContext;

  constructor() {
    this.engine = new Engine();
    this.diagnostics = new Diagnotics(this.label, DEPTH);

    this.context = new SearchContext(DEPTH, this.engine, this.diagnostics);
    this.context.configuration.pruneNodes = true;
    this.context.configuration.orderMoves = orderMoves;
  }

  get diagnosticsResult() {
    return this.diagnostics.result ?? null;
  }

  get label() {
    return 'alphabeta-v2-move-ordered';
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
