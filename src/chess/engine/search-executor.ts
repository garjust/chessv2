import { Move, Position } from '../types';
import AlphaBeta from './algorithms/alpha-beta';
import Iterative from './algorithms/iterative';
import Negamax from './algorithms/negamax';
import OrderMoves from './algorithms/order-moves';
import Quiescence from './algorithms/quiescence';
import Random from './algorithms/random';
import { InfoKey } from './workflow/uci-response';

export const Registry = Object.freeze({
  Iterative,
  Quiescence,
  OrderMoves,
  AlphaBeta,
  Negamax,
  Random,
});

export type Version = keyof typeof Registry;
export const LATEST: Version = 'Iterative';

export interface SearchInterface {
  nextMove(position: Position, timeout?: number): Promise<Move>;
}

export class SearchExecutor {
  searchExecutor: InstanceType<(typeof Registry)[Version]>;
  uciInfo: (info: Record<InfoKey, string>) => void;

  constructor(
    version: Version,
    maxDepth: number,
    uciInfo: (info: Record<InfoKey, string>) => void,
  ) {
    this.searchExecutor = new Registry[version](maxDepth);
    this.uciInfo = uciInfo;
  }

  nextMove(position: Position, timeout?: number | undefined): Promise<Move> {
    this.uciInfo({
      hashfull: 'yes def',
    });
    return this.searchExecutor.nextMove(position, timeout);
  }
}
