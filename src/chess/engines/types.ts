import { Move, Piece } from '../types';

export interface Engine<P> {
  applyMove(position: P, move: Move): { position: P; captured?: Piece };
  evaluate(position: P): number;
  generateMoves(position: P): Move[];
}
