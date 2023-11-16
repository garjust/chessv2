import { DirectionUnit, Square } from '../../types';
import {
  down,
  downLeft,
  downRight,
  isLegalSquare,
  left,
  rankFileSquare,
  rankFileToSquare,
  right,
  up,
  upLeft,
  upRight,
} from './movement';

const MOVEMENT_FN_FOR_DIRECTION = {
  [DirectionUnit.UpLeft]: upLeft,
  [DirectionUnit.UpRight]: upRight,
  [DirectionUnit.DownLeft]: downLeft,
  [DirectionUnit.DownRight]: downRight,
  [DirectionUnit.Up]: up,
  [DirectionUnit.Right]: right,
  [DirectionUnit.Left]: left,
  [DirectionUnit.Down]: down,
};

const rayGenerator = function* (
  square: { rank: number; file: number },
  direction: DirectionUnit,
) {
  square = MOVEMENT_FN_FOR_DIRECTION[direction](square);
  while (isLegalSquare(square)) {
    yield square;
    square = MOVEMENT_FN_FOR_DIRECTION[direction](square);
  }
};

export const ray = (from: Square, direction: DirectionUnit) => {
  const squares: Square[] = [];
  for (const square of rayGenerator(rankFileSquare(from), direction)) {
    squares.push(rankFileToSquare(square));
  }
  return squares;
};
