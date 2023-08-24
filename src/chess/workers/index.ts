import { Remote, wrap } from 'comlink';
import Timer, { TimerConstructor } from '../../lib/timer';
import { Registry, Version } from '../ai';
import { ChessComputer, ChessComputerConstructor } from '../ai/chess-computer';
import Engine from '../engine';
import { Position } from '../types';

export const loadPerft = async (): Promise<
  [worker: Worker, cleanup: () => void]
> => {
  const worker = new Worker(new URL('./perft', import.meta.url));
  return [worker, () => worker.terminate()];
};

export const loadEngine = async (
  position?: Position,
): Promise<[engine: Remote<Engine>, cleanup: () => void]> => {
  const worker = new Worker(new URL('./engine', import.meta.url));
  const RemoteEngine = wrap<{ new (position?: Position): Engine }>(worker);
  const engine = await new RemoteEngine(position);
  return [engine, () => worker.terminate()];
};

export const loadComputer = async (
  version: Version,
  ...args: ConstructorParameters<ChessComputerConstructor>
): Promise<[computer: Remote<ChessComputer>, cleanup: () => void]> => {
  const worker = new Worker(new URL('./ai', import.meta.url));
  const registry = wrap<typeof Registry>(worker);
  const instance = await new registry[version](...args);
  return [instance, () => worker.terminate()];
};

export const loadTimer = async (
  label: string,
  timeout: number,
  autoStart = true,
): Promise<[timer: Remote<Timer>, cleanup: () => void]> => {
  const worker = new Worker(new URL('./timer', import.meta.url));
  const RemoteTimer = wrap<TimerConstructor>(worker);
  const timer = await new RemoteTimer(timeout, { label, autoStart });

  return [timer, () => worker.terminate()];
};
