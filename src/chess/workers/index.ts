import { Remote, wrap } from 'comlink';
import Timer from '../../lib/timer';
import { Registry, Version } from '../ai';
import { ChessComputer, ChessComputerConstructor } from '../ai/chess-computer';
import { UCIChessComputer } from '../ai/uci-computer';
import nodeEndpoint from 'comlink/dist/esm/node-adapter';

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
  let RemoteClass: Remote<typeof Registry>;
  let cleanup: () => void;

  if (Worker) {
    const worker = new Worker(new URL('./ai', import.meta.url), {
      type: 'module',
    });
    RemoteClass = wrap<typeof Registry>(worker);
    cleanup = () => worker.terminate();
  } else {
    const { Worker } = await import('node:worker_threads');
    const worker = new Worker(new URL('./ai', import.meta.url));
    RemoteClass = wrap<typeof Registry>(nodeEndpoint(worker));
    cleanup = () => worker.terminate();
  }

  const instance = await new RemoteClass[version](...args);
  return [instance, cleanup];
};

export const loadUCIComputer = async (
  ...args: ConstructorParameters<typeof UCIChessComputer>
): Promise<[uciComputer: Remote<UCIChessComputer>, cleanup: () => void]> => {
  let RemoteClass: Remote<typeof UCIChessComputer>;
  let cleanup: () => void;

  if (Worker) {
    const worker = new Worker(new URL('./uci-ai', import.meta.url), {
      type: 'module',
    });
    RemoteClass = wrap<typeof UCIChessComputer>(worker);
    cleanup = () => worker.terminate();
  } else {
    const { Worker } = await import('node:worker_threads');
    const worker = new Worker(new URL('./uci-ai', import.meta.url));
    RemoteClass = wrap<typeof UCIChessComputer>(nodeEndpoint(worker));
    cleanup = () => worker.terminate();
  }

  const instance = await new RemoteClass(...args);
  return [instance, cleanup];
};

export const loadTimer = async (
  ...args: ConstructorParameters<typeof Timer>
): Promise<[timer: Remote<Timer>, cleanup: () => void]> => {
  let RemoteClass: Remote<typeof Timer>;
  let cleanup: () => void;

  if (Worker) {
    const worker = new Worker(new URL('./timer', import.meta.url), {
      type: 'module',
    });
    RemoteClass = wrap<typeof Timer>(worker);
    cleanup = () => worker.terminate();
  } else {
    const { Worker } = await import('node:worker_threads');
    const worker = new Worker(new URL('./timer', import.meta.url));
    RemoteClass = wrap<typeof Timer>(nodeEndpoint(worker));
    cleanup = () => worker.terminate();
  }

  const instance = await new RemoteClass(...args);
  return [instance, cleanup];
};
