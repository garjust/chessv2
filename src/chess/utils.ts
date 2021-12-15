import { Square } from './types';

type Nullable<T> = T | undefined | null;

const fileIndexToChar = (index: number): string =>
  String.fromCharCode(index + 97);

export const squareLabel = ({ rank, file }: Square): string =>
  `${fileIndexToChar(file)}${rank + 1}`;

export const labelToSquare = (label: string): Square => ({
  rank: label.charCodeAt(0) - 97,
  file: Number(label[1]) - 1,
});

export const squareGenerator = function* () {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      yield { rank, file };
    }
  }
};

export const squareEquals = (
  a: Nullable<Square>,
  b: Nullable<Square>
): boolean => Boolean(a && b && a.file === b.file && a.rank === b.rank);

export const squaresInclude = (moves: Square[], move: Square): boolean =>
  Boolean(moves.find((maybeMove) => squareEquals(maybeMove, move)));
