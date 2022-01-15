import { Remote } from 'comlink';
import Timer from '../../lib/timer';
import Engine from '../engine';
import { IHistoryTable, IPVTable } from '../engine/types';
import { Move, MoveWithExtraData, Position } from '../types';
import Diagnotics, { DiagnosticsResult } from './diagnostics';

export interface ISearchState {
  killerMoves: Move[];
  historyTable: IHistoryTable;
  pvTable: IPVTable;
  lastPV: Move[];
  timer: Remote<Timer> | null;
  timeoutReached(): Promise<boolean>;
}

export type SearchConfiguration = {
  pruneNodes: boolean;
  quiescenceSearch: boolean;
  killerMoveHeuristic: boolean;
  historyMoveHeuristic: boolean;
  orderMoves: (
    moves: MoveWithExtraData[],
    killerMove?: Move,
    pvMove?: Move,
    historyTable?: IHistoryTable
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
