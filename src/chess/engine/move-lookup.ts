import { fromSquares } from '../lib/bitboard';
import { PieceType, RankFile, Square } from '../types';
import { rankFileToSquare, squareGenerator } from '../utils';
import {
  up,
  left,
  right,
  down,
  upLeft,
  upRight,
  downLeft,
  downRight,
  isLegalSquare,
  ray,
} from './rank-file-square';

const kingMoves = (from: RankFile): Square[] =>
  [
    up(from),
    left(from),
    right(from),
    down(from),
    upLeft(from),
    upRight(from),
    downLeft(from),
    downRight(from),
  ]
    .filter((square) => isLegalSquare(square))
    .map((square) => rankFileToSquare(square));

const knightMoves = (from: RankFile): Square[] =>
  [
    up(left(from), 2),
    up(right(from), 2),
    left(up(from), 2),
    left(down(from), 2),
    down(left(from), 2),
    down(right(from), 2),
    right(up(from), 2),
    right(down(from), 2),
  ]
    .filter((square) => isLegalSquare(square))
    .map((square) => rankFileToSquare(square));

const bishopMoves = (from: RankFile): Square[][] =>
  [upLeft, upRight, downLeft, downRight]
    .map((scanFn) => ray(from, scanFn))
    .map((ray) => ray.map((square) => rankFileToSquare(square)));

const rookMoves = (from: RankFile): Square[][] =>
  [up, right, left, down]
    .map((scanFn) => ray(from, scanFn))
    .map((ray) => ray.map((square) => rankFileToSquare(square)));

const BISHOP_LOOKUP: Square[][][] = [];
const KNIGHT_LOOKUP: Square[][] = [];
const KING_LOOKUP: Square[][] = [];
const ROOK_LOOKUP: Square[][][] = [];
const QUEEN_LOOKUP: Square[][][] = [];

const KING_RAYS: { type: PieceType; ray: Square[] }[][] = [];
const SUPER_PIECE_LOOKUP: Square[][] = [];

for (const { rank, file } of squareGenerator()) {
  const square = rankFileToSquare({ rank, file });
  BISHOP_LOOKUP[square] = bishopMoves({ rank, file });
  KING_LOOKUP[square] = kingMoves({ rank, file });
  KNIGHT_LOOKUP[square] = knightMoves({ rank, file });
  ROOK_LOOKUP[square] = rookMoves({ rank, file });

  QUEEN_LOOKUP[square] = [
    ...bishopMoves({ rank, file }),
    ...rookMoves({ rank, file }),
  ];

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
  raySet.flat()
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
    const array = Array(64);
    squares.forEach((x) => (array[x] = true));
    return array;
  }
);
export const ROOK_RAY_BITARRAYS: boolean[][] = ROOK_RAYS_FLAT.map((squares) => {
  const array = Array(64);
  squares.forEach((x) => (array[x] = true));
  return array;
});
export const QUEEN_RAY_BITARRAYS: boolean[][] = QUEEN_RAYS_FLAT.map(
  (squares) => {
    const array = Array(64);
    squares.forEach((x) => (array[x] = true));
    return array;
  }
);

export const SUPER_PIECE_BITARRAYS: boolean[][] = SUPER_PIECE_LOOKUP.map(
  (squares) => {
    const array = Array(64);
    squares.forEach((x) => (array[x] = true));
    return array;
  }
);

// For each square, all squares for all rays which intersect it in bitboard
// format. unfortunately bigints are quite slow so bit operations are much
// slower than expected.
const KING_RAY_BITBOARDS_FLAT: bigint[] = QUEEN_RAYS_FLAT.map((flatRays) =>
  fromSquares(flatRays)
);

export {
  BISHOP_LOOKUP,
  KING_LOOKUP,
  KNIGHT_LOOKUP,
  QUEEN_LOOKUP,
  ROOK_LOOKUP,
  QUEEN_RAYS_FLAT,
  KING_RAYS,
  KING_RAY_BITBOARDS_FLAT,
};
