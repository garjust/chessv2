/**
 * Configure the search algorithm. The default values represent a plain negamax
 * search.
 */
export const DEFAULT_CONFIGURATION = {
  /** Enable pruning of branches in the search tree. */
  pruneNodes: false,
  /** Enable ordering of moves in the search. */
  moveOrdering: false,
  /** Various heuristics used for move ordering requiring some stored state. */
  moveOrderingHeuristics: {
    /**
     * The killer move is the last quiet move to cause a beta-cutoff at the
     * current depth.
     * */
    killerMove: false,
    /**
     * The history table is a more general form of the killer move. All moves
     * which cause a beta-cutoff are incremented in the table. Quiet moves can
     * be ordered by the value of the move in the history table.
     */
    historyTable: false,
    /**
     * The PV move is the move for an existing PV from a previous search at
     * the current depth. This is a good move to search first.
     */
    pvMove: false,
    /**
     * The hash move is the move returned by a hit in the TTable. This move
     * is often a PV move or a move which caused a beta-cutoff.
     */
    hashMove: false,
  },
  quiescenceSearch: false,
  pruneFromTTable: false,
  ttableSizeMb: 128,
  useTTForPV: false,
};
