import { Move, Position } from '../types';

export type AvailableComputerVersions = 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6';

export interface ChessComputer {
  nextMove(position: Position): Promise<Move>;
  toJSON(): string;
}

export interface ChessComputerConstructor {
  new (): ChessComputer;
}
