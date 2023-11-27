import { expect, test } from 'vitest';
import { parseFEN, FEN_LIBRARY } from '../lib/fen';
import { Color, DirectionUnit, PieceType, SquareControl } from '../types';
import { labelToSquare } from '../utils';
import { RAYS_BY_DIRECTION } from './lookup/piece-squares';
import {
  buildMove,
  directionOfMove,
  down,
  downLeft,
  downRight,
  flipDirection,
  left,
  rayControlScanner,
  right,
  squareControlXraysMove,
  up,
  upLeft,
  upRight,
} from './move-utils';
import { RAY_MOVES_BY_DIRECTION } from './lookup';

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

test('directionOfMove', () => {
  expect(directionOfMove(35, 34)).toEqual(DirectionUnit.Left);
  expect(directionOfMove(35, 43)).toEqual(DirectionUnit.Up);
  expect(directionOfMove(35, 36)).toEqual(DirectionUnit.Right);
  expect(directionOfMove(35, 27)).toEqual(DirectionUnit.Down);
  expect(directionOfMove(35, 42)).toEqual(DirectionUnit.UpLeft);
  expect(directionOfMove(35, 44)).toEqual(DirectionUnit.UpRight);
  expect(directionOfMove(35, 26)).toEqual(DirectionUnit.DownLeft);
  expect(directionOfMove(35, 28)).toEqual(DirectionUnit.DownRight);

  expect(directionOfMove(28, 26)).toEqual(DirectionUnit.Left);
  expect(directionOfMove(28, 44)).toEqual(DirectionUnit.Up);
  expect(directionOfMove(28, 30)).toEqual(DirectionUnit.Right);
  expect(directionOfMove(28, 12)).toEqual(DirectionUnit.Down);
  expect(directionOfMove(28, 42)).toEqual(DirectionUnit.UpLeft);
  expect(directionOfMove(28, 46)).toEqual(DirectionUnit.UpRight);
  expect(directionOfMove(28, 10)).toEqual(DirectionUnit.DownLeft);
  expect(directionOfMove(28, 14)).toEqual(DirectionUnit.DownRight);

  expect(directionOfMove(0, 56)).toEqual(DirectionUnit.Up);
  expect(directionOfMove(0, 63)).toEqual(DirectionUnit.UpRight);
  expect(directionOfMove(9, 63)).toEqual(DirectionUnit.UpRight);
  expect(directionOfMove(0, 7)).toEqual(DirectionUnit.Right);

  expect(directionOfMove(63, 7)).toEqual(DirectionUnit.Down);
  expect(directionOfMove(63, 0)).toEqual(DirectionUnit.DownLeft);
  expect(directionOfMove(63, 56)).toEqual(DirectionUnit.Left);

  expect(directionOfMove(4, 60)).toEqual(DirectionUnit.Up);
  expect(directionOfMove(56, 7)).toEqual(DirectionUnit.DownRight);
  expect(directionOfMove(56, 0)).toEqual(DirectionUnit.Down);
});

test('flipDirection', () => {
  expect(flipDirection(DirectionUnit.Up)).toEqual(DirectionUnit.Down);
  expect(flipDirection(DirectionUnit.Down)).toEqual(DirectionUnit.Up);
  expect(flipDirection(DirectionUnit.Left)).toEqual(DirectionUnit.Right);
  expect(flipDirection(DirectionUnit.Right)).toEqual(DirectionUnit.Left);
  expect(flipDirection(DirectionUnit.UpLeft)).toEqual(DirectionUnit.DownRight);
  expect(flipDirection(DirectionUnit.UpRight)).toEqual(DirectionUnit.DownLeft);
  expect(flipDirection(DirectionUnit.DownLeft)).toEqual(DirectionUnit.UpRight);
  expect(flipDirection(DirectionUnit.DownRight)).toEqual(DirectionUnit.UpLeft);
});

test('squareControlXraysMove', () => {
  let squareControl: SquareControl = {
    piece: { type: PieceType.Queen, color: Color.White },
    from: 34,
    to: 13,
  };

  expect(squareControlXraysMove(squareControl, buildMove(0, 8))).toEqual(false);
  expect(squareControlXraysMove(squareControl, buildMove(41, 48))).toEqual(
    false,
  );
  expect(squareControlXraysMove(squareControl, buildMove(27, 36))).toEqual(
    false,
  );
  expect(squareControlXraysMove(squareControl, buildMove(14, 7))).toEqual(true);

  squareControl = {
    piece: { type: PieceType.Queen, color: Color.White },
    from: 44,
    to: 52,
  };
  expect(squareControlXraysMove(squareControl, buildMove(52, 60))).toEqual(
    true,
  );
});

test('rayControlScanner bishop', () => {
  const position = parseFEN(FEN_LIBRARY.VIENNA_OPENING_FEN);
  const from = labelToSquare('c4');
  const piece = { type: PieceType.Bishop, color: Color.White } as const;
  const ray =
    RAY_MOVES_BY_DIRECTION[piece.color][from][piece.type][
      DirectionUnit.UpRight
    ];

  expect(ray.map(({ to }) => to)).toEqual([35, 44, 53, 62]);

  const squareControl = rayControlScanner(position.pieces, ray);
  expect(squareControl).toEqual([
    {
      piece,
      from,
      to: 35,
    },
    {
      piece,
      from,
      to: 44,
    },
    {
      piece,
      from,
      to: 53,
    },
  ]);
});

test('rayControlScanner bishop skipPast', () => {
  const position = parseFEN(FEN_LIBRARY.VIENNA_OPENING_FEN);
  const from = labelToSquare('c4');
  const piece = { type: PieceType.Bishop, color: Color.White } as const;
  const ray =
    RAY_MOVES_BY_DIRECTION[piece.color][from][piece.type][
      DirectionUnit.UpRight
    ];

  const squareControl = rayControlScanner(position.pieces, ray, 53);
  expect(squareControl).toEqual([
    {
      piece,
      from,
      to: 62,
    },
  ]);
});

test('rayControlScanner queen skipPast through own piece', () => {
  const position = parseFEN(
    'rnbqkbnr/ppp1pppp/8/3p4/3PP3/8/PPP2PPP/RNBQKBNR b KQkq e3 0 2',
  );
  const from = labelToSquare('d1');
  const piece = { type: PieceType.Queen, color: Color.White } as const;
  const ray =
    RAY_MOVES_BY_DIRECTION[piece.color][from][piece.type][DirectionUnit.Up];

  expect(ray.map(({ to }) => to)).toEqual([11, 19, 27, 35, 43, 51, 59]);

  const squareControl = rayControlScanner(position.pieces, ray, 35);
  // No square control because a piece is blocking the ray before the skipPast
  // square.
  expect(squareControl).toEqual([]);
});

test('rayControlScanner queen skipPast is a1', () => {
  const position = parseFEN(
    'r1bqkbnr/pppppppp/n7/8/8/P7/RPPPPPPP/1NBQKBNR b Kkq - 2 2',
  );
  const from = labelToSquare('d1');
  const piece = { type: PieceType.Queen, color: Color.White } as const;
  const ray =
    RAY_MOVES_BY_DIRECTION[piece.color][from][piece.type][DirectionUnit.Left];
  expect(ray.map(({ to }) => to)).toEqual([2, 1, 0]);

  const squareControl = rayControlScanner(
    position.pieces,
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
  const from = labelToSquare('a1');
  const piece = { type: PieceType.Rook, color: Color.White } as const;
  const ray =
    RAY_MOVES_BY_DIRECTION[piece.color][from][piece.type][DirectionUnit.Up];
  const move = { from: 48, to: 40 };

  expect(ray.map(({ to }) => to)).toEqual([8, 16, 24, 32, 40, 48, 56]);

  // A pawn has just moved close to the scanning piece.
  const squareControl = rayControlScanner(
    position.pieces,
    ray,
    move.to,
    move.from,
  );

  expect(squareControl).toEqual([
    {
      piece,
      from,
      to: 48,
    },
  ]);
});
