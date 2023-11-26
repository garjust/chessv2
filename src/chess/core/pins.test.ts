import { expect, test } from 'vitest';
import { parseFEN, FEN_LIBRARY } from '../lib/fen';
import { Color, DirectionUnit, PieceType } from '../types';
import Pins from './pins';
import { copyToInternal } from './position';
import Core from '.';

test('pins', () => {
  // Vienna gambit accepted with moreee pinsss.
  const position = parseFEN(
    '2k2bnr/pppr1p2/2n3p1/3NPB1p/5Bb1/5N2/PPP3PP/R2K3R w  - 2 14',
  );
  const absolutePins = {
    [Color.White]: new Pins(position.pieces, 3, Color.White),
    [Color.Black]: new Pins(position.pieces, 58, Color.Black),
  };

  expect(absolutePins[Color.White].allPins).toEqual([
    {
      to: 21,
      from: 30,
      direction: DirectionUnit.DownLeft,
      legalMoveSquares: [12, 21],
    },
    {
      to: 35,
      from: 51,
      direction: DirectionUnit.Down,
      legalMoveSquares: [11, 19, 27, 43, 35],
    },
  ]);
  expect(absolutePins[Color.Black].allPins).toEqual([
    {
      to: 51,
      from: 37,
      direction: DirectionUnit.UpLeft,
      legalMoveSquares: [44, 51],
    },
  ]);
});

test('pawn capture and promotion creates pin', () => {
  const core = new Core(parseFEN(FEN_LIBRARY.PERFT_5_FEN));
  expect(core.pins).toEqual([]);

  core.applyMove({ from: 51, to: 58, promotion: PieceType.Queen }); // capture & promote
  expect(core.pins).toEqual([
    {
      from: 58,
      to: 59,
      direction: DirectionUnit.Right,
      legalMoveSquares: [60, 59],
    },
  ]);

  core.undoLastMove();
  expect(core.pins).toEqual([]);
});

test('piece in same ray as pin but not pinned piece can move', () => {
  const core = new Core(parseFEN(FEN_LIBRARY.PERFT_5_FEN));
  expect(core.pins).toEqual([]);

  core.applyMove({ from: 51, to: 58, promotion: PieceType.Queen }); // capture & promote

  expect(core.pinBy(Color.Black, 57)).toEqual(undefined);
});

test('castling rook resolves pin and creates pin on opponent', () => {
  const core = new Core(
    parseFEN('5k1r/p3bppp/p3b3/P1p5/4n3/N7/R1PB2PP/1r1QK2R w K - 0 18'),
  );
  expect(core.pins).toEqual([
    {
      from: 1,
      to: 3,
      direction: DirectionUnit.Right,
      legalMoveSquares: [2, 3],
    },
  ]);

  core.applyMove({ from: 4, to: 6 }); // white kingside castle
  expect(core.pins).toEqual([
    {
      from: 5,
      to: 53,
      direction: DirectionUnit.Up,
      legalMoveSquares: [45, 37, 29, 21, 13, 53],
    },
  ]);

  core.undoLastMove();
  expect(core.pins).toEqual([
    {
      from: 1,
      to: 3,
      direction: DirectionUnit.Right,
      legalMoveSquares: [2, 3],
    },
  ]);
});

test('castling rook resolves 1 pin on opponent', () => {
  const core = new Core(
    parseFEN('5r1k/p4p1p/4b1p1/Pp2b3/2p5/2B2P2/1RP5/3QK2R w K - 0 30'),
  );
  expect(core.pins).toEqual([
    {
      from: 18,
      to: 36,
      direction: DirectionUnit.UpRight,
      legalMoveSquares: [54, 45, 27, 36],
    },
    {
      from: 7,
      to: 55,
      direction: DirectionUnit.Up,
      legalMoveSquares: [47, 39, 31, 23, 15, 55],
    },
  ]);

  core.applyMove({ from: 4, to: 6 }); // white kingside castle
  expect(core.pins).toEqual([
    {
      from: 18,
      to: 36,
      direction: DirectionUnit.UpRight,
      legalMoveSquares: [54, 45, 27, 36],
    },
  ]);

  core.undoLastMove();
  expect(core.pins).toEqual([
    {
      from: 18,
      to: 36,
      direction: DirectionUnit.UpRight,
      legalMoveSquares: [54, 45, 27, 36],
    },
    {
      from: 7,
      to: 55,
      direction: DirectionUnit.Up,
      legalMoveSquares: [47, 39, 31, 23, 15, 55],
    },
  ]);
});
