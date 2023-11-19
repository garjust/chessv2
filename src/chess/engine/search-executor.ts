import { Move, Position } from '../types';
import {
  AlphaBeta,
  Iterative,
  Negamax,
  OrderMoves,
  Quiescence,
  Random,
  SearchExecutorVersion,
} from './algorithms';
import {
  InfoReporter,
  SearchConstructor,
  SearchInterface,
  SearchLimit,
} from './search-interface';

export const Registry: Readonly<
  Record<SearchExecutorVersion, SearchConstructor>
> = Object.freeze({
  iterative: Iterative,
  quiescence: Quiescence,
  orderMoves: OrderMoves,
  alphaBeta: AlphaBeta,
  negamax: Negamax,
  random: Random,
});

export type Version = keyof typeof Registry;
export const LATEST: Version = 'iterative';

/**
 * Wraps an actual search executor version, effectively proxying function
 * calls to the version. The wrapper exists to better handle instantiating
 * a search executor on a Worker using comlnk.
 */
export class SearchExecutor {
  search: SearchInterface;

  constructor(version: Version, infoReporter: InfoReporter) {
    this.search = new Registry[version](infoReporter);
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
