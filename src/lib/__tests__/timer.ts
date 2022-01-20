import Timer from '../timer';

test('timer works', () => {
  jest.useFakeTimers();
  jest.spyOn(global, 'setInterval');

  const timer = new Timer(100, { tickRate: 10, autoStart: false, debug: true });
  timer.start();
  expect(setInterval).toHaveBeenCalledTimes(1);
  expect(timer.brrring()).toEqual(false);

  jest.runAllTimers();
  expect(timer.brrring()).toEqual(true);

  jest.useRealTimers();
});
