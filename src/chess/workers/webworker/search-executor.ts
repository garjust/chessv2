import { expose } from 'comlink';
import Logger from '../../../lib/logger';
import { SearchExecutor } from '../../engine/search-executor';

new Logger('worker').debug('running search-executor thread');

// Need to explicitly pass "self" for the comlink endpoint to make vitest web
// worker shim work.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expose(SearchExecutor, self as any);
