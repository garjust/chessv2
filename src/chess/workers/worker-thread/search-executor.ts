import { expose } from 'comlink';
import Logger from '../../../lib/logger';
import { SearchExecutor } from '../../engine/search-executor';

new Logger('worker').debug('running search-executor thread');

if (typeof Worker !== 'undefined') {
  expose(SearchExecutor);
} else {
  const { default: nodeEndpoint } = await import(
    'comlink/dist/esm/node-adapter'
  );
  const { parentPort } = await import('node:worker_threads');
  if (parentPort == null) {
    throw Error('comlink cannot setup worker; problem with parentPort');
  }

  expose(SearchExecutor, nodeEndpoint(parentPort));
}
