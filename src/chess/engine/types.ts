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

export interface IAttackMap {
  isAttacked(square: Square): boolean;
  attackEntries(): IterableIterator<[Square, number]>;
  controlForPiece(square: Square): SquareControlObject[];
  addAttacks(square: Square, squares: SquareControlObject[]): void;
  removeAttacks(square: Square): void;
  startChangeset(): void;
  undoChangeset(): void;
}

export type AttackedSquares = {
  [Color.White]: IAttackMap;
  [Color.Black]: IAttackMap;
};

export type Position = ExternalPosition & {
  kings: KingSquares;
  attackedSquares: AttackedSquares;
  pinsToKing: KingPins;
  checks: KingChecks;
};
