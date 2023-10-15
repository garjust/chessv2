import { Remote, wrap } from 'comlink';
import Timer from '../../lib/timer';
import { Registry, Version } from '../ai';
import { ChessComputer, ChessComputerConstructor } from '../ai/chess-computer';
import { UCIChessComputer } from '../ai/uci-computer';

export const loadPerft = async (): Promise<
  [worker: Worker, cleanup: () => void]
> => {
  const worker = new Worker(new URL('./perft', import.meta.url), {
    type: 'module',
  });
  return [worker, () => worker.terminate()];
};

export const loadComputer = async (
  version: Version,
  ...args: ConstructorParameters<ChessComputerConstructor>
): Promise<[computer: Remote<ChessComputer>, cleanup: () => void]> => {
  const worker = new Worker(new URL('./ai', import.meta.url), {
    type: 'module',
  });
  const registry = wrap<typeof Registry>(worker);
  const instance = await new registry[version](...args);
  return [instance, () => worker.terminate()];
};

export const loadUCIComputer = async (
  responseFunc: (response: string) => void,
  version: Version,
  ...args: ConstructorParameters<ChessComputerConstructor>
): Promise<[uciComputer: Remote<UCIChessComputer>, cleanup: () => void]> => {
  const worker = new Worker(new URL('./uci-ai', import.meta.url), {
    type: 'module',
  });
  const computer = new Registry[version](...args);
  const RemoteUCIChesComputer = wrap<{
    new (
      computer: ChessComputer,
      responseFunc: (response: string) => void,
    ): UCIChessComputer;
  }>(worker);
  const instance = await new RemoteUCIChesComputer(computer, responseFunc);
  return [instance, () => worker.terminate()];
};

export const loadTimer = async (
  label: string,
  timeout: number,
  autoStart = true,
): Promise<[timer: Remote<Timer>, cleanup: () => void]> => {
  if (Worker) {
    const worker = new Worker(new URL('./timer', import.meta.url), {
      type: 'module',
    });
    const RemoteTimer = wrap<typeof Timer>(worker);
    const timer = await new RemoteTimer(timeout, { label, autoStart });
    return [timer, () => worker.terminate()];
  } else {
    const { Worker } = await import('node:worker_threads');
    const { default: nodeEndpoint } = await import(
      'comlink/dist/esm/node-adapter'
    );

    const worker = new Worker(new URL('./timer', import.meta.url));
    const RemoteTimer = wrap<typeof Timer>(nodeEndpoint(worker));
    const timer = await new RemoteTimer(timeout, { label, autoStart });
    return [timer, () => worker.terminate()];
  }
};
