import { expose } from 'comlink';
import { SearchEngine } from '../ai/search-engine';
import Logger from '../../lib/logger';

new Logger('worker').debug('running search-engine thread');

expose(SearchEngine);
