import { Move, Position } from '../types';
import { AlphaBeta, AlphaBetaIterative } from './algorithms';
import { DEFAULT_CONFIGURATION } from './lib/config';
import { SearchInterface, InfoReporter, SearchLimit } from './types';

export const Registry = {
  alphaBeta: AlphaBeta,
  iterative: AlphaBetaIterative,
} as const;

export type Version = keyof typeof Registry;
export const LATEST: Version = 'iterative';

/**
 * Wraps an actual search executor version, effectively proxying function
 * calls to the version. The wrapper exists to better handle instantiating
 * a search executor on a Worker using comlnk.
 */
export class SearchExecutor {
  search: SearchInterface;

  constructor(
    version: Version,
    infoReporter: InfoReporter,
    options: Partial<typeof DEFAULT_CONFIGURATION> = {},
  ) {
    this.search = new Registry[version](infoReporter, options);
  }

  nextMove(
    position: Position,
    movesToSearch: Move[],
    timeout: number,
    limits: SearchLimit,
  ): Promise<Move> {
    return this.search.nextMove(position, movesToSearch, timeout, limits);
  }

  ponderMove(position: Position, move: Move) {
    this.search.ponderMove(position, move);
  }
}
