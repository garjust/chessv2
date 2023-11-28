import { expose } from 'comlink';
import nodeEndpoint from 'comlink/src/node-adapter';
import { parentPort } from 'node:worker_threads';
import { SearchExecutor } from '../../engine/search-executor';
import Logger from '../../../lib/logger';

new Logger('worker').debug('running search-executor thread');

if (parentPort == null) {
  throw Error('comlink cannot setup worker; problem with parentPort');
}

expose(SearchExecutor, nodeEndpoint(parentPort));
