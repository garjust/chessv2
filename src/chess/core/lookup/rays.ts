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

const ray = (from: Square, direction: DirectionUnit) => {
  const squares: Square[] = [];
  for (const square of rayGenerator(rankFileSquare(from), direction)) {
    squares.push(rankFileToSquare(square));
  }
  return squares;
};

export type BishopRays = {
  [DirectionUnit.UpLeft]: Square[];
  [DirectionUnit.UpRight]: Square[];
  [DirectionUnit.DownLeft]: Square[];
  [DirectionUnit.DownRight]: Square[];
};

export type RookRays = {
  [DirectionUnit.Up]: Square[];
  [DirectionUnit.Down]: Square[];
  [DirectionUnit.Left]: Square[];
  [DirectionUnit.Right]: Square[];
};

export const bishopRays = (from: Square): BishopRays =>
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

export const rookRays = (from: Square): RookRays =>
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
