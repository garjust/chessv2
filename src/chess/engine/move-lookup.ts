import { RankFile, Square } from '../types';
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

for (const { rank, file } of squareGenerator()) {
  const square = rankFileToSquare({ rank, file });
  BISHOP_LOOKUP[square] = bishopMoves({ rank, file });
  KING_LOOKUP[square] = kingMoves({ rank, file });
  KNIGHT_LOOKUP[square] = knightMoves({ rank, file });
  ROOK_LOOKUP[square] = rookMoves({ rank, file });
}

export { BISHOP_LOOKUP, KING_LOOKUP, KNIGHT_LOOKUP, ROOK_LOOKUP };
