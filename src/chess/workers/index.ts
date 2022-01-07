import { wrap } from 'comlink';
import { ComputerRegistry } from '../ai';
import { AvailableComputerVersions } from '../ai/types';
import Engine from '../engine';
import { Position } from '../types';

export const loadEngine = async (position?: Position) => {
  const EngineRemote = wrap<{ new (position?: Position): Engine }>(
    new Worker(new URL('./engine', import.meta.url))
  );
  return new EngineRemote(position);
};

export const loadComputer = async (version: AvailableComputerVersions) => {
  const computerRegistry = wrap<typeof ComputerRegistry>(
    new Worker(new URL('../workers/ai', import.meta.url))
  );
  const instance = await new computerRegistry[version]();
  return instance;
};
