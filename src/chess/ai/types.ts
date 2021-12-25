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
  nextMove(position: Position): Promise<Move>;
}

export interface ChessComputerWorkerConstructor {
  new (): ChessComputerWorker;
}
