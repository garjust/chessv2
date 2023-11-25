import {
  Color,
  MoveWithExtraData,
  Piece,
  PieceType,
  Square,
  CastlingAvailability,
  SquareControl,
} from '../types';
import {
  flipColor,
  squaresInclude,
  CASTLING_AVAILABILITY_BLOCKED,
  isPromotionPositionPawn,
} from '../utils';
import AttackMap from './attack-map';
import {
  expandPromotions,
  isMoveIncidentWithCheck,
  squareControlXraysMove,
} from './move-utils';
import { castlingKingMoves, advancePawnMoves } from './piece-movement';
import Pins from './pins';
import { KingSquares, AttackedSquares } from './types';

const pseudoMovesForPosition = (
  pieces: Map<Square, Piece>,
  color: Color,
  enPassantSquare: Square | null,
  castlingAvailability: CastlingAvailability,
  attackedSquares: AttackedSquares,
): MoveWithExtraData[] => {
  const moves: MoveWithExtraData[] = [];

  for (const [square, piece] of pieces) {
    if (piece.color !== color) {
      continue;
    }

    const attacks = attackedSquares[piece.color].controlForPiece(square);

    for (const squareControl of attacks) {
      const attackedPiece = pieces.get(squareControl.to);
      squareControl.attack = attackedPiece !== undefined;

      // Logic to discard moves:
      // 1. Discard the move if it attacks a piece of the same color.
      // 2. Discard pawn moves that don't capture a piece (only the diagonal
      //    captures are included in square control).
      if (
        attackedPiece?.color === color ||
        (piece.type === PieceType.Pawn &&
          !squareControl.attack &&
          squareControl.to !== enPassantSquare)
      ) {
        continue;
      }

      if (
        piece.type === PieceType.Pawn &&
        isPromotionPositionPawn(piece.color, square)
      ) {
        moves.push(...expandPromotions(squareControl));
      } else {
        moves.push(squareControl);
      }
    }

    // Add moves that are not included in square control:
    // 1. Castling moves
    // 2. Pawn advancement
    if (piece.type === PieceType.King) {
      // Add castling moves
      moves.push(
        ...castlingKingMoves(
          pieces,
          piece,
          square,
          attackedSquares[flipColor(color)],
          castlingAvailability,
        ),
      );
    } else if (piece.type === PieceType.Pawn) {
      // Add advance moves.
      moves.push(...advancePawnMoves(pieces, piece, square));
    }
  }

  return moves;
};

// When in check we need to prune moves that do not resolve the check.
const moveResolvesCheck = (
  checks: SquareControl[],
  move: MoveWithExtraData,
): boolean => {
  // If the moving piece is a king all it's moves should be retained. Moves
  // into an attacked square are pruned elsewhere.
  if (move.piece.type === PieceType.King) {
    return true;
  }

  // We need to prune moves when in check since only moves that remove the
  // check are legal.
  if (checks.length === 1) {
    const check = checks[0];
    // In the case that the king is checked by a single piece we can capture
    // the piece or block the attack.
    return isMoveIncidentWithCheck(move, check);
  } else if (checks.length === 2) {
    // In the case that the king is checked by multiple pieces (can only be 2)
    // the king must move.
    return false;
  } else {
    throw Error(
      `called with ${checks.length} checks, there can only ever be 1 or 2 checks`,
    );
  }
};

// We need to prune moves that result in a check on ourselves.
//
// To do this we track pieces that are pinned to the king as well as
// looking at king moves.
const moveLeavesKingInCheck = (
  move: MoveWithExtraData,
  pins: Pins,
  checks: SquareControl[],
  opponentAttackMap: AttackMap,
): boolean => {
  if (move.piece.type === PieceType.King) {
    // The piece moving is the king. We need to make sure the square it is
    // moving to is not attacked by any pieces.
    if (checks.length === 0) {
      // If we are not in check just look for attacks on the destination
      // square
      return opponentAttackMap.isAttacked(move.to);
    } else {
      // If we are in check first look for attacks on the destination square.
      if (opponentAttackMap.isAttacked(move.to)) {
        return true;
      }

      // Finally we need to consider the case the checking piece is effectively
      // skewering the king to the destination square, meaning the king will
      // still be in check even though that square is not currently attacked.
      for (const squareControl of checks) {
        if (squareControlXraysMove(squareControl, move)) {
          return true;
        }
      }
    }
  } else {
    // The piece moving is not the king so we look to see if it is pinned
    // to the king.
    const pin = pins.pinByPinnedPiece(move.from);
    if (!pin) {
      return false;
    }

    // The piece moving is absolutely pinned so it may only move within the
    // pinning ray.
    return !pin.legalMoveSquares.includes(move.to) && move.to !== pin.attacker;
  }
};

export const generateMoves = (
  pieces: Map<Square, Piece>,
  color: Color,
  attackedSquares: AttackedSquares,
  pins: Pins,
  kings: KingSquares,
  checks: SquareControl[],
  enPassantSquare: Square | null,
  castlingAvailability: CastlingAvailability,
): MoveWithExtraData[] => {
  const kingSquare = kings[color];

  const moves = pseudoMovesForPosition(
    pieces,
    color,
    enPassantSquare,
    checks.length > 0 ? CASTLING_AVAILABILITY_BLOCKED : castlingAvailability,
    attackedSquares,
  );

  if (kingSquare) {
    for (let i = moves.length - 1; i >= 0; i--) {
      const move = moves[i];

      if (checks.length > 0) {
        if (!moveResolvesCheck(checks, move)) {
          moves.splice(i, 1);
          continue;
        }
      }
      if (
        moveLeavesKingInCheck(
          move,
          pins,
          checks,
          attackedSquares[flipColor(color)],
        )
      ) {
        moves.splice(i, 1);
        continue;
      }
    }
  }

  return moves;
};
