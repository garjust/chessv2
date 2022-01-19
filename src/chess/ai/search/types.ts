import { IHistoryTable } from '../../engine/types';
import { Move, MoveWithExtraData } from '../../types';

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
  move?: Move;
};

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

export type SearchResult = {
  move: Move;
  scores: { move: Move; score: number }[];
};
