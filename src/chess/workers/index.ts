import { wrap } from 'comlink';
import {
  AvailableComputerVersions,
  ChessComputerWorkerConstructor,
} from '../ai/types';
import Engine from '../engine';
import { Position } from '../types';

export const loadEngine = async (position: Position) => {
  const EngineRemote = wrap<{ new (position: Position): Engine }>(
    new Worker(new URL('./engine', import.meta.url))
  );
  return new EngineRemote(position);
};

export const loadComputer = async (version: AvailableComputerVersions) => {
  const ChessComputerWorkerRemote = wrap<ChessComputerWorkerConstructor>(
    new Worker(new URL('./ai', import.meta.url))
  );
  const instance = await new ChessComputerWorkerRemote();
  await instance.load(version);
  return instance;
};
