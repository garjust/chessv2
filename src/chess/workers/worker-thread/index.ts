import { Remote, wrap } from 'comlink';
import nodeEndpoint from 'comlink/src/node-adapter';
import Timer from '../../../lib/timer';
import Logger from '../../../lib/logger';
import { SearchExecutor } from '../../engine/search-executor';
import { Worker } from 'node:worker_threads';

const logger = new Logger('worker-init');

export const loadSearchExecutor = async (
  ...args: ConstructorParameters<typeof SearchExecutor>
): Promise<[executor: Remote<SearchExecutor>, cleanup: () => void]> => {
  logger.debug('loading search-executor thread');
  const worker = new Worker(new URL('./search-executor.mjs', import.meta.url));
  const RemoteClass = wrap<typeof SearchExecutor>(nodeEndpoint(worker));

  logger.debug('creating remote SearchExecutor instance');
  const instance = await new RemoteClass(...args);
  logger.debug('created remote SearchExecutor instance');
  return [instance, () => worker.terminate()];
};

export const loadTimer = async (
  ...args: ConstructorParameters<typeof Timer>
): Promise<[timer: Remote<Timer>, cleanup: () => void]> => {
  const { Worker } = await import('node:worker_threads');
  console.log('loaded worker class');
  const worker = new Worker(new URL('./timer.mjs', import.meta.url));
  const RemoteClass = wrap<typeof Timer>(nodeEndpoint(worker));

  logger.debug('creating remote Timer instance');
  const instance = await new RemoteClass(...args);
  return [instance, () => worker.terminate()];
};
