import { expect, test } from 'vitest';
import { workflow } from '.';
import { Command } from './commands';
import { EmptyError, Observable, firstValueFrom, lastValueFrom } from 'rxjs';

test('complete the workflow', async () => {
  const { emit, states, updates } = workflow((state) => [state, null], {});

  const lastState = lastValueFrom(states);
  const lastUpdate = lastValueFrom(updates);

  emit(Command.Done);

  await expect(lastState).rejects.toThrowError(EmptyError);
  await expect(lastUpdate).rejects.toThrowError(EmptyError);
});

test('receive first state', async () => {
  const { emit, states, updates } = workflow<number, number>(
    (state, val) => [state + val, null],
    1,
  );

  const firstState = firstValueFrom(states);
  const firstUpdate = firstValueFrom(updates);

  emit(2);
  emit(Command.Done);

  await expect(firstState).resolves.toEqual(3);
  await expect(firstUpdate).resolves.toEqual([[1, 3], 2]);
});

test('error flows through', async () => {
  const { emit, states, updates } = workflow(() => {
    throw Error('test error');
  }, 0);

  const lastState = lastValueFrom(states);
  const lastUpdate = lastValueFrom(updates);

  emit(null);
  emit(Command.Done);

  await expect(lastState).rejects.toThrowError('test error');
  await expect(lastUpdate).rejects.toThrowError('test error');
});

test('promise error flows through', async () => {
  const { emit, states, updates } = workflow(
    (state) => [state, () => Promise.reject(new Error('promise test error'))],
    0,
  );

  const lastState = lastValueFrom(states);
  const lastUpdate = lastValueFrom(updates);

  emit(null);

  await expect(lastState).rejects.toThrowError('promise test error');
  await expect(lastUpdate).rejects.toThrowError('promise test error');
});

test('delayed promise error flows through', async () => {
  const { emit, states, updates } = workflow(
    (state) => [
      state,
      () =>
        new Promise(() => {
          setTimeout(() => {
            throw new Error('delayed promise test error');
          }, 0);
        }),
    ],
    0,
  );

  const lastState = lastValueFrom(states);
  const lastUpdate = lastValueFrom(updates);

  emit(null);

  await expect(lastState).rejects.toThrowError('promise test error');
  await expect(lastUpdate).rejects.toThrowError('promise test error');
});

test('observable error flows through', async () => {
  const { emit, states, updates } = workflow(
    (state) => [
      state,
      () =>
        new Observable((subscriber) => {
          subscriber.error(new Error('observable test error'));
        }),
    ],
    0,
  );

  const lastState = lastValueFrom(states);
  const lastUpdate = lastValueFrom(updates);

  emit(null);

  await expect(lastState).rejects.toThrowError('observable test error');
  await expect(lastUpdate).rejects.toThrowError('observable test error');
});
