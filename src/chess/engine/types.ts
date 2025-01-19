import { CurrentZobrist } from '../lib/zobrist/types';
import { Move, Position } from '../types';
import { Info } from './workflow/uci-response';

export type InfoReporter = (info: Info) => void;

export type SearchLimit = { nodes?: number; depth?: number; moveTime?: number };

export interface SearchInterface {
  nextMove(
    position: Position,
    movesToSearch: Move[],
    timeout: number,
    limits: SearchLimit,
  ): { move: Move; evaluation: number; pv: Move[] };
  ponderMove(position: Position, move: Move): void;
}

export interface SearchConstructor {
  new (infoReporter: InfoReporter): SearchInterface;
}

/**
 * Object returned from the search function.
 */
export type SearchResult = {
  move: Move;
  pv: Move[];
  bestScore: { move: Move; score: number };
  scores: { move: Move; score: number }[];
};

/**
 *  See documentation here https://www.chessprogramming.org/Node_Types.
 */
export const enum NodeType {
  /**
   * A PV node is a node where the best score alpha < X < beta. Therefore the
   * best move for this node becomes a part of the PV.
   */
  PV,
  /*
   * A cut node is one where beta was exceeded (score X >= beta) and therefore
   * no further nodes were searched in the branch.
   */
  Cut,
  /*
   * An all node is a node in which the best score X < alpha. All moves at this
   * node were searched and a good move was not found.
   */
  All,
}

export type TranspositionTableEntry = {
  nodeType: NodeType;
  /**
   * The depth of search which resulted in this entry. For example when entries
   * are created at the second ply of an N-depth search this value will be
   * equal to N-1. Lower values mean more plys were searched to determine the
   * score.
   *
   * Also known as "distance to horizon node".
   */
  depth: number;
  /**
   * This is the score returned by the search function when this entry was
   * made.
   * - When the node type is CUT this represents a lower-bound for the score
   * of the position and can be re-tested against beta values.
   * - When the node type is PV this represents an exact value for the score.
   * - When the node type is ALL this represents an upper-bound for the score.
   */
  score: number;
  move?: Move;
};

export interface TranspositionTable<T> {
  get: () => T | undefined;
  set: (value: T) => void;
  currentKey: CurrentZobrist;
  stats: () => {
    hits: number;
    miss: number;
    type1: number;
    size: number;
    /**
     * Percentage full the TTable is [0..1]
     */
    percentFull: number;
  };
}
