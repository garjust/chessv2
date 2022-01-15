import React, { useEffect, useState } from 'react';
import { Observer, Subject } from 'rxjs';
import { ComputerRegistry, LATEST } from '../ai';
import {
  parseFEN,
  PERFT_5_FEN,
  STARTING_POSITION_FEN,
  VIENNA_OPENING_FEN,
} from '../lib/fen';
import {
  MoveTest,
  PERFT_POSITION_5,
  STARTING_POSITION,
  VIENNA_OPENING,
} from '../lib/move-generation-perft';
import './Debug.css';
import { AvailableComputerVersions } from '../ai/types';
import { BUTTON_CSS } from './theme';
import { loadComputer } from '../workers';

async function runMoveGenerationTest(
  logger: Subject<string>,
  test: MoveTest,
  toDepth = 5
) {
  const worker = new Worker(
    new URL('../workers/move-generation-perft', import.meta.url)
  );

  worker.onmessage = (message: MessageEvent<string>) => {
    logger.next(message.data);
  };
  worker.postMessage({ test, toDepth });
}

async function runSingleComputerNextMoveTest(logger: Observer<string>) {
  const [ai, cleanup] = await loadComputer(LATEST);

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
  test: MoveTest
) {
  const computers = await Promise.all(
    Object.keys(ComputerRegistry).map(async (version) => {
      const [ai, cleanup] = await loadComputer(
        version as AvailableComputerVersions
      );
      return {
        version,
        ai,
        cleanup,
      };
    })
  );

  for (const { version, ai, cleanup } of computers) {
    if (['v1', 'v2'].includes(version)) {
      continue;
    }

    await ai.nextMove(parseFEN(test.fen));

    const diagnosticsResult = await ai.diagnosticsResult;
    if (diagnosticsResult) {
      logger.next(diagnosticsResult.logString);
      console.log(diagnosticsResult.label, diagnosticsResult);

      const cutPercentage =
        1 -
        diagnosticsResult.totalNodes / test.counts[diagnosticsResult.depth - 1];

      console.log(
        diagnosticsResult.label,
        `cut=${(cutPercentage * 100).toPrecision(5)}%`
      );
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
