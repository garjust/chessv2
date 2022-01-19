import { Remote } from 'comlink';
import Timer from '../../lib/timer';
import Engine from '../engine';
import { IHistoryTable, IPVTable, ITranspositionTable } from '../engine/types';
import { Move, MoveWithExtraData, Position } from '../types';
import Diagnotics, { DiagnosticsResult } from './search/diagnostics';

// See documentation here https://www.chessprogramming.org/Node_Types.
export enum NodeType {
  // A PV node is a node where the best score alpha < X < beta. Therefore the
  // best move for this node becomes a part of the PV.
  PV = 'PV',
  // A cut node is one where beta was exceeded (score X >= beta) and therefore
  // no further nodes were searched in the branch.
  Cut = 'CUT',
  // An all node is a node in which the best score X < alpha. All moves at this
  // were searched and a good move was not found.
  All = 'ALL',
}

export type TranspositionTableEntry = {
  nodeType: NodeType;
  depth: number;
  score: number;
  fen: string; // TODO: remove eventually, just here for checking the hash function
  move?: Move;
};

export interface ISearchState {
  killerMoves: Move[];
  historyTable: IHistoryTable;
  pvTable: IPVTable;
  tTable: ITranspositionTable<TranspositionTableEntry>;
  moveExecutionOptions: {
    table?: ITranspositionTable<TranspositionTableEntry>;
  };
  timer: Remote<Timer> | null;
  timeoutReached(): Promise<boolean>;
}

export type SearchConfiguration = {
  pruneNodes: boolean;
  quiescenceSearch: boolean;
  killerMoveHeuristic: boolean;
  historyMoveHeuristic: boolean;
  transpositionTable: boolean;
  orderMoves: (
    moves: MoveWithExtraData[],
    tableMove?: Move,
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

export interface ChessComputer {
  nextMove(position: Position, timeout?: number): Promise<Move>;
  get diagnosticsResult(): DiagnosticsResult | null;
  get label(): string;
}

export interface ChessComputerConstructor {
  new (): ChessComputer;
}
