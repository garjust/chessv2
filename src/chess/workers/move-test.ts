import Engine from '../engine';
import { parseFEN } from '../lib/fen';
import {
  isCountCorrectForDepthFromStart,
  MoveTest,
  run,
} from '../lib/move-test';

self.onmessage = async (
  message: MessageEvent<{
    test: MoveTest;
    toDepth: number;
  }>
) => {
  const { test, toDepth } = message.data;

  const position = parseFEN(test.fen);

  for (let i = 1; i <= toDepth; i++) {
    const start = Date.now();
    const engine = new Engine(position);
    const count = await run(engine, i);
    const timing = Date.now() - start;
    const passed = isCountCorrectForDepthFromStart(i, count, test);
    self.postMessage(
      `depth=${i}; passed=${
        passed ? 'yes' : 'no'
      }; count=${count}; timing=${timing}ms (${(
        (timing / count) *
        1000
      ).toPrecision(5)}μs/node)`
    );
  }
  self.postMessage('--');
};
