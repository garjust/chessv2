import {
  AttackObject,
  Color,
  Position as ExternalPosition,
  Square,
} from '../types';

export type KingSquares = {
  [Color.White]?: Square;
  [Color.Black]?: Square;
};

export type Pin = {
  pinned: Square;
  attacker: Square;
  legalMoveSquares: Square[];
};

export type Pins = {
  [Color.White]: Map<Square, Pin>;
  [Color.Black]: Map<Square, Pin>;
};

export type Position = ExternalPosition & {
  kings: KingSquares;
  pinsToKing: Pins;

  attacked: {
    [Color.White]: Square[];
    [Color.Black]: Square[];
  };
};
