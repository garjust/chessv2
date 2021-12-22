import { ComputedPositionData, Move, Position } from '../types';

export interface ChessComputer {
  nextMove(
    position: Position,
    computedPositionData: ComputedPositionData
  ): Promise<Move>;
}
