import { expect, test } from 'vitest';
import { FEN_LIBRARY, formatPosition, parseFEN } from './fen';
import { Color, PieceType, Position } from '../types';

test('parse/encode starting position', () => {
  const expectedPosition: Position = {
    pieces: new Map([
      [56, { color: Color.Black, type: PieceType.Rook }],
      [57, { color: Color.Black, type: PieceType.Knight }],
      [58, { color: Color.Black, type: PieceType.Bishop }],
      [59, { color: Color.Black, type: PieceType.Queen }],
      [60, { color: Color.Black, type: PieceType.King }],
      [61, { color: Color.Black, type: PieceType.Bishop }],
      [62, { color: Color.Black, type: PieceType.Knight }],
      [63, { color: Color.Black, type: PieceType.Rook }],
      [48, { color: Color.Black, type: PieceType.Pawn }],
      [49, { color: Color.Black, type: PieceType.Pawn }],
      [50, { color: Color.Black, type: PieceType.Pawn }],
      [51, { color: Color.Black, type: PieceType.Pawn }],
      [52, { color: Color.Black, type: PieceType.Pawn }],
      [53, { color: Color.Black, type: PieceType.Pawn }],
      [54, { color: Color.Black, type: PieceType.Pawn }],
      [55, { color: Color.Black, type: PieceType.Pawn }],
      [8, { color: Color.White, type: PieceType.Pawn }],
      [9, { color: Color.White, type: PieceType.Pawn }],
      [10, { color: Color.White, type: PieceType.Pawn }],
      [11, { color: Color.White, type: PieceType.Pawn }],
      [12, { color: Color.White, type: PieceType.Pawn }],
      [13, { color: Color.White, type: PieceType.Pawn }],
      [14, { color: Color.White, type: PieceType.Pawn }],
      [15, { color: Color.White, type: PieceType.Pawn }],
      [0, { color: Color.White, type: PieceType.Rook }],
      [1, { color: Color.White, type: PieceType.Knight }],
      [2, { color: Color.White, type: PieceType.Bishop }],
      [3, { color: Color.White, type: PieceType.Queen }],
      [4, { color: Color.White, type: PieceType.King }],
      [5, { color: Color.White, type: PieceType.Bishop }],
      [6, { color: Color.White, type: PieceType.Knight }],
      [7, { color: Color.White, type: PieceType.Rook }],
    ]),
    turn: Color.White,
    castlingAvailability: {
      BLACK: {
        kingside: true,
        queenside: true,
      },
      WHITE: {
        kingside: true,
        queenside: true,
      },
    },
    enPassantSquare: null,
    fullMoveCount: 1,
    halfMoveCount: 0,
  };

  expect(parseFEN(FEN_LIBRARY.STARTING_POSITION_FEN)).toEqual(expectedPosition);
  expect(parseFEN('startpos')).toEqual(expectedPosition);

  expect(formatPosition(expectedPosition)).toEqual(
    FEN_LIBRARY.STARTING_POSITION_FEN,
  );
});

test('parse/encode blank fen', () => {
  const expectedPosition: Position = {
    pieces: new Map(),
    turn: Color.White,
    castlingAvailability: {
      BLACK: {
        kingside: false,
        queenside: false,
      },
      WHITE: {
        kingside: false,
        queenside: false,
      },
    },
    enPassantSquare: null,
    fullMoveCount: 1,
    halfMoveCount: 0,
  };

  expect(parseFEN(FEN_LIBRARY.BLANK_POSITION_FEN)).toEqual(expectedPosition);
  expect(formatPosition(expectedPosition)).toEqual(
    FEN_LIBRARY.BLANK_POSITION_FEN,
  );
});
