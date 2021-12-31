import { MoveTest, run } from '../lib/move-generation-perft';

self.onmessage = async (
  message: MessageEvent<{
    test: MoveTest;
    toDepth: number;
    debug: boolean;
  }>
) => {
  const { test, toDepth, debug } = message.data;
  run(self.postMessage, test, toDepth, debug);
};
