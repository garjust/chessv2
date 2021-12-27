import { Move, Piece } from '../types';
import { MutablePosition } from './types';

export const applyMove = (
  position: MutablePosition,
  move: Move
): { position: MutablePosition; captured?: Piece | undefined } => {
  return { position };
};
