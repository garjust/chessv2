import { expose } from 'comlink';
import { Engine } from '../../engine/engine';
import Logger from '../../../lib/logger';

new Logger('worker').debug('running engine thread');

if (typeof Worker !== 'undefined') {
  expose(Engine);
} else {
  const { default: nodeEndpoint } = await import(
    'comlink/dist/esm/node-adapter'
  );
  const { parentPort } = await import('node:worker_threads');
  if (parentPort == null) {
    throw Error('comlink cannot setup worker; problem with parentPort');
  }

  expose(Engine, nodeEndpoint(parentPort));
}
