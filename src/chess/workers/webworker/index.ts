import { Endpoint, Remote, wrap } from 'comlink';
import nodeEndpoint from 'comlink/src/node-adapter';
import Logger from '../../../lib/logger';
import Timer from '../../../lib/timer';
import { SearchExecutor } from '../../engine/search-executor';
import { Worker as NodeWorker } from 'node:worker_threads';

const logger = new Logger('worker-init');

export const loadPerft = async (): Promise<
  [worker: Worker, cleanup: () => void]
> => {
  const worker = new Worker(new URL('./perft', import.meta.url), {
    type: 'module',
  });
  worker.addEventListener('error', (event) => {
    logger.error('perft web worker crashed', event.message, event);
  });
  return [worker, () => worker.terminate()];
};

export const loadSearchExecutor = async (
  ...args: ConstructorParameters<typeof SearchExecutor>
): Promise<[executor: Remote<SearchExecutor>, cleanup: () => void]> => {
  logger.debug('loading search-executor web worker');
  let worker: Worker | NodeWorker;
  let endpoint: Endpoint;

  if (USE_NODE_WORKER_THREAD) {
    worker = new NodeWorker(new URL('./search-executor.mjs', import.meta.url));
    endpoint = nodeEndpoint(worker);
  } else {
    worker = new Worker(new URL('./search-executor', import.meta.url), {
      type: 'module',
    });
    endpoint = worker;
    endpoint.addEventListener('error', (event) => {
      logger.error(`search-executor web worker crashed`, event);
    });
  }
  const RemoteClass = wrap<typeof SearchExecutor>(endpoint);

  logger.debug('creating remote SearchExecutor instance');
  const instance = await new RemoteClass(...args);
  logger.debug('created remote SearchExecutor instance');
  return [instance, () => worker.terminate()];
};

export const loadTimer = async (
  ...args: ConstructorParameters<typeof Timer>
): Promise<[timer: Remote<Timer>, cleanup: () => void]> => {
  logger.debug('loading timer web worker');
  let worker: Worker | NodeWorker;
  let endpoint: Endpoint;

  if (USE_NODE_WORKER_THREAD) {
    worker = new NodeWorker(new URL('./timer.mjs', import.meta.url));
    endpoint = nodeEndpoint(worker);
  } else {
    worker = new Worker(new URL('./timer', import.meta.url), {
      type: 'module',
    });
    endpoint = worker;
    endpoint.addEventListener('error', (event) => {
      logger.error(`timer web worker crashed`, event);
    });
  }
  const RemoteClass = wrap<typeof Timer>(endpoint);

  logger.debug('creating remote Timer instance');
  const instance = await new RemoteClass(...args);
  logger.debug('created remote Timer instance');
  return [instance, () => worker.terminate()];
};
