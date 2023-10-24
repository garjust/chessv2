import { Remote, wrap, proxy } from 'comlink';
import Timer from '../../lib/timer';
import { Engine } from '../engine/engine';
import nodeEndpoint from 'comlink/dist/esm/node-adapter';
import Logger from '../../lib/logger';
import { SearchExecutor } from '../engine/search-executor';

export const loadPerft = async (): Promise<
  [worker: Worker, cleanup: () => void]
> => {
  const worker = new Worker(new URL('./perft', import.meta.url), {
    type: 'module',
  });
  return [worker, () => worker.terminate()];
};

export const loadEngine = async (
  ...args: ConstructorParameters<typeof Engine>
): Promise<[engine: Remote<Engine>, cleanup: () => void]> => {
  const logger = new Logger('worker-init');

  for (const arg of args) {
    if (typeof arg == 'function') {
      proxy(arg);
    }
  }

  let RemoteClass: Remote<typeof Engine>;
  let cleanup: () => void;

  if (typeof Worker !== 'undefined') {
    logger.debug('loading engine web worker');
    const worker = new Worker(new URL('./engine', import.meta.url), {
      type: 'module',
    });
    worker.addEventListener('error', (event) => {
      logger.error('engine web worker crashed', event.message, event);
    });
    RemoteClass = wrap<typeof Engine>(worker);
    cleanup = () => worker.terminate();
  } else {
    logger.debug('loading search engine thread');
    const { Worker } = await import('node:worker_threads');
    const worker = new Worker(new URL('./engine', import.meta.url));
    RemoteClass = wrap<typeof Engine>(nodeEndpoint(worker));
    cleanup = () => worker.terminate();
  }

  logger.debug('creating remote Engine instance');
  const instance = await new RemoteClass(...args);
  logger.debug('created remote Engine instance');
  return [instance, cleanup];
};

export const loadSearchExecutor = async (
  ...args: ConstructorParameters<typeof SearchExecutor>
): Promise<[executor: Remote<SearchExecutor>, cleanup: () => void]> => {
  const logger = new Logger('worker-init');

  let RemoteClass: Remote<typeof SearchExecutor>;
  let cleanup: () => void;

  if (typeof Worker !== 'undefined') {
    logger.debug('loading search-executor web worker');
    const worker = new Worker(new URL('./search-executor', import.meta.url), {
      type: 'module',
    });
    worker.addEventListener('error', (event) => {
      logger.error('search-executor web worker crashed', event.message, event);
    });
    RemoteClass = wrap<typeof SearchExecutor>(worker);
    cleanup = () => worker.terminate();
  } else {
    logger.debug('loading search-executor thread');
    const { Worker } = await import('node:worker_threads');
    const worker = new Worker(new URL('./search-executor', import.meta.url));
    RemoteClass = wrap<typeof SearchExecutor>(nodeEndpoint(worker));
    cleanup = () => worker.terminate();
  }

  logger.debug('creating remote SearchExecutor instance');
  const instance = await new RemoteClass(...args);
  logger.debug('created remote SearchExecutor instance');
  return [instance, cleanup];
};

export const loadTimer = async (
  ...args: ConstructorParameters<typeof Timer>
): Promise<[timer: Remote<Timer>, cleanup: () => void]> => {
  const logger = new Logger('worker-init');

  let RemoteClass: Remote<typeof Timer>;
  let cleanup: () => void;

  if (typeof Worker !== 'undefined') {
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
