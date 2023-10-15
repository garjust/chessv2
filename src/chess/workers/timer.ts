import { expose } from 'comlink';
import Timer from '../../lib/timer';

if (Worker) {
  expose(Timer);
} else {
  const { default: nodeEndpoint } = await import(
    'comlink/dist/esm/node-adapter'
  );
  const { parentPort } = await import('node:worker_threads');

  if (parentPort == null) {
    throw Error('comlink cannot setup worker; problem with parentPort');
  }
  expose(Timer, nodeEndpoint(parentPort));
}
