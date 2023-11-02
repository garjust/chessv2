import React, { useEffect, useState } from 'react';
import { Observer, Subject } from 'rxjs';
import { Registry, LATEST, Version } from '../engine/registry';
import { parseFEN } from '../lib/fen';
import { TestFens, MoveTest } from '../lib/perft';
import './Debug.css';
import { loadPerftWorker, loadSearchExecutorWorker } from '../workers';

const EXCLUDED_ENGINES: Version[] = ['Random'];
const ENGINE_DEPTH = 4;

async function runMoveGenerationTest(
  logger: Subject<string>,
  test: MoveTest,
  toDepth = 5,
) {
  const [worker] = await loadPerftWorker();

  worker.onmessage = (message: MessageEvent<string>) => {
    logger.next(message.data);
  };
  worker.postMessage({ test, toDepth });
}

async function runSingleEngineNextMoveTest(logger: Observer<string>) {
  const [searchExecutor, cleanup] = await loadSearchExecutorWorker(
    LATEST,
    ENGINE_DEPTH,
  );

  const tests = [
    TestFens.STARTING_POSITION,
    TestFens.VIENNA_OPENING,
    TestFens.PERFT_POSITION_5,
  ];

  for (const test of tests) {
    await searchExecutor.nextMove(parseFEN(test.fen));

    const diagnosticsResult = await searchExecutor.diagnosticsResult;
    if (diagnosticsResult) {
      logger.next(diagnosticsResult.logString);
      console.log(diagnosticsResult.label, diagnosticsResult);
    }
  }

  cleanup();

  logger.next('--');
}

async function runEngineNextMoveTest(logger: Observer<string>, test: MoveTest) {
  const searchExecutors = await Promise.all(
    Object.keys(Registry).map(async (version) => {
      const [searchExecutor, cleanup] = await loadSearchExecutorWorker(
        version as Version,
        ENGINE_DEPTH,
      );
      return {
        version: version as Version,
        searchExecutor,
        cleanup,
      };
    }),
  );

  for (const { version, searchExecutor, cleanup } of searchExecutors) {
    if (EXCLUDED_ENGINES.includes(version)) {
      continue;
    }

    await searchExecutor.nextMove(parseFEN(test.fen));

    const diagnosticsResult = await searchExecutor.diagnosticsResult;
    if (diagnosticsResult) {
      logger.next(diagnosticsResult.logString);
      console.log(diagnosticsResult.label, diagnosticsResult);

      // const cutPercentage =
      //   1 -
      //   diagnosticsResult.totalNodes / test.counts[diagnosticsResult.depth - 1];

      // console.log(
      //   diagnosticsResult.label,
      //   `cut=${(cutPercentage * 100).toPrecision(5)}%`
      // );
    }

    cleanup();
  }

  logger.next('--');
}

const Debug = () => {
  const [logger] = useState(new Subject<string>());
  const [log, setLog] = useState([] as string[]);

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
            runMoveGenerationTest(logger, TestFens.STARTING_POSITION)
          }
        >
          Move generation perft
        </button>

        <button
          onClick={() =>
            runMoveGenerationTest(logger, TestFens.PERFT_POSITION_5)
          }
        >
          Move generation perft PERFT_5
        </button>

        <button
          onClick={() => runMoveGenerationTest(logger, TestFens.VIENNA_OPENING)}
        >
          Move generation perft VIENNA
        </button>

        <button
          onClick={() =>
            runMoveGenerationTest(logger, TestFens.BLACK_CHECKMATE)
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
