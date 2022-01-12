import {
  CastlingAvailability,
  Color,
  Move,
  Piece,
  PieceType,
  Square,
} from '../types';
import { flipColor } from '../utils';
import { attacksOnSquare } from './attacks';
import { SUPER_PIECE_BITARRAYS } from './move-lookup';
import { KingChecks, KingSquares } from './types';

export const findChecksOnKings = (
  pieces: Map<Square, Piece>,
  kings: KingSquares,
  options: {
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
  }
): KingChecks => {
  const whiteKing = kings[Color.White];
  const blackKing = kings[Color.Black];

  let whiteChecks;
  let blackChecks;

  if (whiteKing) {
    whiteChecks = attacksOnSquare(pieces, Color.Black, whiteKing, {
      ...options,
      skip: [whiteKing],
    });
  }
  if (blackKing) {
    blackChecks = attacksOnSquare(pieces, Color.White, blackKing, {
      ...options,
      skip: [blackKing],
    });
  }

  return {
    [Color.White]: whiteChecks ? whiteChecks : [],
    [Color.Black]: blackChecks ? blackChecks : [],
  };
};

// For checks we only need to update checks for the opponent when a move is
// made.
export const updateChecksOnKings = (
  checks: KingChecks,
  pieces: Map<Square, Piece>,
  kings: KingSquares,
  currentMove: Color,
  move: Move,
  piece: Piece,
  options: {
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
  }
) => {
  const opponentColor = flipColor(currentMove);
  const king = kings[opponentColor];

  if (king) {
    // If the moved piece is the king, recalcuate pins on it.
    //
    // If the moved piece does not enter or leave the king's square superpiece
    // squares nothing needs to be computed.
    if (
      piece.type === PieceType.King ||
      SUPER_PIECE_BITARRAYS[king][move.from] ||
      SUPER_PIECE_BITARRAYS[king][move.to]
    ) {
      checks[opponentColor] = attacksOnSquare(pieces, currentMove, king, {
        ...options,
        skip: [king],
      });
    }
  }
};
