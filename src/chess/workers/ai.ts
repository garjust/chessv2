import { expose } from 'comlink';
import { ComputerRegistry } from '../ai';
import {
  AvailableComputerVersions,
  ChessComputer,
  ChessComputerWorker as IChessComputerWorker,
} from '../ai/types';
import { computeAll } from '../lib/computed';
import { Move, Position } from '../types';

class ChessComputerWorker implements IChessComputerWorker {
  #instance?: ChessComputer;

  load(version: AvailableComputerVersions) {
    switch (version) {
      case 'v1':
        this.#instance = new ComputerRegistry.v1();
        break;
      case 'v2':
        this.#instance = new ComputerRegistry.v2();
        break;
      case 'v3':
        this.#instance = new ComputerRegistry.v3();
        break;
    }
  }

  nextMove(position: Position): Promise<Move> {
    if (!this.#instance) {
      throw Error('no computer is loaded');
    }

    const computedPositionData = computeAll(position);
    return this.#instance.nextMove(position, computedPositionData);
  }
}

expose(ChessComputerWorker);
