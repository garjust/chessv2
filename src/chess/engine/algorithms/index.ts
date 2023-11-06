import Random from './random';
import Negamax from './negamax';
import AlphaBeta from './alpha-beta';
import Quiescence from './quiescence';
import OrderMoves from './order-moves';
import Iterative from './iterative';

export type SearchExecutorVersion =
  | 'random'
  | 'negamax'
  | 'alphaBeta'
  | 'quiescence'
  | 'orderMoves'
  | 'iterative';

export { Random };
export { Negamax };
export { AlphaBeta };
export { Quiescence };
export { OrderMoves };
export { Iterative };
