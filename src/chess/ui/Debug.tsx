import React, { useEffect, useState } from 'react';
import { Observer, Subject } from 'rxjs';
import { LATEST } from '../engine/search-executor';
import { FEN_LIBRARY, parseFEN } from '../lib/fen';
import { TestFens, MoveTest } from '../lib/perft';
import './Debug.css';
import { loadPerftWorker, loadSearchExecutorWorker } from '../workers';
import { proxy } from 'comlink';
import { UCIResponseType, toUCI } from '../engine/workflow/uci-response';

const ENGINE_DEPTH = 4;

async function runMoveGenerationTest(
  worker: Worker,
  test: MoveTest,
  toDepth = 5,
) {
  worker.postMessage({ test, toDepth });
}

async function runSingleEngineNextMoveTest(logger: Observer<string>) {
  const [searchExecutor, cleanup] = await loadSearchExecutorWorker(
    LATEST,
    proxy((info) => {
      logger.next(toUCI({ type: UCIResponseType.Info, info })[0]);
    }),
  );

  const fens = [
    FEN_LIBRARY.STARTING_POSITION_FEN,
    FEN_LIBRARY.VIENNA_OPENING_FEN,
    FEN_LIBRARY.PERFT_5_FEN,
    FEN_LIBRARY.BLACK_CHECKMATE_FEN,
    FEN_LIBRARY.FIXED_PAWN_ENDGAME_FEN,
  ];

  for (const fen of fens) {
    await searchExecutor.nextMove(parseFEN(fen), [], Number.MAX_SAFE_INTEGER, {
      depth: ENGINE_DEPTH,
    });
    logger.next('--');
  }

  cleanup();
}

const Debug = () => {
  const [logger] = useState(new Subject<string>());
  const [log, setLog] = useState([] as string[]);
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const promise = loadPerftWorker();
    promise.then(([newWorker]) => {
      newWorker.onmessage = (message: MessageEvent<string>) => {
        logger.next(message.data);
      };
      setWorker(newWorker);
    });
    return () => {
      promise.then(([newWorker]) => newWorker.terminate());
    };
  }, []);

  useEffect(() => {
    const subscription = logger.subscribe((str) => {
      setLog((log) => [...log, str]);
    });

    return function cleanup() {
      subscription.unsubscribe();
    };
  }, [logger]);

  return (
    <div className="debug">
      <div
        style={{
          gridArea: 'buttons',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <button
          onClick={() =>
            worker
              ? runMoveGenerationTest(worker, TestFens.STARTING_POSITION)
              : null
          }
          disabled={worker === null}
        >
          Move generation perft
        </button>

        <button
          onClick={() =>
            worker
              ? runMoveGenerationTest(worker, TestFens.PERFT_POSITION_5)
              : null
          }
          disabled={worker === null}
        >
          Move generation perft PERFT_5
        </button>

        <button
          onClick={() =>
            worker
              ? runMoveGenerationTest(worker, TestFens.VIENNA_OPENING)
              : null
          }
          disabled={worker === null}
        >
          Move generation perft VIENNA
        </button>

        <button
          onClick={() =>
            worker
              ? runMoveGenerationTest(worker, TestFens.BLACK_CHECKMATE)
              : null
          }
          disabled={worker === null}
        >
          Move generation perft BLACK MATE
        </button>

        <button onClick={() => runSingleEngineNextMoveTest(logger)}>
          Next move perft
        </button>
      </div>
      <pre style={{ gridArea: 'log' }}>
        {log.map((line) => (
          <div key={Math.random()}>{line}</div>
        ))}
      </pre>
    </div>
  );
};

export default Debug;
