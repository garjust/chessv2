import { Color, PieceType, Square } from '../../types';
import { Type, ZobristNumbers } from './types';

const zobristNumber = (): number => Math.abs(Math.random() * 2 ** 31);

const numbersForSquare = () => ({
  [PieceType.Bishop]: zobristNumber(),
  [PieceType.King]: zobristNumber(),
  [PieceType.Knight]: zobristNumber(),
  [PieceType.Pawn]: zobristNumber(),
  [PieceType.Queen]: zobristNumber(),
  [PieceType.Rook]: zobristNumber(),
});

const numbersForSquares = () => {
  const obj: Record<Square, Record<PieceType, number>> = {};
  for (let square: Square = 0; square < 64; square++) {
    obj[square] = numbersForSquare();
  }
  return obj;
};

export const makeNumbers = (): ZobristNumbers<number> => ({
  [Type.Turn]: zobristNumber(),
  [Type.PieceSquare]: {
    [Color.White]: numbersForSquares(),
    [Color.Black]: numbersForSquares(),
  },
  [Type.CastlingAvailability]: {
    [Color.White]: {
      kingside: zobristNumber(),
      queenside: zobristNumber(),
    },
    [Color.Black]: {
      kingside: zobristNumber(),
      queenside: zobristNumber(),
    },
  },
});
