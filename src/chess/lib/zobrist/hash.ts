import { CastlingMask } from '../../castling';
import { Color, Position } from '../../types';
import { Type, ZobristNumbers } from './types';

export const hash = (
  position: Position,
  zobristNumbers: ZobristNumbers<number>,
) => {
  let h = 0;

  if (position.turn === Color.Black) {
    h ^= zobristNumbers[Type.Turn];
  }

  for (const [square, piece] of position.pieces) {
    h ^= zobristNumbers[Type.PieceSquare][piece.color][square][piece.type];
  }

  if ((position.castlingAvailability & CastlingMask.WhiteKingside) > 0) {
    h ^= zobristNumbers[Type.CastlingAvailability][Color.White].kingside;
  }
  if ((position.castlingAvailability & CastlingMask.WhiteQueenside) > 0) {
    h ^= zobristNumbers[Type.CastlingAvailability][Color.White].queenside;
  }
  if ((position.castlingAvailability & CastlingMask.BlackKingside) > 0) {
    h ^= zobristNumbers[Type.CastlingAvailability][Color.White].kingside;
  }
  if ((position.castlingAvailability & CastlingMask.BlackQueenside) > 0) {
    h ^= zobristNumbers[Type.CastlingAvailability][Color.Black].queenside;
  }

  return h;
};

export const hash64 = (
  position: Position,
  zobristNumbers: ZobristNumbers<bigint>,
) => {
  let h = 0n;

  if (position.turn === Color.Black) {
    h ^= zobristNumbers[Type.Turn];
  }

  for (const [square, piece] of position.pieces) {
    h ^= zobristNumbers[Type.PieceSquare][piece.color][square][piece.type];
  }

  if ((position.castlingAvailability & CastlingMask.WhiteKingside) > 0) {
    h ^= zobristNumbers[Type.CastlingAvailability][Color.White].kingside;
  }
  if ((position.castlingAvailability & CastlingMask.WhiteQueenside) > 0) {
    h ^= zobristNumbers[Type.CastlingAvailability][Color.White].queenside;
  }
  if ((position.castlingAvailability & CastlingMask.BlackKingside) > 0) {
    h ^= zobristNumbers[Type.CastlingAvailability][Color.White].kingside;
  }
  if ((position.castlingAvailability & CastlingMask.BlackQueenside) > 0) {
    h ^= zobristNumbers[Type.CastlingAvailability][Color.Black].queenside;
  }

  return h;
};
