import { Remote, wrap } from 'comlink';
import Timer, { TimerConstructor } from '../../lib/timer';
import { ComputerRegistry } from '../ai';
import { AvailableComputerVersions } from '../ai/types';
import Engine from '../engine';
import { Position } from '../types';

export const loadEngine = async (position?: Position) => {
  const RemoteEngine = wrap<{ new (position?: Position): Engine }>(
    new Worker(new URL('./engine', import.meta.url))
  );
  return new RemoteEngine(position);
};

export const loadComputer = async (version: AvailableComputerVersions) => {
  const computerRegistry = wrap<typeof ComputerRegistry>(
    new Worker(new URL('../workers/ai', import.meta.url))
  );
  const instance = await new computerRegistry[version]();
  return instance;
};

export const loadTimer = async (
  label: string,
  timeout: number,
  autoStart = true
): Promise<[timer: Remote<Timer>, cleanup: () => void]> => {
  const worker = new Worker(new URL('../workers/timer', import.meta.url));
  const RemoteTimer = wrap<TimerConstructor>(worker);
  const timer = await new RemoteTimer(timeout, { label, autoStart });

  return [
    timer,
    () => {
      worker.terminate();
    },
  ];
};
