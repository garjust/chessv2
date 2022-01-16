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
  [Type.Turn]: {
    [Color.White]: zobristNumber(),
    [Color.Black]: zobristNumber(),
  },
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

// console.log(
//   'zobrist',
//   ZOBRIST_NUMBERS_FOR_TURN,
//   ZOBRIST_NUMBERS_FOR_CASTLING,
//   ZOBRIST_NUMBERS_FOR_SQUARES
// );
// console.log(
//   'zobrist-bits',
//   JSON.stringify(
//     {
//       turn: ZOBRIST_NUMBERS_FOR_TURN,
//       castling: ZOBRIST_NUMBERS_FOR_CASTLING,
//       pieceSquare: ZOBRIST_NUMBERS_FOR_SQUARES,
//     },
//     (key: string, value: unknown) => {
//       if (value instanceof Object) {
//         return value;
//       } else {
//         return formatBits(value as number);
//       }
//     },
//     2
//   )
// );
