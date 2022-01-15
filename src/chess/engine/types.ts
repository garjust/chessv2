import {
  AttackObject,
  Color,
  Move,
  Pin,
  Position as ExternalPosition,
  Square,
  SquareControlObject,
} from '../types';

export interface IHistoryTable {
  increment(move: Move, depth: number): void;
  get(move: Move): number;
}

export interface IPrincipalVariationTable {
  set(searchDepth: number, depth: number, move: Move): void;
  get(searchDepth: number, depth: number): Move;
  pv: Move[];
}

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
