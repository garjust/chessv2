import { Bitboard } from '../lib/bitboard';
import { CastlingAvailability, Color, PieceType } from '../types';

export type Square = bigint;

export const White = 0b01000;
export const Black = 0b10000;
export const Bishop = 0b00001;
export const King = 0b00010;
export const Knight = 0b00011;
export const Pawn = 0b00100;
export const Queen = 0b00101;
export const Rook = 0b00110;

const blackPawn = Black & Pawn;

export type MutablePosition = {
  board: {
    [Color.White]: Bitboard;
    [Color.Black]: Bitboard;
    [PieceType.Bishop]: Bitboard;
    [PieceType.King]: Bitboard;
    [PieceType.Knight]: Bitboard;
    [PieceType.Pawn]: Bitboard;
    [PieceType.Queen]: Bitboard;
    [PieceType.Rook]: Bitboard;
  };

  attacks: {
    [Color.White]: Bitboard;
    [Color.Black]: Bitboard;
  };

  // Which player's turn it is.
  turn: Color;
  // Castling availability.
  castlingAvailability: CastlingAvailability;
  // If a pawn has just made a two-square move, this is the
  // position "behind" the pawn.
  enPassantSquare: Square | null;
  // The number of halfmoves since the last capture or pawn advance, used for
  // the fifty-move rule.
  halfMoveCount: number;
  // The number of the full move. It starts at 1, and is incremented
  // after Black's move.
  fullMoveCount: number;
};
