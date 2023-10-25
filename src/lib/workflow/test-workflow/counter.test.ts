import { expect, test } from 'vitest';
import { workflow } from '..';
import { Action, State, Type, update } from './counter';
import { Command } from '../commands';

test('counter workflow', () => {
  const { emit, states, updates } = workflow(update({ multiplier: 2 }), {
    count: 10,
  });

  const statesResults: (State | string)[] = [];
  const updatesResults: ([[State, State], Action] | string)[] = [];

  const resulter = <T>(results: (T | string)[]) => ({
    next(value: T) {
      results.push(value);
    },
    error(err: unknown) {
      results.push(`error: ${err}`);
    },
    complete() {
      results.push('complete');
    },
  });
  states.subscribe(resulter(statesResults));
  updates.subscribe(resulter(updatesResults));

  emit({ type: Type.Increment, value: 1 });
  emit(Command.Done);

  expect(statesResults).toEqual([{ count: 12 }, 'complete']);
  expect(updatesResults).toEqual([
    [[{ count: 10 }, { count: 12 }], { type: Type.Increment, value: 1 }],
    'complete',
  ]);
});

test('counter workflow error', () => {
  const { emit, states, updates } = workflow(update({ multiplier: 2 }), {
    count: 10,
  });

  const statesResults: (State | string)[] = [];
  const updatesResults: ([[State, State], Action] | string)[] = [];

  const resulter = <T>(results: (T | string)[]) => ({
    next(value: T) {
      results.push(value);
    },
    error(err: unknown) {
      results.push(`error: ${err}`);
    },
    complete() {
      results.push('complete');
    },
  });
  states.subscribe(resulter(statesResults));
  updates.subscribe(resulter(updatesResults));

  emit({ type: Type.Increment, value: 1 });
  emit({ type: Type.Increment, value: 2 });
  emit({ type: Type.Increment, value: 3 });
  emit({ type: Type.Exception, async: false });

  expect(statesResults).toEqual([
    { count: 12 },
    { count: 16 },
    { count: 22 },
    'error: Error: test error in update',
  ]);
  expect(updatesResults).toEqual([
    [[{ count: 10 }, { count: 12 }], { type: Type.Increment, value: 1 }],
    [[{ count: 12 }, { count: 16 }], { type: Type.Increment, value: 2 }],
    [[{ count: 16 }, { count: 22 }], { type: Type.Increment, value: 3 }],
    'error: Error: test error in update',
  ]);
});
