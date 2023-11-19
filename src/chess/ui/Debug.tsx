import React, { useEffect, useState } from 'react';
import { Observer, Subject } from 'rxjs';
import { LATEST } from '../engine/search-executor';
import { Version } from '../engine/search-executor';
import { Registry } from '../engine/search-executor';
import { parseFEN } from '../lib/fen';
import { TestFens, MoveTest } from '../lib/perft';
import './Debug.css';
import { loadPerftWorker, loadSearchExecutorWorker } from '../workers';

const EXCLUDED_VERSIONS: Version[] = ['random'];
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
    (info) => {
      logger.next(`${info}`);
      console.log(info);
    },
  );

  const tests = [
    TestFens.STARTING_POSITION,
    TestFens.VIENNA_OPENING,
    TestFens.PERFT_POSITION_5,
  ];

  for (const test of tests) {
    await searchExecutor.nextMove(
      parseFEN(test.fen),
      [],
      Number.MAX_SAFE_INTEGER,
      { depth: ENGINE_DEPTH },
    );
    // const diagnosticsResult = await searchExecutor.diagnosticsResult;
    // if (diagnosticsResult) {
    //   logger.next(diagnosticsResult.logString);
    //   console.log(diagnosticsResult.label, diagnosticsResult);
    // }
  }

  cleanup();

  logger.next('--');
}

async function runEngineNextMoveTest(logger: Observer<string>, test: MoveTest) {
  const searchExecutors = await Promise.all(
    Object.keys(Registry).map(async (version) => {
      const [searchExecutor, cleanup] = await loadSearchExecutorWorker(
        version as Version,
        () => {},
      );
      return {
        version: version as Version,
        searchExecutor,
        cleanup,
      };
    }),
  );

  for (const { version, searchExecutor, cleanup } of searchExecutors) {
    if (EXCLUDED_VERSIONS.includes(version)) {
      continue;
    }

    await searchExecutor.nextMove(
      parseFEN(test.fen),
      [],
      Number.MAX_SAFE_INTEGER,
      { depth: ENGINE_DEPTH },
    );

    // const diagnosticsResult = await searchExecutor.diagnosticsResult;
    // if (diagnosticsResult) {
    //   logger.next(diagnosticsResult.logString);
    //   console.log(diagnosticsResult.label, diagnosticsResult);

    // const cutPercentage =
    //   1 -
    //   diagnosticsResult.totalNodes / test.counts[diagnosticsResult.depth - 1];

    // console.log(
    //   diagnosticsResult.label,
    //   `cut=${(cutPercentage * 100).toPrecision(5)}%`
    // );
    // }

    cleanup();
  }

  logger.next('--');
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
        >
          Move generation perft
        </button>

        <button
          onClick={() =>
            worker
              ? runMoveGenerationTest(worker, TestFens.PERFT_POSITION_5)
              : null
          }
        >
          Move generation perft PERFT_5
        </button>

        <button
          onClick={() =>
            worker
              ? runMoveGenerationTest(worker, TestFens.VIENNA_OPENING)
              : null
          }
        >
          Move generation perft VIENNA
        </button>

        <button
          onClick={() =>
            worker
              ? runMoveGenerationTest(worker, TestFens.BLACK_CHECKMATE)
              : null
          }
        >
          Move generation perft BLACK MATE
        </button>

        <button
          onClick={() =>
            runEngineNextMoveTest(logger, TestFens.STARTING_POSITION)
          }
        >
          Move AI perft
        </button>

        <button
          onClick={() =>
            runEngineNextMoveTest(logger, TestFens.PERFT_POSITION_5)
          }
        >
          Move AI perft PERFT_5
        </button>

        <button
          onClick={() => runEngineNextMoveTest(logger, TestFens.VIENNA_OPENING)}
        >
          Move AI perft VIENNA
        </button>

        <button
          onClick={() =>
            runEngineNextMoveTest(logger, TestFens.BLACK_CHECKMATE)
          }
        >
          Move AI perft BLACK MATE
        </button>

        <button onClick={() => runSingleEngineNextMoveTest(logger)}>
          Single Move AI perft
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
