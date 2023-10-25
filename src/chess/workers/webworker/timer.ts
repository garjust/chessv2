import { expose } from 'comlink';
import Logger from '../../../lib/logger';
import Timer from '../../../lib/timer';

new Logger('worker').debug('running timer thread');

expose(Timer);
