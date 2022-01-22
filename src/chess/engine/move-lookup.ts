import { fromSquares } from '../lib/bitboard';
import { DirectionUnit, PieceType, RankFile, Square } from '../types';
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

type ScanFn = (square: RankFile, n?: number) => RankFile;

const SCAN_FN_FOR_DIRECTION = {
  [DirectionUnit.UpLeft]: upLeft,
  [DirectionUnit.UpRight]: upRight,
  [DirectionUnit.DownLeft]: downLeft,
  [DirectionUnit.DownRight]: downRight,
  [DirectionUnit.Up]: up,
  [DirectionUnit.Right]: right,
  [DirectionUnit.Left]: left,
  [DirectionUnit.Down]: down,
};

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

const scan = (square: RankFile, scanFn: ScanFn) =>
  ray(square, scanFn).map((square) => rankFileToSquare(square));

const bishopMoves = (from: RankFile): Square[][] =>
  [upLeft, upRight, downLeft, downRight].map((scanFn) => scan(from, scanFn));

const rookMoves = (from: RankFile): Square[][] =>
  [up, right, left, down].map((scanFn) => scan(from, scanFn));

const bishopMovesByDirection = (from: RankFile): RaysByDirection =>
  [
    DirectionUnit.UpLeft,
    DirectionUnit.UpRight,
    DirectionUnit.DownLeft,
    DirectionUnit.DownRight,
  ].reduce((obj, direction) => {
    obj[direction] = scan(from, SCAN_FN_FOR_DIRECTION[direction]);
    return obj;
  }, {} as RaysByDirection);

const rookMovesByDirection = (from: RankFile): RaysByDirection =>
  [
    DirectionUnit.Up,
    DirectionUnit.Right,
    DirectionUnit.Left,
    DirectionUnit.Down,
  ].reduce((obj, direction) => {
    obj[direction] = scan(from, SCAN_FN_FOR_DIRECTION[direction]);
    return obj;
  }, {} as RaysByDirection);

const BISHOP_LOOKUP: Square[][][] = [];
const KNIGHT_LOOKUP: Square[][] = [];
const KING_LOOKUP: Square[][] = [];
const ROOK_LOOKUP: Square[][][] = [];
const QUEEN_LOOKUP: Square[][][] = [];

type RaysByDirection = Record<DirectionUnit, Square[]>;

const BISHOP_LOOKUP_BY_DIRECTION: Array<RaysByDirection> = [];
const ROOK_LOOKUP_BY_DIRECTION: Array<RaysByDirection> = [];
const QUEEN_LOOKUP_BY_DIRECTION: Array<RaysByDirection> = [];

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

  BISHOP_LOOKUP_BY_DIRECTION[square] = bishopMovesByDirection({ rank, file });
  ROOK_LOOKUP_BY_DIRECTION[square] = rookMovesByDirection({ rank, file });
  QUEEN_LOOKUP_BY_DIRECTION[square] = {
    ...bishopMovesByDirection({ rank, file }),
    ...rookMovesByDirection({ rank, file }),
  };

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
