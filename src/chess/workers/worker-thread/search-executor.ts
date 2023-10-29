import { Remote, expose, wrap } from 'comlink';
import nodeEndpoint from 'comlink/dist/esm/node-adapter';
import { Worker, parentPort, isMainThread } from 'node:worker_threads';
import { SearchExecutor } from '../../engine/search-executor';
import Logger from '../../../lib/logger';

new Logger('worker').debug('running search-executor thread');

if (parentPort == null) {
  throw Error('comlink cannot setup worker; problem with parentPort');
}

expose(SearchExecutor, nodeEndpoint(parentPort));

// import normal

// export function load(): [Remote<typeof SearchExecutor>, () => void] {
//   const worker = new Worker(__filename, {
//     name: 'search-executor',
//   });
//   const RemoteClass = wrap<typeof SearchExecutor>(nodeEndpoint(worker));
//   return [RemoteClass, () => worker.terminate()];
// }

// if (!isMainThread) {
//   new Logger('worker').debug('running search-executor thread');

//   if (parentPort == null) {
//     throw Error('comlink cannot setup worker; problem with parentPort');
//   }

//   expose(SearchExecutor, nodeEndpoint(parentPort));
// }

// requires

// const { Remote, expose, wrap } = require('comlink');
// const nodeEndpoint = require('comlink/dist/umd/node-adapter');
// const { isMainThread, parentPort } = require('node:worker_threads');
// const { SearchExecutor } = require('../../engine/search-executor');
// const Logger = require('../../../lib/logger');

// export function load(): [typeof Remote, () => void] {
//   const worker = new Worker(__filename);
//   const RemoteClass = wrap(nodeEndpoint(worker));
//   return [RemoteClass, () => worker.terminate()];
// }

// if (!isMainThread) {
//   new Logger('worker').debug('running search-executor thread');

//   if (parentPort == null) {
//     throw Error('comlink cannot setup worker; problem with parentPort');
//   }

//   expose(SearchExecutor, nodeEndpoint(parentPort));
// }
