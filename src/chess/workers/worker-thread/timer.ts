import { expose } from 'comlink';
import nodeEndpoint from 'comlink/src/node-adapter';
import { parentPort } from 'node:worker_threads';
import Timer from '../../../lib/timer';
import Logger from '../../../lib/logger';

new Logger('worker').debug('running timer thread');

if (parentPort == null) {
  throw Error('comlink cannot setup worker; problem with parentPort');
}

expose(Timer, nodeEndpoint(parentPort));
