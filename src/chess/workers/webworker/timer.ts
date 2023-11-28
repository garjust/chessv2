import { expose } from 'comlink';
import nodeEndpoint from 'comlink/src/node-adapter';
import { parentPort } from 'node:worker_threads';
import Logger from '../../../lib/logger';
import Timer from '../../../lib/timer';

new Logger('worker').debug('running timer thread');

if (USE_NODE_WORKER_THREAD) {
  if (parentPort == null) {
    throw Error('comlink cannot setup worker; problem with parentPort');
  }
  expose(Timer, nodeEndpoint(parentPort));
} else {
  // Need to explicitly pass "self" for the comlink endpoint to make vitest web
  // worker shim work.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expose(Timer, self as any);
}
