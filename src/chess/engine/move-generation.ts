import {
  Color,
  MoveWithExtraData,
  PieceMoves,
  Piece,
  PieceType,
  Square,
  AttackObject,
  ComputedMovementData,
  CastlingAvailability,
} from '../types';
import {
  flipColor,
  squaresInclude,
  CASTLING_AVAILABILITY_BLOCKED,
} from '../utils';
import { attacksOnSquare } from './attacks';
import {
  bishopMoves,
  kingMoves,
  knightMoves,
  pawnMoves,
  queenMoves,
  rookMoves,
} from './piece-movement';
import { KingSquares, KingPins, KingChecks, AttackedSquares } from './types';

const movesForPiece = (
  pieces: Map<Square, Piece>,
  piece: Piece,
  square: Square,
  {
    enPassantSquare,
    castlingAvailability,
  }: {
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
  }
) => {
  const moves: MoveWithExtraData[] = [];

  switch (piece.type) {
    case PieceType.Bishop:
      moves.push(...bishopMoves(pieces, piece.color, square, { skip: [] }));
      break;
    case PieceType.King:
      moves.push(
        ...kingMoves(pieces, piece.color, square, {
          enPassantSquare,
          castlingAvailability,
        })
      );
      break;
    case PieceType.Knight:
      moves.push(...knightMoves(pieces, piece.color, square));
      break;
    case PieceType.Pawn:
      moves.push(
        ...pawnMoves(pieces, piece.color, square, {
          attacksOnly: false,
          enPassantSquare,
        })
      );
      break;
    case PieceType.Queen:
      moves.push(...queenMoves(pieces, piece.color, square, { skip: [] }));
      break;
    case PieceType.Rook:
      moves.push(...rookMoves(pieces, piece.color, square, { skip: [] }));
      break;
  }

  return moves;
};

const movesForPosition = (
  pieces: Map<Square, Piece>,
  options: {
    color?: Color;
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
  }
): PieceMoves[] => {
  const pieceMoves: PieceMoves[] = [];

  const { color, enPassantSquare, castlingAvailability } = options;

  for (const [square, piece] of pieces.entries()) {
    if (color && piece.color !== color) {
      continue;
    }
    const moves = movesForPiece(pieces, piece, square, {
      enPassantSquare,
      castlingAvailability,
    });
    pieceMoves.push({
      piece,
      moves: moves.map((move) => ({ ...move, from: square })),
    });
  }

  return pieceMoves;
};

export const generateMovementData = (
  pieces: Map<Square, Piece>,
  color: Color,
  {
    pinsToKing,
    kings,
    enPassantSquare,
    castlingAvailability,
  }: {
    attackedSquares: AttackedSquares;
    pinsToKing: KingPins;
    checks: KingChecks;
    kings: KingSquares;
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
  }
): ComputedMovementData => {
  let checksForPlayer: AttackObject[] = [];
  const king = kings[color];
  if (king) {
    checksForPlayer = attacksOnSquare(pieces, flipColor(color), king, {
      enPassantSquare,
      skip: [king],
    });
  }

  const allMoves: MoveWithExtraData[] = [];

  const movesets = movesForPosition(pieces, {
    color,
    enPassantSquare,
    castlingAvailability:
      checksForPlayer.length > 0
        ? CASTLING_AVAILABILITY_BLOCKED
        : castlingAvailability,
  });

  for (const { piece, moves } of movesets) {
    let legalMoves: MoveWithExtraData[];

    // We need to prune moves when in check since only moves that remove the
    // check are legal.
    if (checksForPlayer.length > 0) {
      if (checksForPlayer.length === 1) {
        const check = checksForPlayer[0];
        // In the case that the king is checked by a single piece we can capture
        // the piece or block the attack.
        if (piece.type !== PieceType.King) {
          legalMoves = moves.filter(
            (move) =>
              squaresInclude(check.slideSquares, move.to) ||
              check.attacker.square === move.to
          );
        } else {
          // The king can only move out of the check or capture the checking
          // piece. The king cannot block the check.
          legalMoves = moves.filter(
            (move) =>
              // !attackedSquares[flipColor(color)].get(move.to)
              !squaresInclude(check.slideSquares, move.to)
          );
        }
      } else {
        // In the case that the king is checked by multiple pieces (can only be 2)
        // the king must move.

        // Prune all moves if the piece is not the king.
        if (piece.type !== PieceType.King) {
          legalMoves = [];
        }
        // Prune king moves that move to an attacked square.
        legalMoves = moves.filter(
          (move) =>
            // !attackedSquares[flipColor(color)].get(move.to)
            !squaresInclude(
              checksForPlayer.flatMap((check) => check.slideSquares),
              move.to
            )
        );
      }
    }

    // We need to prune moves that result in a check on ourselves.
    //
    // To do this we track pieces that are pinned to the king as well as
    // looking at king moves.
    const king = kings[color];
    legalMoves = moves.filter((move) => {
      if (move.from === king) {
        // This is a king move, verify the destination square is not attacked.
        // return !attackedSquares[flipColor(color)].get(move.to);
        return (
          attacksOnSquare(pieces, flipColor(color), move.to, {
            enPassantSquare: enPassantSquare,
            skip: [king],
          }).length === 0
        );
      } else {
        const pin = pinsToKing[color].get(move.from);
        if (!pin) {
          return true;
        }

        // We are dealing with a pinned piece.
        return (
          pin.legalMoveSquares.includes(move.to) || move.to === pin.attacker
        );
      }
    });

    allMoves.push(...legalMoves);
  }

  return {
    moves: allMoves,
    checks: checksForPlayer,
  };
};
