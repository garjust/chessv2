import { Square } from '../../types';
import { fileIndexForSquare, rankIndexForSquare } from '../../utils';

/**
 * Define a less error prone square representation for pre-computing lookup
 * data. This representation is slower (object vs primitive) but enables easy
 * protection against illegal moves wrapping the board.
 */
type RankFileSquare = { rank: number; file: number };

export const rankFileToSquare = ({ rank, file }: RankFileSquare): Square =>
  rank * 8 + file;

export const rankFileSquare = (square: Square): RankFileSquare => ({
  rank: rankIndexForSquare(square),
  file: fileIndexForSquare(square),
});

export const isLegalSquare = (square: RankFileSquare): boolean =>
  square.rank >= 0 && square.rank < 8 && square.file >= 0 && square.file < 8;

export const up = ({ rank, file }: RankFileSquare, n = 1): RankFileSquare => ({
  rank: rank + n,
  file: file,
});
export const down = (
  { rank, file }: RankFileSquare,
  n = 1,
): RankFileSquare => ({
  rank: rank - n,
  file: file,
});
export const left = (
  { rank, file }: RankFileSquare,
  n = 1,
): RankFileSquare => ({
  rank: rank,
  file: file - n,
});
export const right = (
  { rank, file }: RankFileSquare,
  n = 1,
): RankFileSquare => ({
  rank: rank,
  file: file + n,
});
export const upLeft = (square: RankFileSquare, n = 1): RankFileSquare =>
  up(left(square, n), n);
export const upRight = (square: RankFileSquare, n = 1): RankFileSquare =>
  up(right(square, n), n);
export const downLeft = (square: RankFileSquare, n = 1): RankFileSquare =>
  down(left(square, n), n);
export const downRight = (square: RankFileSquare, n = 1): RankFileSquare =>
  down(right(square, n), n);
