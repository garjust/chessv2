import { expose } from 'comlink';
import Logger from '../../../lib/logger';
import Timer from '../../../lib/timer';

import nodeEndpoint from 'comlink/dist/esm/node-adapter';
import { parentPort } from 'node:worker_threads';

new Logger('worker').debug('running timer thread');

if (parentPort == null) {
  throw Error('comlink cannot setup worker; problem with parentPort');
}

expose(Timer, nodeEndpoint(parentPort));
