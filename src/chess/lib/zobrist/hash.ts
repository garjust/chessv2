import { Color, Position } from '../../types';
import { Type, ZobristNumbers } from './types';

export const hash = (
  position: Position,
  zobristNumbers: ZobristNumbers<number>
) => {
  let h = zobristNumbers[Type.Turn][position.turn];

  for (const [square, piece] of position.pieces) {
    h ^= zobristNumbers[Type.PieceSquare][piece.color][square][piece.type];
  }

  if (position.castlingAvailability[Color.White].kingside) {
    h ^= zobristNumbers[Type.CastlingAvailability][Color.White].kingside;
  }
  if (position.castlingAvailability[Color.White].queenside) {
    h ^= zobristNumbers[Type.CastlingAvailability][Color.White].queenside;
  }
  if (position.castlingAvailability[Color.Black].kingside) {
    h ^= zobristNumbers[Type.CastlingAvailability][Color.White].kingside;
  }
  if (position.castlingAvailability[Color.Black].queenside) {
    h ^= zobristNumbers[Type.CastlingAvailability][Color.Black].queenside;
  }

  return h;
};

export const hash64 = (
  position: Position,
  zobristNumbers: ZobristNumbers<bigint>
) => {
  let h = zobristNumbers[Type.Turn][position.turn];

  for (const [square, piece] of position.pieces) {
    h ^= zobristNumbers[Type.PieceSquare][piece.color][square][piece.type];
  }

  if (position.castlingAvailability[Color.White].kingside) {
    h ^= zobristNumbers[Type.CastlingAvailability][Color.White].kingside;
  }
  if (position.castlingAvailability[Color.White].queenside) {
    h ^= zobristNumbers[Type.CastlingAvailability][Color.White].queenside;
  }
  if (position.castlingAvailability[Color.Black].kingside) {
    h ^= zobristNumbers[Type.CastlingAvailability][Color.White].kingside;
  }
  if (position.castlingAvailability[Color.Black].queenside) {
    h ^= zobristNumbers[Type.CastlingAvailability][Color.Black].queenside;
  }

  return h;
};
