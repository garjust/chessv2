import React, { useEffect, useState } from 'react';
import { Observer, Subject } from 'rxjs';
import { Registry, LATEST, Version } from '../ai';
import { parseFEN } from '../lib/fen';
import {
  BLACK_CHECKMATE,
  MoveTest,
  PERFT_POSITION_5,
  STARTING_POSITION,
  VIENNA_OPENING,
} from '../lib/perft';
import './Debug.css';
import { BUTTON_CSS } from './theme';
import { loadComputer, loadPerft } from '../workers';

const EXCLUDED_COMPUTERS: Version[] = ['Random'];
const COMPUTER_DEPTH = 4;

async function runMoveGenerationTest(
  logger: Subject<string>,
  test: MoveTest,
  toDepth = 5,
) {
  const [worker] = await loadPerft();

  worker.onmessage = (message: MessageEvent<string>) => {
    logger.next(message.data);
  };
  worker.postMessage({ test, toDepth });
}

async function runSingleComputerNextMoveTest(logger: Observer<string>) {
  const [ai, cleanup] = await loadComputer(LATEST, COMPUTER_DEPTH);

  const tests = [STARTING_POSITION, VIENNA_OPENING, PERFT_POSITION_5];

  for (const test of tests) {
    await ai.nextMove(parseFEN(test.fen));

    const diagnosticsResult = await ai.diagnosticsResult;
    if (diagnosticsResult) {
      logger.next(diagnosticsResult.logString);
      console.log(diagnosticsResult.label, diagnosticsResult);
    }
  }

  cleanup();

  logger.next('--');
}

async function runComputerNextMoveTest(
  logger: Observer<string>,
  test: MoveTest,
) {
  const computers = await Promise.all(
    Object.keys(Registry).map(async (version) => {
      const [ai, cleanup] = await loadComputer(
        version as Version,
        COMPUTER_DEPTH,
      );
      return {
        version: version as Version,
        ai,
        cleanup,
      };
    }),
  );

  for (const { version, ai, cleanup } of computers) {
    if (EXCLUDED_COMPUTERS.includes(version)) {
      continue;
    }

    await ai.nextMove(parseFEN(test.fen));

    const diagnosticsResult = await ai.diagnosticsResult;
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
          style={BUTTON_CSS}
          onClick={() => runMoveGenerationTest(logger, STARTING_POSITION)}
        >
          Move generation perft
        </button>

        <button
          style={BUTTON_CSS}
          onClick={() => runMoveGenerationTest(logger, PERFT_POSITION_5)}
        >
          Move generation perft PERFT_5
        </button>

        <button
          style={BUTTON_CSS}
          onClick={() => runMoveGenerationTest(logger, VIENNA_OPENING)}
        >
          Move generation perft VIENNA
        </button>

        <button
          style={BUTTON_CSS}
          onClick={() => runMoveGenerationTest(logger, BLACK_CHECKMATE)}
        >
          Move generation perft BLACK MATE
        </button>

        <button
          style={BUTTON_CSS}
          onClick={() => runComputerNextMoveTest(logger, STARTING_POSITION)}
        >
          Move AI perft
        </button>

        <button
          style={BUTTON_CSS}
          onClick={() => runComputerNextMoveTest(logger, PERFT_POSITION_5)}
        >
          Move AI perft PERFT_5
        </button>

        <button
          style={BUTTON_CSS}
          onClick={() => runComputerNextMoveTest(logger, VIENNA_OPENING)}
        >
          Move AI perft VIENNA
        </button>

        <button
          style={BUTTON_CSS}
          onClick={() => runComputerNextMoveTest(logger, BLACK_CHECKMATE)}
        >
          Move AI perft BLACK MATE
        </button>

        <button
          style={BUTTON_CSS}
          onClick={() => runSingleComputerNextMoveTest(logger)}
        >
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
