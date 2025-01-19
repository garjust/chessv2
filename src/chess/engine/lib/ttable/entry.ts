import {
  PIECE_TYPE_MASK,
  SQUARE_BITS,
  SQUARE_MASK,
} from '../../../bit-packing';
import { TranspositionTableEntry } from '../../types';

const DEPTH_SHIFT = 2;
const SCORE_SHIFT = 10;

const NODE_TYPE_MASK = 0b11;
const DEPTH_MASK = 0b111111 << DEPTH_SHIFT;
const SCORE_MASK = ~(DEPTH_MASK | NODE_TYPE_MASK); // 22 bits

const MOVE_TO_SHIFT = SQUARE_BITS;
const MOVE_PROMOTION_SHIFT = SQUARE_BITS + SQUARE_BITS;

const MOVE_FROM_MASK = SQUARE_MASK;
const MOVE_TO_MASK = SQUARE_MASK << MOVE_TO_SHIFT;
const MOVE_PROMOTION_MASK = PIECE_TYPE_MASK << MOVE_PROMOTION_SHIFT;

export const entryMeta = (entry: TranspositionTableEntry): number =>
  entry.nodeType |
  (entry.depth << DEPTH_SHIFT) |
  (entry.score << SCORE_SHIFT);

export const entryMove = (entry: TranspositionTableEntry): number =>
  entry.move
    ? entry.move.from |
      (entry.move.to << MOVE_TO_SHIFT) |
      ((entry.move.promotion ?? 0) << MOVE_PROMOTION_SHIFT)
    : 0;

export const unpackEntry = (
  meta: number,
  move: number,
): TranspositionTableEntry => ({
  nodeType: meta & NODE_TYPE_MASK,
  depth: (meta & DEPTH_MASK) >>> DEPTH_SHIFT,
  score: (meta & SCORE_MASK) >>> SCORE_SHIFT,
  move:
    move !== 0
      ? {
          from: move & MOVE_FROM_MASK,
          to: (move & MOVE_TO_MASK) >>> MOVE_TO_SHIFT,
          promotion: (move & MOVE_PROMOTION_MASK) >>> MOVE_PROMOTION_SHIFT,
        }
      : undefined,
});
