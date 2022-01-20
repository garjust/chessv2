import { Move } from '../../types';
import type Context from './context';
import TimeoutError from './timeout-error';
import { NodeType, SearchResult } from './types';

export default class Search {
  context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  // Alpha-beta negamax search with various optional features.
  async search(depth: number): Promise<SearchResult> {
    const scores: { move: Move; score: number }[] = [];
    // Start with an illegal move so it is well defined.
    let bestMove: Move = { from: -1, to: -1 };

    let alpha = -Infinity;
    const beta = Infinity;

    const moves = this.context.orderMoves(
      this.context.engine.generateMoves(),
      depth
    );

    if (moves.length === 1) {
      return { scores, move: moves[0], pv: moves };
    }

    for (const move of moves) {
      this.context.engine.applyMove(move);
      const result = {
        move,
        score: -1 * (await this.searchNodes(depth - 1, beta * -1, alpha * -1)),
      };
      this.context.engine.undoLastMove();

      scores.push(result);

      if (result.score > alpha) {
        bestMove = result.move;
        alpha = result.score;
        this.context.state.pvTable.set(depth, result.move);
      }
    }

    this.context.state.tTable.set(this.context.engine.zobrist, {
      nodeType: NodeType.PV,
      depth,
      score: alpha,
      move: bestMove,
    });

    return { scores, move: bestMove, pv: this.context.state.pvTable.pv };
  }

  // Recursive search function for the alpha-beta negamax search.
  async searchNodes(
    depth: number,
    alpha: number,
    beta: number
  ): Promise<number> {
    this.context.diagnostics?.nodeVisit(depth);

    let nodeType = NodeType.All;
    let nodeMove: Move | undefined;

    if (await this.context.state.timeoutReached()) {
      throw new TimeoutError();
    }

    const cacheHit = this.context.state.tTable.get(this.context.engine.zobrist);

    // If we found this position in the TTable and it was a CUT node then we can
    // test against beta before move generation.
    if (
      cacheHit &&
      cacheHit.nodeType === NodeType.Cut &&
      cacheHit.score >= beta &&
      this.context.configuration.pruneFromTTable
    ) {
      this.context.diagnostics?.cut(depth);
      return cacheHit.score;
    }

    if (depth === 0) {
      if (this.context.configuration.quiescenceSearch) {
        return this.quiescenceSearch(alpha, beta);
      } else {
        return this.context.engine.evaluateNormalized();
      }
    }

    const moves = this.context.orderMoves(
      this.context.engine.generateMoves(),
      depth
    );

    // If there are no moves at this node then it is checkmate.
    if (moves.length === 0) {
      return -Infinity;
    }

    for (const move of moves) {
      this.context.engine.applyMove(move);
      const x = -1 * (await this.searchNodes(depth - 1, beta * -1, alpha * -1));
      this.context.engine.undoLastMove();

      if (x > alpha) {
        nodeType = NodeType.PV;
        nodeMove = move;
        this.context.state.pvTable.set(depth, move);

        alpha = x;
      }
      if (this.context.configuration.pruneNodes && alpha >= beta) {
        this.context.diagnostics?.cut(depth);
        nodeType = NodeType.Cut;
        nodeMove = move;

        if (!move.attack) {
          // New killer move for this depth.
          this.context.state.killerMoves[depth] = move;
        }
        this.context.state.historyTable.increment(move, depth);

        break;
      }
    }

    this.context.state.tTable.set(this.context.engine.zobrist, {
      nodeType,
      depth,
      score: alpha,
      move: nodeMove,
    });

    return alpha;
  }

  // Alpha-beta negamax quiescence search.
  //
  // This is a alpha-beta tree search with no depth limit which only examines
  // capturing moves. Therefore this search function only scores "quiet"
  // positions, that is positions with no possible capturing moves.
  quiescenceSearch(alpha: number, beta: number): number {
    this.context.diagnostics?.quiescenceNodeVisit();

    const noMove = this.context.engine.evaluateNormalized();

    if (noMove > alpha) {
      alpha = noMove;
    }
    if (alpha >= beta) {
      this.context.diagnostics?.quiescenceCut();
      return alpha;
    }

    const moves = this.context.quiescenceOrderMoves(
      this.context.engine.generateAttackingMoves()
    );

    for (const move of moves) {
      this.context.engine.applyMove(move);
      const x = -1 * this.quiescenceSearch(beta * -1, alpha * -1);
      this.context.engine.undoLastMove();

      if (x > alpha) {
        alpha = x;
      }
      if (this.context.configuration.pruneNodes && alpha >= beta) {
        this.context.diagnostics?.quiescenceCut();
        break;
      }
    }

    return alpha;
  }
}
