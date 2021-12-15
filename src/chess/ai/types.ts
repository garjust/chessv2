import { Move, Position } from '../types';

export interface ChessComputer {
  nextMove(position: Position): Move;
}
