import { expect, test } from 'vitest';
import Timer from './timer';
import { vi } from 'vitest';

test.skip('timer works', () => {
  vi.useFakeTimers();
  vi.spyOn(global, 'setInterval');

  const timer = new Timer(100, { tickRate: 10, autoStart: false });
  timer.start();
  expect(setInterval).toHaveBeenCalledTimes(1);
  expect(timer.brrring()).toEqual(false);

  vi.runAllTimers();
  expect(timer.brrring()).toEqual(true);

  vi.useRealTimers();
});
