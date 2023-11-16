import { expect, test } from 'vitest';
import { parseFEN, FEN_LIBRARY } from '../lib/fen';
import { Color, DirectionUnit, PieceType, SquareControlObject } from '../types';
import { labelToSquare } from '../utils';
import { RAYS_BY_DIRECTION } from './lookup/move-lookup';
import {
  down,
  downLeft,
  downRight,
  left,
  rayControlScanner,
  right,
  squareControlXraysMove,
  up,
  upLeft,
  upRight,
} from './move-utils';

test('movement functions', () => {
  expect(up(4)).toEqual(12);
  expect(down(11)).toEqual(3);
  expect(left(20)).toEqual(19);
  expect(right(20)).toEqual(21);
  expect(upLeft(36)).toEqual(43);
  expect(upRight(36)).toEqual(45);
  expect(downLeft(36)).toEqual(27);
  expect(downRight(36)).toEqual(29);
});

test('squareControlXraysMove', () => {
  let squareControl: SquareControlObject = {
    attacker: { square: 34, type: PieceType.Queen },
    square: 13,
    slideSquares: [27, 20],
  };

  expect(squareControlXraysMove(squareControl, { from: 0, to: 8 })).toEqual(
    false,
  );
  expect(squareControlXraysMove(squareControl, { from: 41, to: 48 })).toEqual(
    false,
  );
  expect(squareControlXraysMove(squareControl, { from: 27, to: 36 })).toEqual(
    false,
  );
  expect(squareControlXraysMove(squareControl, { from: 14, to: 7 })).toEqual(
    true,
  );

  squareControl = {
    attacker: { square: 44, type: PieceType.Queen },
    square: 52,
    slideSquares: [],
  };
  expect(squareControlXraysMove(squareControl, { from: 52, to: 60 })).toEqual(
    true,
  );
});

test('rayControlScanner bishop', () => {
  const position = parseFEN(FEN_LIBRARY.VIENNA_OPENING_FEN);
  const scanningPiece = {
    square: labelToSquare('c4'),
    piece: { type: PieceType.Bishop, color: Color.White },
  };
  const ray = RAYS_BY_DIRECTION[scanningPiece.square][DirectionUnit.UpRight];

  expect(ray).toEqual([35, 44, 53, 62]);

  const squareControl = rayControlScanner(position.pieces, scanningPiece, ray);
  expect(squareControl).toEqual([
    {
      attacker: {
        square: scanningPiece.square,
        type: PieceType.Bishop,
      },
      square: 35,
      slideSquares: [],
    },
    {
      attacker: {
        square: scanningPiece.square,
        type: PieceType.Bishop,
      },
      square: 44,
      slideSquares: [35],
    },
    {
      attacker: {
        square: scanningPiece.square,
        type: PieceType.Bishop,
      },
      square: 53,
      slideSquares: [35, 44],
    },
  ]);
});

test('rayControlScanner bishop skipPast', () => {
  const position = parseFEN(FEN_LIBRARY.VIENNA_OPENING_FEN);
  const scanningPiece = {
    square: labelToSquare('c4'),
    piece: { type: PieceType.Bishop, color: Color.White },
  };
  const ray = RAYS_BY_DIRECTION[scanningPiece.square][DirectionUnit.UpRight];

  const squareControl = rayControlScanner(
    position.pieces,
    scanningPiece,
    ray,
    53,
  );
  expect(squareControl).toEqual([
    {
      attacker: {
        square: scanningPiece.square,
        type: PieceType.Bishop,
      },
      square: 62,
      slideSquares: [35, 44, 53],
    },
  ]);
});

test('rayControlScanner queen skipPast through own piece', () => {
  const position = parseFEN(
    'rnbqkbnr/ppp1pppp/8/3p4/3PP3/8/PPP2PPP/RNBQKBNR b KQkq e3 0 2',
  );
  const scanningPiece = {
    square: labelToSquare('d1'),
    piece: { type: PieceType.Queen, color: Color.White },
  };
  const ray = RAYS_BY_DIRECTION[scanningPiece.square][DirectionUnit.Up];

  expect(ray).toEqual([11, 19, 27, 35, 43, 51, 59]);

  const squareControl = rayControlScanner(
    position.pieces,
    scanningPiece,
    ray,
    35,
  );
  // No square control because a piece is blocking the ray before the skipPast
  // square.
  expect(squareControl).toEqual([]);
});

test('rayControlScanner queen skipPast is a1', () => {
  const position = parseFEN(
    'r1bqkbnr/pppppppp/n7/8/8/P7/RPPPPPPP/1NBQKBNR b Kkq - 2 2',
  );
  const scanningPiece = {
    square: labelToSquare('d1'),
    piece: { type: PieceType.Queen, color: Color.White },
  };
  const ray = RAYS_BY_DIRECTION[scanningPiece.square][DirectionUnit.Left];

  expect(ray).toEqual([2, 1, 0]);

  const squareControl = rayControlScanner(
    position.pieces,
    scanningPiece,
    ray,
    // The bug here was the 0-square being treated as false
    0,
  );
  // No square control because a piece is blocking the ray before the skipPast
  // square.
  expect(squareControl).toEqual([]);
});

test('rayControlScanner rook skipPast through opponent piece', () => {
  const position = parseFEN(
    'rnbqkbnr/2pppppp/p7/1P6/8/8/1PPPPPPP/RNBQKBNR w KQkq - 0 3',
  );
  const scanningPiece = {
    square: labelToSquare('a1'),
    piece: { type: PieceType.Rook, color: Color.White },
  };
  const ray = RAYS_BY_DIRECTION[scanningPiece.square][DirectionUnit.Up];
  const move = { from: 48, to: 40 };

  expect(ray).toEqual([8, 16, 24, 32, 40, 48, 56]);

  // A pawn has just moved close to the scanning piece.
  const squareControl = rayControlScanner(
    position.pieces,
    scanningPiece,
    ray,
    move.to,
    move.from,
  );

  expect(squareControl).toEqual([
    {
      attacker: {
        square: scanningPiece.square,
        type: PieceType.Rook,
      },
      square: 48,
      slideSquares: [8, 16, 24, 32, 40],
    },
  ]);
});
