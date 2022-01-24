import {
  AttackObject,
  Color,
  Pin,
  Position as ExternalPosition,
  Square,
  SquareControlObject,
} from '../types';
import AttackMap from './attack-map';

// Use two 32bit numbers for the zobrist key maintained by the engine.
export type ZobristKey = [number, number];

export type KingSquares = {
  [Color.White]?: Square;
  [Color.Black]?: Square;
};

export type KingPins = {
  [Color.White]: Map<Square, Pin>;
  [Color.Black]: Map<Square, Pin>;
};

export type KingChecks = {
  [Color.White]: SquareControlObject[];
  [Color.Black]: SquareControlObject[];
};

export type AttackedSquares = {
  [Color.White]: AttackMap;
  [Color.Black]: AttackMap;
};

export type Position = ExternalPosition & {
  kings: KingSquares;
  attackedSquares: AttackedSquares;
  pinsToKing: KingPins;
};
