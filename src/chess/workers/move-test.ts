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
    const count = await run(position, i);
    const timing = Date.now() - start;
    const passed = isCountCorrectForDepthFromStart(i, count, test);
    self.postMessage(
      `depth=${i}; count=${count}; timing=${timing}ms; passed=${
        passed ? 'yes' : 'no'
      }`
    );
  }
};
