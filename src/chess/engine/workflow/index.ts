import { workflow } from '../../../lib/workflow';
import type { State } from './state';
import type { Action } from './action';
import { update, Context } from './update';

export type { State } from './state';
export type { Action, Type } from './action';
export type { Context } from './update';

export { createState } from './state';
export * from './action';
export { update } from './update';

const init = (seed: State, context: Context) =>
  workflow<State, Action>(update(context), seed, 'engine', (state) => {
    state.executorInstance?.cleanup();
  });
export default init;
