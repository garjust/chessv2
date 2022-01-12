import { Remote } from 'comlink';
import Timer from '../../lib/timer';
import Engine from '../engine';
import { Move, MoveWithExtraData, Position } from '../types';
import Diagnotics, { DiagnosticsResult } from './diagnostics';

export interface ISearchState {
  killerMoves: Move[];
  timer: Remote<Timer> | null;
  timeoutReached(): Promise<boolean>;
}

export type SearchConfiguration = {
  pruneNodes: boolean;
  quiescenceSearch: boolean;
  killerMoveHeuristic: boolean;
  orderMoves: (
    moves: MoveWithExtraData[],
    killerMove?: Move
  ) => MoveWithExtraData[];
};

export interface ISearchContext {
  engine: Engine;
  diagnostics: Diagnotics;
  state: ISearchState;
  configuration: SearchConfiguration;
}

export type SearchResult = {
  move: Move;
  scores: { move: Move; score: number }[];
};

export type AvailableComputerVersions =
  | 'v1'
  | 'v2'
  | 'v3'
  | 'v4'
  | 'v5'
  | 'v6'
  | 'v7';

export interface ChessComputer {
  nextMove(position: Position, timeout?: number): Promise<Move>;
  get diagnosticsResult(): DiagnosticsResult | null;
  toJSON(): string;
}

export interface ChessComputerConstructor {
  new (): ChessComputer;
}
