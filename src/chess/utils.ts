import StringKeyMap from '../lib/string-key-map';
import { Color, Square, SquareLabel } from './types';

export const WHITE_PAWN_STARTING_RANK = 1;
export const BLACK_PAWN_STARTING_RANK = 6;

export const WHITE_QUEENSIDE_ROOK_START_SQUARE: Square = { rank: 0, file: 0 };
export const WHITE_KINGSIDE_ROOK_START_SQUARE: Square = { rank: 0, file: 7 };
export const BLACK_QUEENSIDE_ROOK_START_SQUARE: Square = { rank: 7, file: 0 };
export const BLACK_KINGSIDE_ROOK_START_SQUARE: Square = { rank: 7, file: 7 };

type Nullable<T> = T | undefined | null;

const fileIndexToChar = (index: number): string =>
  String.fromCharCode(index + 97);

export const squareLabel = ({ rank, file }: Square): SquareLabel =>
  `${fileIndexToChar(file)}${rank + 1}` as SquareLabel;

export const labelToSquare = ([file, rank]: string): Square => ({
  file: file.charCodeAt(0) - 97,
  rank: Number(rank) - 1,
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

export const squaresInclude = (squares: Square[], square: Square): boolean =>
  Boolean(squares.find((x) => squareEquals(x, square)));

export class SquareMap<T> extends StringKeyMap<Square, T> {
  constructor() {
    super(squareLabel, labelToSquare);
  }
}

export const isLegalSquare = ({ rank, file }: Square): boolean =>
  rank >= 0 && rank < 8 && file >= 0 && file < 8;

export const flipColor = (color: Color): Color =>
  color === Color.White ? Color.Black : Color.White;
