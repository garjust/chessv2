import { ComputedPositionData, Move, Position } from '../types';

export type AvailableComputerVersions = 'v1' | 'v2' | 'v3';

export interface ChessComputer {
  nextMove(
    position: Position,
    computedPositionData: ComputedPositionData
  ): Promise<Move>;
}

export interface ChessComputerWorker {
  load(version: AvailableComputerVersions): void;
  // The chess computer worker provides a FEN string interface to simplify
  // copying of the position into the Worker.
  nextMove(fen: string): Promise<Move>;
}

export interface ChessComputerWorkerConstructor {
  new (): ChessComputerWorker;
}
