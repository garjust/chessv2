import {
  AttackObject,
  Color,
  Pin,
  Position as ExternalPosition,
  Square,
} from '../types';

export type KingSquares = {
  [Color.White]?: Square;
  [Color.Black]?: Square;
};

export type KingPins = {
  [Color.White]: Map<Square, Pin>;
  [Color.Black]: Map<Square, Pin>;
};

export type KingChecks = {
  [Color.White]: AttackObject[];
  [Color.Black]: AttackObject[];
};

export type Position = ExternalPosition & {
  kings: KingSquares;
  pinsToKing: KingPins;
  checks: KingChecks;

  attacked: {
    [Color.White]: Square[];
    [Color.Black]: Square[];
  };
};
