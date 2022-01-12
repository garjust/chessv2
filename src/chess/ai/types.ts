import Engine from '../engine';
import { Move, MoveWithExtraData, Position } from '../types';
import Diagnotics, { DiagnosticsResult } from './diagnostics';

export interface ISearchState {
  killerMoves: Move[];
}

export type SearchConfiguration = {
  pruneNodes: boolean;
  quiescenceSearch: boolean;
  orderMoves: (moves: MoveWithExtraData[]) => Move[];
};

export type SearchContext = {
  engine: Engine;
  diagnostics: Diagnotics;
  state: ISearchState;
  configuration: SearchConfiguration;
};

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
