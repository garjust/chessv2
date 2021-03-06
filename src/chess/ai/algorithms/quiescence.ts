import { ChessComputer } from '../chess-computer';
import { Position } from '../../types';
import Engine from '../../engine';
import Diagnotics from '../search/diagnostics';
import Context from '../search/context';

const MAX_DEPTH = 4;

// Add a quiescence search to the leaf nodes of the tree search instead of
// immediately evaluating the leaf node.
//
// This fixes the so called "horizon effect" where the position at a leaf
// node has an important capture available on the next move. The quiescence
// search fixes this by only searching capturing moves (to unlimited depth).
export default class Quiescence implements ChessComputer {
  maxDepth: number;
  engine: Engine;
  context: Context;
  diagnostics?: Diagnotics;

  constructor(maxDepth = MAX_DEPTH) {
    this.maxDepth = maxDepth;
    this.engine = new Engine();
    this.context = new Context(this.label, maxDepth, this.engine, {
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

  async nextMove(position: Position) {
    this.diagnostics = undefined;
    this.engine.position = position;

    const [{ move }, diagnostics] = await this.context.withDiagnostics(
      this.maxDepth
    );

    this.diagnostics = diagnostics;
    return move;
  }
}
