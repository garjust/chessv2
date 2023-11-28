import { ROOK_STARTING_SQUARES } from '../../castling';
import { CastlingData, Color, MoveWithExtraData, PieceType } from '../../types';
import { buildMove } from '../move-utils';

/**
 * Set of pre-created moves a rook makes when participating
 * in a castling.
 */
export const CASTLING_ROOK_MOVES: CastlingData<MoveWithExtraData> = {
  [Color.White]: {
    kingside: {
      piece: { color: Color.White, type: PieceType.Rook },
      from: ROOK_STARTING_SQUARES[Color.White].kingside,
      to: 5,
      attack: false,
    },
    queenside: {
      piece: { color: Color.White, type: PieceType.Rook },
      from: ROOK_STARTING_SQUARES[Color.White].queenside,
      to: 3,
      attack: false,
    },
  },
  [Color.Black]: {
    kingside: {
      piece: { color: Color.White, type: PieceType.Rook },
      from: ROOK_STARTING_SQUARES[Color.Black].kingside,
      to: 61,
      attack: false,
    },
    queenside: {
      piece: { color: Color.White, type: PieceType.Rook },
      from: ROOK_STARTING_SQUARES[Color.Black].queenside,
      to: 59,
      attack: false,
    },
  },
} as const;

export const CASTLING_KING_MOVES: CastlingData<MoveWithExtraData> = {
  [Color.White]: {
    kingside: {
      piece: { color: Color.White, type: PieceType.King },
      from: 4,
      to: 6,
      attack: false,
    },
    queenside: {
      piece: { color: Color.White, type: PieceType.King },
      from: 4,
      to: 2,
      attack: false,
    },
  },
  [Color.Black]: {
    kingside: {
      piece: { color: Color.Black, type: PieceType.King },
      from: 60,
      to: 62,
      attack: false,
    },
    queenside: {
      piece: { color: Color.Black, type: PieceType.King },
      from: 60,
      to: 58,
      attack: false,
    },
  },
} as const;
