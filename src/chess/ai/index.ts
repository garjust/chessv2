import { AvailableComputerVersions, ChessComputerConstructor } from './types';
import Random from './random';
import Negamax from './negamax';
import AlphaBeta from './alpha-beta';
import MoveOrdering from './move-ordering';
import Quiescence from './quiescence';
import Iterative from './iterative';

export const LATEST = 'v7';

export const ComputerRegistry: Record<
  AvailableComputerVersions,
  ChessComputerConstructor
> = Object.freeze({
  v7: Iterative,
  v6: Quiescence,
  v5: MoveOrdering,
  v4: AlphaBeta,
  v3: Negamax,
  v2: Random,
});
