import { formatPosition } from '../../lib/fen';
import { Move } from '../../types';
import TimeoutError from './timeout-error';
import { ISearchContext, NodeType, SearchResult } from './types';

// Alpha-beta negamax search.
//
// This is a alpha-beta negamax search. If move pruning is disabled in the
// context it will function as a normal negamax search.
export const search = async (
  depth: number,
  context: ISearchContext
): Promise<SearchResult> => {
  const scores: { move: Move; score: number }[] = [];
  // Start with an illegal move so it is well defined.
  let bestMove: Move = { from: -1, to: -1 };

  let alpha = -Infinity;
  const beta = Infinity;

  const moves = context.configuration.orderMoves(
    context.engine.generateMoves(),
    context.state.tTable.get()?.move,
    context.state.pvTable.pvMove(depth),
    context.state.killerMoves[depth],
    context.state.historyTable
  );

  if (moves.length === 1) {
    return { scores, move: moves[0] };
  }

  for (const move of moves) {
    context.engine.applyMove(move, context.state.moveExecutionOptions);
    const result = {
      move,
      score:
        -1 * (await searchNodes(depth - 1, beta * -1, alpha * -1, context)),
    };
    context.engine.undoLastMove(context.state.moveExecutionOptions);

    scores.push(result);

    if (result.score > alpha) {
      bestMove = result.move;
      alpha = result.score;
      context.state.pvTable.set(depth, result.move);
    }
  }

  if (context.configuration.transpositionTable) {
    context.state.tTable.set({
      nodeType: NodeType.PV,
      depth,
      score: alpha,
      fen: formatPosition(context.engine.position),
      move: bestMove,
    });
  }

  return { scores, move: bestMove };
};

// Recursive search function for the alpha-beta negamax search.
const searchNodes = async (
  depth: number,
  alpha: number,
  beta: number,
  context: ISearchContext
): Promise<number> => {
  context.diagnostics.nodeVisit(depth);

  let nodeType = NodeType.All;
  let nodeMove: Move | undefined;

  if (await context.state.timeoutReached()) {
    throw new TimeoutError();
  }

  if (depth === 0) {
    if (context.configuration.quiescenceSearch) {
      return quiescenceSearch(alpha, beta, context);
    } else {
      return context.engine.evaluateNormalized();
    }
  }

  const moves = context.configuration.orderMoves(
    context.engine.generateMoves(),
    context.state.tTable.get()?.move,
    context.state.pvTable.pvMove(depth),
    context.state.killerMoves[depth],
    context.state.historyTable
  );

  // If there are no moves at this node then it is checkmate.
  if (moves.length === 0) {
    return -Infinity;
  }

  for (const move of moves) {
    context.engine.applyMove(move, context.state.moveExecutionOptions);
    const x =
      -1 * (await searchNodes(depth - 1, beta * -1, alpha * -1, context));
    context.engine.undoLastMove(context.state.moveExecutionOptions);

    if (x > alpha) {
      nodeType = NodeType.PV;
      nodeMove = move;
      context.state.pvTable.set(depth, move);

      alpha = x;
    }
    if (context.configuration.pruneNodes && alpha >= beta) {
      context.diagnostics.cut(depth);
      nodeType = NodeType.Cut;
      nodeMove = move;

      if (context.configuration.killerMoveHeuristic && !move.attack) {
        // New killer move for this depth.
        context.state.killerMoves[depth] = move;
      }
      if (context.configuration.historyMoveHeuristic) {
        context.state.historyTable.increment(move, depth);
      }

      break;
    }
  }

  if (context.configuration.transpositionTable) {
    context.state.tTable.set({
      nodeType,
      depth,
      score: alpha,
      fen: formatPosition(context.engine.position),
      move: nodeMove,
    });
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
  context: ISearchContext
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

  const moves = context.configuration.orderMoves(
    context.engine.generateMoves().filter((move) => move.attack)
  );

  for (const move of moves) {
    context.engine.applyMove(move, context.state.moveExecutionOptions);
    const x = -1 * quiescenceSearch(beta * -1, alpha * -1, context);
    context.engine.undoLastMove(context.state.moveExecutionOptions);

    if (x > alpha) {
      alpha = x;
    }
    if (context.configuration.pruneNodes && alpha >= beta) {
      context.diagnostics.quiescenceCut();
      break;
    }
  }

  return alpha;
};
