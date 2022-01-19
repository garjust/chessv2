import { Color, PieceType, Square } from '../../types';

export enum Type {
  Turn = 'TURN',
  PieceSquare = 'PIECE_SQUARE',
  CastlingAvailability = 'CASTLING_AVAILABILITY',
}

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

export type NumberOrBigInt = XOR<number, bigint>;

export type ZobristNumbers<T> = {
  [Type.Turn]: T;
  [Type.PieceSquare]: {
    [Color.White]: Record<
      Square,
      {
        [PieceType.Bishop]: T;
        [PieceType.King]: T;
        [PieceType.Knight]: T;
        [PieceType.Pawn]: T;
        [PieceType.Queen]: T;
        [PieceType.Rook]: T;
      }
    >;
    [Color.Black]: Record<
      Square,
      {
        [PieceType.Bishop]: T;
        [PieceType.King]: T;
        [PieceType.Knight]: T;
        [PieceType.Pawn]: T;
        [PieceType.Queen]: T;
        [PieceType.Rook]: T;
      }
    >;
  };
  [Type.CastlingAvailability]: {
    [Color.White]: {
      kingside: T;
      queenside: T;
    };
    [Color.Black]: {
      kingside: T;
      queenside: T;
    };
  };
};
