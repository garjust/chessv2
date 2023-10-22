import Random from './algorithms/random';
import Negamax from './algorithms/negamax';
import AlphaBeta from './algorithms/alpha-beta';
import OrderMoves from './algorithms/order-moves';
import Quiescence from './algorithms/quiescence';
import Iterative from './algorithms/iterative';

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
