import { Remote, wrap } from 'comlink';
import Timer from '../../lib/timer';
import { SearchEngine } from '../ai/search-engine';
import nodeEndpoint from 'comlink/dist/esm/node-adapter';

export const loadPerft = async (): Promise<
  [worker: Worker, cleanup: () => void]
> => {
  const worker = new Worker(new URL('./perft', import.meta.url), {
    type: 'module',
  });
  return [worker, () => worker.terminate()];
};

export const loadSearchEngine = async (
  ...args: ConstructorParameters<typeof SearchEngine>
): Promise<[uciComputer: Remote<SearchEngine>, cleanup: () => void]> => {
  let RemoteClass: Remote<typeof SearchEngine>;
  let cleanup: () => void;

  if (Worker) {
    const worker = new Worker(new URL('./search-engine', import.meta.url), {
      type: 'module',
    });
    RemoteClass = wrap<typeof SearchEngine>(worker);
    cleanup = () => worker.terminate();
  } else {
    const { Worker } = await import('node:worker_threads');
    const worker = new Worker(new URL('./search-engine', import.meta.url));
    RemoteClass = wrap<typeof SearchEngine>(nodeEndpoint(worker));
    cleanup = () => worker.terminate();
  }

  const instance = await new RemoteClass(...args);
  return [instance, cleanup];
};

export const WHATDO = async (
  ...args: ConstructorParameters<typeof SearchEngine>
): Promise<[uciComputer: Remote<SearchEngine>, cleanup: () => void]> => {
  let RemoteClass: Remote<typeof SearchEngine>;
  let cleanup: () => void;

  if (Worker) {
    const worker = new Worker(new URL('./search-engine', import.meta.url), {
      type: 'module',
    });
    RemoteClass = wrap<typeof SearchEngine>(worker);
    cleanup = () => worker.terminate();
  } else {
    const { Worker } = await import('node:worker_threads');
    const worker = new Worker(new URL('./search-engine', import.meta.url));
    RemoteClass = wrap<typeof SearchEngine>(nodeEndpoint(worker));
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
