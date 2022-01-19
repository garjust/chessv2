import Random from './algorithms/random';
import Negamax from './algorithms/negamax';
import AlphaBeta from './algorithms/alpha-beta';
import MoveOrdering from './algorithms/move-ordering';
import Quiescence from './algorithms/quiescence';
import Iterative from './algorithms/iterative';

export const Registry = Object.freeze({
  AlphaBeta,
  Iterative,
  MoveOrdering,
  Negamax,
  Quiescence,
  Random,
});

export type Version = keyof typeof Registry;

export const LATEST: Version = 'Iterative';
