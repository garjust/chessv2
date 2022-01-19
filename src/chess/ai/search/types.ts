import { Move } from '../../types';

// Object returned from the search function
export type SearchResult = {
  move: Move;
  pv: Move[];
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
  // Enable pruning of branches in the search tree.
  readonly pruneNodes: boolean;
  // Enable ordering of moves in the search.
  readonly moveOrdering: boolean;
  // Various heuristics used for move ordering requiring some stored state.
  readonly moveOrderingHeuristics: {
    // The killer move is the last quiet move to cause a beta-cutoff at the
    // current depth.
    readonly killerMove: boolean;
    // The history table is a more general form of the killer move. All moves
    // which cause a beta-cutoff are incremented in the table. Quiet moves can
    // be ordered by the value of the move in the history table.
    readonly historyTable: boolean;
    // The PV move is the move for an existing PV from a previous search at
    // the current depth. This is a good move to search first.
    readonly pvMove: boolean;
    // The hash move is the move returned by a hit in the TTable. This move
    // is often a PV move or a move which caused a beta-cutoff.
    readonly hashMove: boolean;
  };
  readonly quiescenceSearch: boolean;
};
