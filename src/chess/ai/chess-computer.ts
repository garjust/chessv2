import { Move, Position } from '../types';
import { DiagnosticsResult } from './search/diagnostics';

export interface ChessComputer {
  nextMove(position: Position, timeout?: number): Promise<Move>;
  get diagnosticsResult(): DiagnosticsResult | null;
  get label(): string;
}

export interface ChessComputerConstructor {
  new (): ChessComputer;
}
