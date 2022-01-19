import { Move } from '../../types';

// Object returned from the search function
export type SearchResult = {
  move: Move;
  scores: { move: Move; score: number }[];
};

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
  // The depth of search which resulted in this entry. For example when entries
  // are created at the second ply of an N-depth search this value will be
  // equal to N-1. Higher values mean more plys were searched to determine the
  // score.
  depth: number;
  // This is the score returned by the search function when this entry was
  // made.
  // - When the node type is CUT this represents a lower-bound for the score
  // of the position and can be re-tested against beta values.
  // - When the node type is PV this represents an exact value for the score.
  // - When the node type is ALL this represents an upper-bound for the score.
  score: number;
  move?: Move;
};

export type SearchConfiguration = {
  pruneNodes: boolean;
  moveOrdering: boolean;
  moveOrderingHeuristics: {
    killerMove: boolean;
    historyMove: boolean;
    pvMove: boolean;
    hashMove: boolean;
  };
  quiescenceSearch: boolean;
};
