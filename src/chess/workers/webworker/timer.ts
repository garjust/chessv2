import { expose } from 'comlink';
import Logger from '../../../lib/logger';
import Timer from '../../../lib/timer';

new Logger('worker').debug('running timer thread');

// Need to explicitly pass "self" for the comlink endpoint to make vitest web
// worker shim work.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expose(Timer, self as any);
