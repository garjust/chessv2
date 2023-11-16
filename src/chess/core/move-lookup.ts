import { DirectionUnit, PieceType, Square } from '../types';
import { squareGenerator } from '../utils';

import {
  isLegalSquare,
  down,
  downLeft,
  downRight,
  left,
  ray,
  right,
  rankFileSquare,
  up,
  upLeft,
  upRight,
  rankFileToSquare,
} from './rank-file-square';

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

const bishopMovesByDirection = (from: Square): RaysByDirection =>
  [
    DirectionUnit.UpLeft,
    DirectionUnit.UpRight,
    DirectionUnit.DownLeft,
    DirectionUnit.DownRight,
  ].reduce<RaysByDirection>((obj, direction) => {
    obj[direction] = ray(from, direction);
    return obj;
  }, {});

const rookMovesByDirection = (from: Square): RaysByDirection =>
  [
    DirectionUnit.Up,
    DirectionUnit.Right,
    DirectionUnit.Left,
    DirectionUnit.Down,
  ].reduce<RaysByDirection>((obj, direction) => {
    obj[direction] = ray(from, direction);
    return obj;
  }, {});

const BISHOP_LOOKUP: Square[][][] = [];
const KNIGHT_LOOKUP: Square[][] = [];
const KING_LOOKUP: Square[][] = [];
const ROOK_LOOKUP: Square[][][] = [];
const QUEEN_LOOKUP: Square[][][] = [];

type RaysByDirection = Partial<Record<DirectionUnit, Square[]>>;

const BISHOP_LOOKUP_BY_DIRECTION: Array<RaysByDirection> = [];
const ROOK_LOOKUP_BY_DIRECTION: Array<RaysByDirection> = [];
const QUEEN_LOOKUP_BY_DIRECTION: Array<RaysByDirection> = [];

const KING_RAYS: { type: PieceType; ray: Square[] }[][] = [];
const SUPER_PIECE_LOOKUP: Square[][] = [];

for (const square of squareGenerator()) {
  BISHOP_LOOKUP_BY_DIRECTION[square] = bishopMovesByDirection(square);
  ROOK_LOOKUP_BY_DIRECTION[square] = rookMovesByDirection(square);
  QUEEN_LOOKUP_BY_DIRECTION[square] = {
    ...bishopMovesByDirection(square),
    ...rookMovesByDirection(square),
  };

  BISHOP_LOOKUP[square] = Object.values(BISHOP_LOOKUP_BY_DIRECTION[square]);
  KING_LOOKUP[square] = kingMoves(square);
  KNIGHT_LOOKUP[square] = knightMoves(square);
  ROOK_LOOKUP[square] = Object.values(ROOK_LOOKUP_BY_DIRECTION[square]);
  QUEEN_LOOKUP[square] = Object.values(QUEEN_LOOKUP_BY_DIRECTION[square]);

  KING_RAYS[square] = [
    ...BISHOP_LOOKUP[square].map((ray) => ({ type: PieceType.Bishop, ray })),
    ...ROOK_LOOKUP[square].map((ray) => ({ type: PieceType.Rook, ray })),
  ];

  SUPER_PIECE_LOOKUP[square] = [
    ...BISHOP_LOOKUP[square].flat(),
    ...ROOK_LOOKUP[square].flat(),
    ...KNIGHT_LOOKUP[square],
    ...KING_LOOKUP[square],
  ];
}

// Flat ray lists
//
// For each square, all squares for rays which intersect it.
const BISHOP_RAYS_FLAT: Square[][] = BISHOP_LOOKUP.map((raySet) =>
  raySet.flat(),
);
const ROOK_RAYS_FLAT: Square[][] = ROOK_LOOKUP.map((raySet) => raySet.flat());
const QUEEN_RAYS_FLAT: Square[][] = QUEEN_LOOKUP.map((raySet) => raySet.flat());

// Flat Bitarrays
//
// For each square, all squares for rays which intersect it in a sparse
// array format. This allows array index lookup (square as index) to determine
// if a square intersects any of the rays.
export const BISHOP_RAY_BITARRAYS: boolean[][] = BISHOP_RAYS_FLAT.map(
  (squares) => {
    const array = Array<boolean>(64);
    squares.forEach((x) => (array[x] = true));
    return array;
  },
);
export const ROOK_RAY_BITARRAYS: boolean[][] = ROOK_RAYS_FLAT.map((squares) => {
  const array = Array<boolean>(64);
  squares.forEach((x) => (array[x] = true));
  return array;
});
export const QUEEN_RAY_BITARRAYS: boolean[][] = QUEEN_RAYS_FLAT.map(
  (squares) => {
    const array = Array<boolean>(64);
    squares.forEach((x) => (array[x] = true));
    return array;
  },
);

export const SUPER_PIECE_BITARRAYS: boolean[][] = SUPER_PIECE_LOOKUP.map(
  (squares) => {
    const array = Array<boolean>(64);
    squares.forEach((x) => (array[x] = true));
    return array;
  },
);

export const RAY_BY_DIRECTION = {
  [PieceType.Bishop]: BISHOP_LOOKUP_BY_DIRECTION,
  [PieceType.Rook]: ROOK_LOOKUP_BY_DIRECTION,
  [PieceType.Queen]: QUEEN_LOOKUP_BY_DIRECTION,
};

export {
  BISHOP_LOOKUP,
  KING_LOOKUP,
  KNIGHT_LOOKUP,
  QUEEN_LOOKUP,
  ROOK_LOOKUP,
  QUEEN_RAYS_FLAT,
  KING_RAYS,
};
