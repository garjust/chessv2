import { ChessComputer, ISearchContext } from './types';
import { Position } from '../types';
import Engine from '../engine';
import { orderMoves } from '../engine/move-ordering';
import Diagnotics from './search/diagnostics';
import { search } from './search/search';
import SearchContext from './search/search-context';

const DEPTH = 4;

// Add a quiescence search to the leaf nodes of the tree search instead of
// immediately evaluating the leaf node.
//
// This fixes the so called "horizon effect" where the position at a leaf
// node has an important capture available on the next move. The quiescence
// search fixes this by only searching capturing moves (to unlimited depth).
export default class Quiescence implements ChessComputer {
  engine: Engine;
  diagnostics: Diagnotics;
  context: ISearchContext;

  constructor() {
    this.engine = new Engine();
    this.diagnostics = new Diagnotics(this.label, DEPTH);

    this.context = new SearchContext(DEPTH, this.engine, this.diagnostics);
    this.context.configuration.pruneNodes = true;
    this.context.configuration.quiescenceSearch = true;
    this.context.configuration.killerMoveHeuristic = true;
    this.context.configuration.orderMoves = orderMoves;
  }

  get diagnosticsResult() {
    return this.diagnostics.result ?? null;
  }

  get label() {
    return 'alphabeta-v3-quiescence';
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
