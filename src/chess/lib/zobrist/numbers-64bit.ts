import { Color, PieceType, Square } from '../../types';
import { Type, ZobristNumbers } from './types';

const zobristNumber = (bits = 64): bigint => {
  let temp = '0b';
  for (let i = 0; i < bits; i++) {
    temp += Math.round(Math.random());
  }

  return BigInt(temp);
};

const numbersForSquare = () => ({
  [PieceType.Bishop]: zobristNumber(),
  [PieceType.King]: zobristNumber(),
  [PieceType.Knight]: zobristNumber(),
  [PieceType.Pawn]: zobristNumber(),
  [PieceType.Queen]: zobristNumber(),
  [PieceType.Rook]: zobristNumber(),
});

const numbersForSquares = () => {
  const obj: Record<Square, Record<PieceType, bigint>> = {};
  for (let square: Square = 0; square < 64; square++) {
    obj[square] = numbersForSquare();
  }
  return obj;
};

export const makeNumbers = (): ZobristNumbers<bigint> => ({
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

const numbers = makeNumbers();
