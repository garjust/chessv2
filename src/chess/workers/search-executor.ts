import { expose } from 'comlink';
import Logger from '../../lib/logger';
import { SearchExecutor } from '../engine/search-executor';

new Logger('worker').debug('running search-executor thread');

expose(SearchExecutor);
