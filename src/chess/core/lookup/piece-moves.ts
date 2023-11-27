import { ColorData, MoveWithExtraData, Color, PieceType } from '../../types';
import { squareGenerator } from '../../utils';
import { pawnAdvanceMoves, pawnCaptureMoves } from './movement';
import { KING_LOOKUP, KNIGHT_LOOKUP } from './piece-squares';

/**
 * Pawn advance pseudo moves by square.
 *
 * Move arrays can be 3 different lengths:
 * - 1: normal advance in the middle of the board
 * - 2: the pawn is in the starting position and has two advance moves
 * - 4: the pawn can promote when it advances and each move is a different
 *      promotion.
 */
const PAWN_ADVANCE_MOVES: ColorData<MoveWithExtraData[][]> = {
  [Color.White]: [],
  [Color.Black]: [],
};

/**
 * Pawn capture pseudo moves by square.
 */
const PAWN_CAPTURE_MOVES: ColorData<MoveWithExtraData[][]> = {
  [Color.White]: [],
  [Color.Black]: [],
};

/**
 * Knight pseudo moves by square.
 */
const KNIGHT_MOVES: ColorData<MoveWithExtraData[][]> = {
  [Color.White]: [],
  [Color.Black]: [],
};

/**
 * King pseudo moves by square.
 */
const KING_MOVES: ColorData<MoveWithExtraData[][]> = {
  [Color.White]: [],
  [Color.Black]: [],
};

// Iterate through all the squares generating actual move objects that can
// be reused.
for (const square of squareGenerator()) {
  KING_MOVES[Color.White][square] = KING_LOOKUP[square].map((to) => ({
    piece: { color: Color.White, type: PieceType.King },
    from: square,
    to,
  }));
  KING_MOVES[Color.Black][square] = KING_LOOKUP[square].map((to) => ({
    piece: { color: Color.Black, type: PieceType.King },
    from: square,
    to,
  }));
  KNIGHT_MOVES[Color.White][square] = KNIGHT_LOOKUP[square].map((to) => ({
    piece: { color: Color.White, type: PieceType.Knight },
    from: square,
    to,
  }));
  KNIGHT_MOVES[Color.Black][square] = KNIGHT_LOOKUP[square].map((to) => ({
    piece: { color: Color.Black, type: PieceType.Knight },
    from: square,
    to,
  }));
  PAWN_ADVANCE_MOVES[Color.White][square] = pawnAdvanceMoves(
    square,
    Color.White,
  );
  PAWN_ADVANCE_MOVES[Color.Black][square] = pawnAdvanceMoves(
    square,
    Color.Black,
  );
  PAWN_CAPTURE_MOVES[Color.White][square] = pawnCaptureMoves(
    square,
    Color.White,
  );
  PAWN_CAPTURE_MOVES[Color.Black][square] = pawnCaptureMoves(
    square,
    Color.Black,
  );
}

export { KING_MOVES, KNIGHT_MOVES, PAWN_ADVANCE_MOVES, PAWN_CAPTURE_MOVES };
