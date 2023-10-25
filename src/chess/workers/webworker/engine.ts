import { expose } from 'comlink';
import { Engine } from '../../engine/engine';
import Logger from '../../../lib/logger';

new Logger('worker').debug('running engine thread');

expose(Engine);
