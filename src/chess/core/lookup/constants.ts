import { ROOK_STARTING_SQUARES } from '../../castling';
import { Color } from '../../types';
import { buildMove } from '../move-utils';

/**
 * Set of pre-created moves a rook makes when participating
 * in a castling.
 */
export const CASTLING_ROOK_MOVES = {
  [Color.White]: {
    kingside: buildMove(ROOK_STARTING_SQUARES[Color.White].kingside, 5),
    queenside: buildMove(ROOK_STARTING_SQUARES[Color.White].queenside, 3),
  },
  [Color.Black]: {
    kingside: buildMove(ROOK_STARTING_SQUARES[Color.Black].kingside, 61),
    queenside: buildMove(ROOK_STARTING_SQUARES[Color.Black].queenside, 59),
  },
} as const;
