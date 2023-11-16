import { DirectionUnit, Square } from '../../types';
import { squareGenerator } from '../../utils';
import {
  isLegalSquare,
  down,
  downLeft,
  downRight,
  left,
  right,
  rankFileSquare,
  up,
  upLeft,
  upRight,
  rankFileToSquare,
} from './movement';
import { ray } from './rays';

const kingMoves = (from: Square): Square[] =>
  [
    up(rankFileSquare(from)),
    left(rankFileSquare(from)),
    right(rankFileSquare(from)),
    down(rankFileSquare(from)),
    upLeft(rankFileSquare(from)),
    upRight(rankFileSquare(from)),
    downLeft(rankFileSquare(from)),
    downRight(rankFileSquare(from)),
  ]
    .filter((square) => isLegalSquare(square))
    .map(rankFileToSquare);

const knightMoves = (from: Square): Square[] =>
  [
    up(left(rankFileSquare(from)), 2),
    up(right(rankFileSquare(from)), 2),
    left(up(rankFileSquare(from)), 2),
    left(down(rankFileSquare(from)), 2),
    down(left(rankFileSquare(from)), 2),
    down(right(rankFileSquare(from)), 2),
    right(up(rankFileSquare(from)), 2),
    right(down(rankFileSquare(from)), 2),
  ]
    .filter((square) => isLegalSquare(square))
    .map(rankFileToSquare);

// const bishopMoves = (from: Square): Square[][] =>
//   [upLeft, upRight, downLeft, downRight].map(scan(from));

// const rookMoves = (from: Square): Square[][] =>
//   [up, right, left, down].map(scan(from));

type BishopRays = {
  [DirectionUnit.UpLeft]: Square[];
  [DirectionUnit.UpRight]: Square[];
  [DirectionUnit.DownLeft]: Square[];
  [DirectionUnit.DownRight]: Square[];
};

type RookRays = {
  [DirectionUnit.Up]: Square[];
  [DirectionUnit.Down]: Square[];
  [DirectionUnit.Left]: Square[];
  [DirectionUnit.Right]: Square[];
};

const bishopMovesByDirection = (from: Square): BishopRays =>
  (
    [
      DirectionUnit.UpLeft,
      DirectionUnit.UpRight,
      DirectionUnit.DownLeft,
      DirectionUnit.DownRight,
    ] as const
  ).reduce<BishopRays>(
    (obj, direction) => {
      obj[direction] = ray(from, direction);
      return obj;
    },
    {
      [DirectionUnit.UpLeft]: [],
      [DirectionUnit.UpRight]: [],
      [DirectionUnit.DownLeft]: [],
      [DirectionUnit.DownRight]: [],
    },
  );

const rookMovesByDirection = (from: Square): RookRays =>
  (
    [
      DirectionUnit.Up,
      DirectionUnit.Right,
      DirectionUnit.Left,
      DirectionUnit.Down,
    ] as const
  ).reduce<RookRays>(
    (obj, direction) => {
      obj[direction] = ray(from, direction);
      return obj;
    },
    {
      [DirectionUnit.Up]: [],
      [DirectionUnit.Down]: [],
      [DirectionUnit.Left]: [],
      [DirectionUnit.Right]: [],
    },
  );

const BISHOP_LOOKUP: Square[][][] = [];
const KNIGHT_MOVES: Square[][] = [];
const KING_MOVES: Square[][] = [];
const ROOK_LOOKUP: Square[][][] = [];
const QUEEN_LOOKUP: Square[][][] = [];

const BISHOP_LOOKUP_BY_DIRECTION: Array<BishopRays> = [];
const ROOK_LOOKUP_BY_DIRECTION: Array<RookRays> = [];
const RAYS_BY_DIRECTION: Array<BishopRays & RookRays> = [];

const SUPER_PIECE_LOOKUP: Square[][] = [];

for (const square of squareGenerator()) {
  BISHOP_LOOKUP_BY_DIRECTION[square] = bishopMovesByDirection(square);
  ROOK_LOOKUP_BY_DIRECTION[square] = rookMovesByDirection(square);
  RAYS_BY_DIRECTION[square] = {
    ...bishopMovesByDirection(square),
    ...rookMovesByDirection(square),
  };

  BISHOP_LOOKUP[square] = Object.values(BISHOP_LOOKUP_BY_DIRECTION[square]);
  KING_MOVES[square] = kingMoves(square);
  KNIGHT_MOVES[square] = knightMoves(square);
  ROOK_LOOKUP[square] = Object.values(ROOK_LOOKUP_BY_DIRECTION[square]);
  QUEEN_LOOKUP[square] = Object.values(RAYS_BY_DIRECTION[square]);

  SUPER_PIECE_LOOKUP[square] = [
    ...BISHOP_LOOKUP[square].flat(),
    ...ROOK_LOOKUP[square].flat(),
    ...KNIGHT_MOVES[square],
    ...KING_MOVES[square],
  ];
}

// Move lookup bitarrays
// -----------------------------------------------------------------------------

export {
  BISHOP_LOOKUP,
  KING_MOVES,
  QUEEN_LOOKUP,
  SUPER_PIECE_LOOKUP,
  KNIGHT_MOVES,
  ROOK_LOOKUP,
  RAYS_BY_DIRECTION,
};
