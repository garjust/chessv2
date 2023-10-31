import { Remote, wrap } from 'comlink';
import Logger from '../../../lib/logger';
import Timer from '../../../lib/timer';
import { SearchExecutor } from '../../engine/search-executor';

const logger = new Logger('worker-init');

export const loadPerft = async (): Promise<
  [worker: Worker, cleanup: () => void]
> => {
  const worker = new Worker(new URL('./perft', import.meta.url), {
    type: 'module',
  });
  return [worker, () => worker.terminate()];
};

const workerHandlers = (
  label: string,
  worker: Worker,
): [cleanup: () => void, error: Promise<void>] => {
  let cleanup = worker.terminate;
  const workerError = new Promise<void>((resolve, reject) => {
    cleanup = () => {
      resolve();
      worker.terminate;
    };
    worker.addEventListener('error', (event) => {
      logger.error(`${label} web worker crashed`, event.message, event);
      // reject(event.error);
    });
  });

  return [cleanup, workerError];
};

export const loadSearchExecutor = async (
  ...args: ConstructorParameters<typeof SearchExecutor>
): Promise<
  [
    executor: Remote<SearchExecutor>,
    cleanup: () => void,
    // workerError: Promise<void>,
  ]
> => {
  logger.debug('loading search-executor web worker');
  const worker = new Worker(new URL('./search-executor', import.meta.url), {
    type: 'module',
  });
  const [cleanup, workerError] = workerHandlers('search-executor', worker);
  const RemoteClass = wrap<typeof SearchExecutor>(worker);

  logger.debug('creating remote SearchExecutor instance');
  const instance = await new RemoteClass(...args);
  logger.debug('created remote SearchExecutor instance');
  return [instance, cleanup];
};

export const loadTimer = async (
  ...args: ConstructorParameters<typeof Timer>
): Promise<[timer: Remote<Timer>, cleanup: () => void]> => {
  logger.debug('loading timer web worker');
  const worker = new Worker(new URL('./timer', import.meta.url), {
    type: 'module',
  });
  worker.addEventListener('error', (event) => {
    logger.error('timer web worker crashed', event.message, event);
  });
  const RemoteClass = wrap<typeof Timer>(worker);

  logger.debug('creating remote Timer instance');
  const instance = await new RemoteClass(...args);
  logger.debug('created remote Timer instance');
  return [instance, () => worker.terminate()];
};
