import { expect, test } from 'vitest';
import { workflow } from '.';
import { Command } from './commands';
import { EmptyError, lastValueFrom } from 'rxjs';

test('complete the workflow', () => {
  const { emit, states, updates } = workflow((state) => [state, null], {});

  emit(Command.Done);

  expect(lastValueFrom(states)).rejects.toThrowError(EmptyError);
  expect(lastValueFrom(updates)).rejects.toThrowError(EmptyError);
});

test('receive first state', () => {
  const { emit, states, updates } = workflow<{ val: number }, number>(
    (state, val) => [{ ...state, val: state.val + val }, null],
    {
      val: 0,
    },
  );

  emit(Command.Done);

  expect(lastValueFrom(states)).resolves.toEqual({ val: 0 });
  expect(lastValueFrom(updates)).rejects.toThrowError(EmptyError);
});
