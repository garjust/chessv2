import { Move } from '../types';
import { SearchContext, SearchResult } from './types';

// Alpha-beta negamax search.
//
// This is a alpha-beta negamax search. If move pruning is disabled in the
// context it will function as a normal negamax search.
export const search = (depth: number, context: SearchContext): SearchResult => {
  const scores: { move: Move; score: number }[] = [];
  // Start with an illegal move so it is well defined.
  let bestMove: Move = { from: -1, to: -1 };

  let alpha = -Infinity;
  const beta = Infinity;

  const moves = context.orderMoves(context.engine.generateMoves());
  for (const move of moves) {
    context.engine.applyMove(move);
    const result = {
      move,
      score: -1 * searchNodes(depth - 1, beta * -1, alpha * -1, context),
    };
    context.engine.undoLastMove();

    scores.push(result);

    if (result.score > alpha) {
      bestMove = result.move;
      alpha = result.score;
    }
  }

  return { scores, move: bestMove };
};

// Recursive search function for the alpha-beta negamax search.
const searchNodes = (
  depth: number,
  alpha: number,
  beta: number,
  context: SearchContext
): number => {
  context.diagnostics.nodeVisit(depth);

  if (depth === 0) {
    if (context.quiescenceSearch) {
      return quiescenceSearch(alpha, beta, context);
    } else {
      return context.engine.evaluateNormalized();
    }
  }

  const moves = context.orderMoves(context.engine.generateMoves());

  for (const move of moves) {
    context.engine.applyMove(move);
    const x = -1 * searchNodes(depth - 1, beta * -1, alpha * -1, context);
    context.engine.undoLastMove();

    if (x > alpha) {
      alpha = x;
    }
    if (context.pruneNodes && alpha >= beta) {
      context.diagnostics.cut(depth);
      break;
    }
  }

  return alpha;
};

// Alpha-beta negamax quiescence search.
//
// This is a alpha-beta tree search with no depth limit which only examines
// capturing moves. Therefore this search function only scores "quiet"
// positions, that is positions with no possible capturing moves.
export const quiescenceSearch = (
  alpha: number,
  beta: number,
  context: SearchContext
): number => {
  context.diagnostics.quiescenceNodeVisit();

  const noMove = context.engine.evaluateNormalized();
  if (noMove > alpha) {
    alpha = noMove;
  }
  if (alpha >= beta) {
    context.diagnostics.quiescenceCut();
    return alpha;
  }

  const moves = context.orderMoves(
    context.engine.generateMoves().filter((move) => move.attack)
  );

  for (const move of moves) {
    context.engine.applyMove(move);
    const x = -1 * quiescenceSearch(beta * -1, alpha * -1, context);
    context.engine.undoLastMove();

    if (x > alpha) {
      alpha = x;
    }
    if (context.pruneNodes && alpha >= beta) {
      context.diagnostics.quiescenceCut();
      break;
    }
  }

  return alpha;
};
