import {
  AttackObject,
  Color,
  Pin,
  Position as ExternalPosition,
  Square,
  SquareControlObject,
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

// Maps that store the number of pieces attacking a particular square.
export type AttackedSquares = {
  [Color.White]: Map<Square, number>;
  [Color.Black]: Map<Square, number>;
};

// Maps that store all squares controlled by the piece residing in
// the key square.
export type PieceAttacks = {
  [Color.White]: Map<Square, SquareControlObject[]>;
  [Color.Black]: Map<Square, SquareControlObject[]>;
};

export type Position = ExternalPosition & {
  kings: KingSquares;
  pieceAttacks: PieceAttacks;
  attackedSquares: AttackedSquares;
  pinsToKing: KingPins;
  checks: KingChecks;
};
