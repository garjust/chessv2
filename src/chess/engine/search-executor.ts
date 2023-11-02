import { Move, Position } from '../types';
import AlphaBeta from './algorithms/alpha-beta';
import Iterative from './algorithms/iterative';
import Negamax from './algorithms/negamax';
import OrderMoves from './algorithms/order-moves';
import Quiescence from './algorithms/quiescence';
import Random from './algorithms/random';
import { DiagnosticsResult } from './lib/diagnostics';

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

export interface SearchExecutorI {
  nextMove(position: Position, timeout?: number): Promise<Move>;
  get diagnosticsResult(): DiagnosticsResult | null;
  get label(): string;
}

export class SearchExecutor implements SearchExecutorI {
  searchExecutor: InstanceType<(typeof Registry)[Version]>;

  constructor(version: Version, maxDepth: number) {
    this.searchExecutor = new Registry[version](maxDepth);
  }

  nextMove(position: Position, timeout?: number | undefined): Promise<Move> {
    return this.searchExecutor.nextMove(position, timeout);
  }

  get diagnosticsResult(): DiagnosticsResult | null {
    return this.searchExecutor.diagnosticsResult;
  }

  get label(): string {
    return this.searchExecutor.label;
  }
}
