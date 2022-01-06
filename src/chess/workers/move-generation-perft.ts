import { MoveTest, run } from '../lib/move-generation-perft';

self.onmessage = async (
  message: MessageEvent<{
    test: MoveTest;
    toDepth: number;
  }>
) => {
  const { test, toDepth } = message.data;
  run(self.postMessage, test, toDepth);
};
