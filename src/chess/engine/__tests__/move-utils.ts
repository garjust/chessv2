import { parseFEN, VIENNA_OPENING_FEN } from '../../lib/fen';
import { Color, DirectionUnit, PieceType } from '../../types';
import { labelToSquare } from '../../utils';
import { RAY_BY_DIRECTION } from '../move-lookup';
import { rayControlScanner } from '../move-utils';

test('rayControlScanner bishop', () => {
  const position = parseFEN(VIENNA_OPENING_FEN);
  const scanningPiece = {
    square: labelToSquare('c4'),
    piece: { type: PieceType.Bishop, color: Color.White },
  };
  const ray =
    RAY_BY_DIRECTION[PieceType.Bishop][scanningPiece.square][
      DirectionUnit.UpRight
    ];

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
  const position = parseFEN(VIENNA_OPENING_FEN);
  const scanningPiece = {
    square: labelToSquare('c4'),
    piece: { type: PieceType.Bishop, color: Color.White },
  };
  const ray =
    RAY_BY_DIRECTION[PieceType.Bishop][scanningPiece.square][
      DirectionUnit.UpRight
    ];

  const squareControl = rayControlScanner(
    position.pieces,
    scanningPiece,
    ray,
    53
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
    'rnbqkbnr/ppp1pppp/8/3p4/3PP3/8/PPP2PPP/RNBQKBNR b KQkq e3 0 2'
  );
  const scanningPiece = {
    square: labelToSquare('d1'),
    piece: { type: PieceType.Queen, color: Color.White },
  };
  const ray =
    RAY_BY_DIRECTION[PieceType.Queen][scanningPiece.square][DirectionUnit.Up];

  expect(ray).toEqual([11, 19, 27, 35, 43, 51, 59]);

  const squareControl = rayControlScanner(
    position.pieces,
    scanningPiece,
    ray,
    35
  );
  // No square control because a piece is blocking the ray before the skipPast
  // square.
  expect(squareControl).toEqual([]);
});

test('rayControlScanner rook skipPast through opponent piece', () => {
  const position = parseFEN(
    'rnbqkbnr/2pppppp/p7/1P6/8/8/1PPPPPPP/RNBQKBNR w KQkq - 0 3'
  );
  const scanningPiece = {
    square: labelToSquare('a1'),
    piece: { type: PieceType.Rook, color: Color.White },
  };
  const ray =
    RAY_BY_DIRECTION[PieceType.Rook][scanningPiece.square][DirectionUnit.Up];
  const move = { from: 48, to: 40 };

  expect(ray).toEqual([8, 16, 24, 32, 40, 48, 56]);

  // A pawn has just moved close to the scanning piece.
  const squareControl = rayControlScanner(
    position.pieces,
    scanningPiece,
    ray,
    move.to,
    move.from
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
