import { DRAW_SCORE, MATE_SCORE } from '../../core/evaluation';
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
    let bestMove: Move;
    let bestScore: number;

    let alpha = -Infinity;
    const beta = Infinity;

    const moves = this.context.orderMoves(
      this.context.engine.generateMoves(),
      depth,
    );

    bestMove = moves[0];
    bestScore = 0;

    if (moves.length === 1) {
      return {
        scores,
        move: bestMove,
        pv: moves,
        bestScore: { score: bestScore, move: bestMove },
      };
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
        bestScore = result.score;
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

    return {
      scores,
      bestScore: { score: bestScore, move: bestMove },
      move: bestMove,
      pv: this.context.state.pvTable.pv,
    };
  }

  // Recursive search function for the alpha-beta negamax search.
  async searchNodes(
    depth: number,
    alpha: number,
    beta: number,
  ): Promise<number> {
    if (await this.context.state.timeoutReached()) {
      throw new TimeoutError();
    }

    this.context.diagnostics?.nodeVisit(depth);

    let nodeType = NodeType.All;
    let nodeMove: Move | undefined;

    const cacheHit = this.context.state.tTable.get(this.context.engine.zobrist);

    // If we found this position in the TTable and it was a CUT node then we can
    // test against beta before move generation.
    if (
      this.context.configuration.pruneFromTTable &&
      cacheHit &&
      cacheHit.nodeType === NodeType.Cut &&
      cacheHit.score >= beta &&
      cacheHit.depth >= depth
    ) {
      this.context.diagnostics?.cutFromTable(depth);
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
      depth,
    );

    // If there are no moves at this node then the game has ended.
    if (moves.length === 0) {
      if (
        this.context.engine.checks(this.context.engine.position.turn).length > 0
      ) {
        return -1 * (MATE_SCORE + depth);
      } else {
        return DRAW_SCORE;
      }
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

    this.context.diagnostics?.nodeType(depth, nodeType);

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
      this.context.engine.generateAttackingMoves(),
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
