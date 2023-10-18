import { RankFile } from '../types';

export const isLegalSquare = ({ rank, file }: RankFile): boolean =>
  rank >= 0 && rank < 8 && file >= 0 && file < 8;

export const up = (square: RankFile, n = 1): RankFile => ({
  rank: square.rank + n,
  file: square.file,
});
export const down = (square: RankFile, n = 1): RankFile => ({
  rank: square.rank - n,
  file: square.file,
});
export const left = (square: RankFile, n = 1): RankFile => ({
  rank: square.rank,
  file: square.file - n,
});
export const right = (square: RankFile, n = 1): RankFile => ({
  rank: square.rank,
  file: square.file + n,
});
export const upLeft = (square: RankFile, n = 1): RankFile =>
  up(left(square, n), n);
export const upRight = (square: RankFile, n = 1): RankFile =>
  up(right(square, n), n);
export const downLeft = (square: RankFile, n = 1): RankFile =>
  down(left(square, n), n);
export const downRight = (square: RankFile, n = 1): RankFile =>
  down(right(square, n), n);

const rayGenerator = function* (
  square: RankFile,
  scanFn: (square: RankFile) => RankFile,
) {
  while (isLegalSquare(square)) {
    yield square;
    square = scanFn(square);
  }
};

export const ray = (from: RankFile, scanFn: (square: RankFile) => RankFile) => {
  const squares: RankFile[] = [];
  for (const square of rayGenerator(scanFn(from), scanFn)) {
    squares.push(square);
  }
  return squares;
};
