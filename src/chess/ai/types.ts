import { Move, Position } from '../types';
import { DiagnosticsResult } from './diagnostics';

export type SearchResult = {
  move: Move;
  scores: { move: Move; score: number }[];
};

export type AvailableComputerVersions = 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6';

export interface ChessComputer {
  nextMove(position: Position): Promise<Move>;
  get diagnosticsResult(): DiagnosticsResult | null;
  toJSON(): string;
}

export interface ChessComputerConstructor {
  new (): ChessComputer;
}
