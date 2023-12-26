import { DRAW_SCORE, MATE_SCORE } from '../../core/evaluation';
import { Move } from '../../types';
import type Context from './context';
import TimeoutError from './timeout-error';
import { NodeType, SearchResult } from '../types';

export default class Search {
  context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  /**
   * Alpha-beta negamax search with various optional features.
   */
  search(maxDepth: number, movesToSearch: Move[]): SearchResult {
    const scores: { move: Move; score: number }[] = [];
    // Start with an illegal move so it is well defined.
    let bestMove: Move;
    let bestScore: number;

    let alpha = -Infinity;
    const beta = Infinity;

    const moves = this.context.orderMoves(
      this.context.core.generateMoves(),
      maxDepth,
    );
    if (movesToSearch.length > 0) {
      for (let i = moves.length - 1; i >= 0; i--) {
        if (!movesToSearch.includes(moves[i])) {
          moves.splice(i, 1);
        }
      }
    }

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
      this.context.core.applyMove(move);
      const result = {
        move,
        score: -1 * this.searchNodes(maxDepth - 1, beta * -1, alpha * -1),
      };
      this.context.core.undoLastMove();

      scores.push(result);

      if (result.score > alpha) {
        bestMove = result.move;
        bestScore = result.score;
        alpha = result.score;
        this.context.state.pvTable.set(maxDepth, result.move);
      }
    }

    this.context.state.tTable.set({
      nodeType: NodeType.PV,
      depth: maxDepth,
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

  /**
   *  Recursive search function for the alpha-beta negamax search.
   */
  searchNodes(inverseDepth: number, alpha: number, beta: number): number {
    if (this.context.timer?.tick()) {
      throw new TimeoutError();
    }
    if (this.context.sampler.sample()) {
      this.context.reporter({
        string: this.context.diagnostics?.ttableLog(this.context.state),
      });
    }

    this.context.diagnostics?.nodeVisit(inverseDepth);

    let nodeType = NodeType.All;
    let nodeMove: Move | undefined;

    const cacheHit = this.context.state.tTable.get();

    // If we found this position in the TTable and it was a CUT node then we can
    // test against beta before move generation.
    if (
      this.context.configuration.pruneFromTTable &&
      cacheHit &&
      cacheHit.nodeType === NodeType.Cut &&
      cacheHit.score >= beta &&
      cacheHit.depth >= inverseDepth
    ) {
      this.context.diagnostics?.cutFromTable(inverseDepth);
      return cacheHit.score;
    }

    if (inverseDepth === 0) {
      if (this.context.configuration.quiescenceSearch) {
        return this.quiescenceSearch(alpha, beta);
      } else {
        return this.context.core.evaluateNormalized();
      }
    }

    const moves = this.context.orderMoves(
      this.context.core.generateMoves(),
      inverseDepth,
    );

    // If there are no moves at this node then the game has ended.
    if (moves.length === 0) {
      if (
        this.context.core.checks(this.context.core.position.turn).length > 0
      ) {
        return -1 * (MATE_SCORE + inverseDepth);
      } else {
        return DRAW_SCORE;
      }
    }

    for (const move of moves) {
      this.context.core.applyMove(move);
      const x = -1 * this.searchNodes(inverseDepth - 1, beta * -1, alpha * -1);
      this.context.core.undoLastMove();

      if (x > alpha) {
        nodeType = NodeType.PV;
        nodeMove = move;
        this.context.state.pvTable.set(inverseDepth, move);

        alpha = x;
      }
      if (this.context.configuration.pruneNodes && alpha >= beta) {
        this.context.diagnostics?.cut(inverseDepth);
        nodeType = NodeType.Cut;
        nodeMove = move;

        if (!move.attack) {
          // New killer move for this depth.
          this.context.state.killerMoves[inverseDepth] = move;
        }
        this.context.state.historyTable.increment(move, inverseDepth);

        break;
      }
    }

    this.context.state.tTable.set({
      nodeType,
      depth: inverseDepth,
      score: alpha,
      move: nodeMove,
    });

    this.context.diagnostics?.nodeType(inverseDepth, nodeType);

    return alpha;
  }

  /**
   * Alpha-beta negamax quiescence search.
   *
   * This is a alpha-beta tree search with no depth limit which only examines
   * capturing moves. Therefore this search function only scores "quiet"
   * positions, that is positions with no possible capturing moves.
   */
  quiescenceSearch(alpha: number, beta: number): number {
    if (this.context.timer?.tick()) {
      throw new TimeoutError();
    }
    if (this.context.sampler.sample()) {
      this.context.reporter({
        string: this.context.diagnostics?.ttableLog(this.context.state),
      });
    }

    this.context.diagnostics?.quiescenceNodeVisit();

    const noMove = this.context.core.evaluateNormalized();

    if (noMove > alpha) {
      alpha = noMove;
    }
    if (alpha >= beta) {
      this.context.diagnostics?.quiescenceCut();
      return alpha;
    }

    const moves = this.context.quiescenceOrderMoves(
      this.context.core.generateAttackingMoves(),
    );

    for (const move of moves) {
      this.context.core.applyMove(move);
      const x = -1 * this.quiescenceSearch(beta * -1, alpha * -1);
      this.context.core.undoLastMove();

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
