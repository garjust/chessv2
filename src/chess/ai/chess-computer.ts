import { Action } from '../lib/uci';
import { Move, Position } from '../types';
import { DiagnosticsResult } from './search/diagnostics';

export interface ChessComputer {
  nextMove(position: Position, timeout?: number): Promise<Move>;
  get diagnosticsResult(): DiagnosticsResult | null;
  get label(): string;
}

export interface UCIChessComputerI {
  send(uciMessage: string): void;
  get diagnosticsResult(): DiagnosticsResult | null;
  get label(): string;
}
