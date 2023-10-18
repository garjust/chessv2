import { Remote, wrap, proxy } from 'comlink';
import Timer from '../../lib/timer';
import { SearchEngine } from '../ai/search-engine';
import nodeEndpoint from 'comlink/dist/esm/node-adapter';
import Logger from '../../lib/logger';

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
  const logger = new Logger('worker-init');

  for (const arg of args) {
    if (typeof arg == 'function') {
      proxy(arg);
    }
  }

  let RemoteClass: Remote<typeof SearchEngine>;
  let cleanup: () => void;

  if (Worker) {
    logger.debug('loading search-engine web worker');
    const worker = new Worker(new URL('./search-engine', import.meta.url), {
      type: 'module',
    });
    worker.addEventListener('error', (event) => {
      logger.error('search-engine web worker crashed', event.message, event);
    });
    RemoteClass = wrap<typeof SearchEngine>(worker);
    cleanup = () => worker.terminate();
  } else {
    logger.debug('loading search engine thread');
    const { Worker } = await import('node:worker_threads');
    const worker = new Worker(new URL('./search-engine', import.meta.url));
    RemoteClass = wrap<typeof SearchEngine>(nodeEndpoint(worker));
    cleanup = () => worker.terminate();
  }

  logger.debug('creating remote SearchEngine instance');
  const instance = await new RemoteClass(...args);
  logger.debug('created remote SearchEngine instance');
  return [instance, cleanup];
};

export const loadTimer = async (
  ...args: ConstructorParameters<typeof Timer>
): Promise<[timer: Remote<Timer>, cleanup: () => void]> => {
  const logger = new Logger('worker-init');

  let RemoteClass: Remote<typeof Timer>;
  let cleanup: () => void;

  if (Worker) {
    logger.debug('loading timer web worker');
    const worker = new Worker(new URL('./timer', import.meta.url), {
      type: 'module',
    });
    worker.addEventListener('error', (event) => {
      logger.error('timer web worker crashed', event.message, event);
    });
    RemoteClass = wrap<typeof Timer>(worker);
    cleanup = () => worker.terminate();
  } else {
    const { Worker } = await import('node:worker_threads');
    const worker = new Worker(new URL('./timer', import.meta.url));
    RemoteClass = wrap<typeof Timer>(nodeEndpoint(worker));
    cleanup = () => worker.terminate();
  }

  logger.debug('creating remote Timer instance');
  const instance = await new RemoteClass(...args);
  return [instance, cleanup];
};
