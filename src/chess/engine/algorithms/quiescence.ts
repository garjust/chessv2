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

// Add a quiescence search to the leaf nodes of the tree search instead of
// immediately evaluating the leaf node.
//
// This fixes the so called "horizon effect" where the position at a leaf
// node has an important capture available on the next move. The quiescence
// search fixes this by only searching capturing moves (to unlimited depth).
export default class Quiescence implements SearchInterface {
  context: Context;
  diagnostics?: Diagnotics;

  constructor(reporter: InfoReporter) {
    this.context = new Context(this.label, reporter, {
      pruneNodes: true,
      quiescenceSearch: true,
      moveOrdering: true,
    });
  }

  get diagnosticsResult() {
    return this.diagnostics?.result ?? null;
  }

  get label() {
    return 'alphabeta-v3-quiescence';
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
const _: SearchConstructor = Quiescence;
