import { DRAW_SCORE, MATE_SCORE } from '../../core/evaluation';
import { Move } from '../../types';
import type Context from './context';
import TimeoutError from './timeout-error';
import { NodeType, SearchResult } from '../types';
import { extractPV } from './score-utils';

export default class Search {
  context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  /**
   * Alpha-beta negamax search with various optional features.
   */
  search(maxPlies: number, movesToSearch: Move[]): SearchResult {
    const depth = maxPlies;
    const ply = 0;
    const scores: { move: Move; score: number }[] = [];
    // Start with an illegal move so it is well defined.
    let bestMove: Move;
    let bestScore: number;

    let alpha = -Infinity;
    const beta = Infinity;

    const moves = this.context.orderMoves(
      this.context.core.generateMoves(),
      depth,
      ply,
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
        score: -1 * this.searchNodes(depth - 1, ply + 1, beta * -1, alpha * -1),
      };
      this.context.core.undoLastMove();

      scores.push(result);

      if (result.score > alpha) {
        bestMove = result.move;
        bestScore = result.score;
        alpha = result.score;
        this.context.state.pvTable.set(depth, result.move);
      }
    }

    this.context.state.tTable.set({
      nodeType: NodeType.PV,
      depth: depth,
      score: alpha,
      move: bestMove,
    });

    let pv: Move[];
    if (this.context.configuration.useTTForPV) {
      pv = extractPV(this.context.state.tTable, this.context.core, maxPlies);
    } else {
      pv = this.context.state.pvTable.pv;
    }

    return {
      scores,
      bestScore: { score: bestScore, move: bestMove },
      move: bestMove,
      pv,
    };
  }

  /**
   *  Recursive search function for the alpha-beta negamax search.
   */
  searchNodes(depth: number, ply: number, alpha: number, beta: number): number {
    if (this.context.timer?.tick()) {
      throw new TimeoutError();
    }
    if (this.context.sampler.sample()) {
      this.context.reporter({
        string: this.context.diagnostics?.ttableLog(this.context.state),
      });
    }

    this.context.diagnostics?.nodeVisit(depth);

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
      cacheHit.depth >= depth
    ) {
      this.context.diagnostics?.cutFromTable(depth);
      return cacheHit.score;
    }

    if (depth === 0) {
      if (this.context.configuration.quiescenceSearch) {
        return this.quiescenceSearch(alpha, beta);
      } else {
        return this.context.core.evaluateNormalized();
      }
    }

    const moves = this.context.orderMoves(
      this.context.core.generateMoves(),
      depth,
      ply,
    );

    // If there are no moves at this node then the game has ended.
    if (moves.length === 0) {
      if (
        this.context.core.checks(this.context.core.position.turn).length > 0
      ) {
        return -1 * (MATE_SCORE + depth);
      } else {
        return DRAW_SCORE;
      }
    }

    for (const move of moves) {
      this.context.core.applyMove(move);
      const x =
        -1 * this.searchNodes(depth - 1, ply + 1, beta * -1, alpha * -1);
      this.context.core.undoLastMove();

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

    this.context.state.tTable.set({
      nodeType,
      depth: depth,
      score: alpha,
      move: nodeMove,
    });

    this.context.diagnostics?.nodeType(depth, nodeType);

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
      return alpha; // return beta here?
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
