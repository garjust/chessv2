import React, { CSSProperties, useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { ComputerRegistry } from '../ai';
import { STARTING_POSITION_FEN, VIENNA_GAMBIT_ACCEPTED_FEN } from '../lib/fen';
import {
  MoveTest,
  PERFT_POSITION_5,
  STARTING_POSITION,
} from '../lib/move-test';
import './Debug.css';
import { wrap } from 'comlink';
import {
  AvailableComputerVersions,
  ChessComputerWorkerConstructor,
} from '../ai/types';
import { squareLabel } from '../utils';
import { BUTTON_CSS } from './theme';

async function runMoveGenerationTest(
  logger: Subject<string>,
  test: MoveTest,
  toDepth = 4
) {
  const worker = new Worker(new URL('../workers/move-test', import.meta.url));

  worker.onmessage = (message: MessageEvent<string>) => {
    logger.next(message.data);
  };
  worker.postMessage({ test, toDepth });
}

async function runComputerNextMoveTest(logger: Subject<string>, fen: string) {
  const computers = await Promise.all(
    Object.keys(ComputerRegistry).map(async (version) => {
      const ChessComputerWorkerRemote = wrap<ChessComputerWorkerConstructor>(
        new Worker(new URL('../workers/ai', import.meta.url))
      );
      const instance = await new ChessComputerWorkerRemote();
      await instance.load(version as AvailableComputerVersions);
      return { version, ai: instance };
    })
  );

  await Promise.all(
    computers.map(async ({ ai, version }) => {
      const start = Date.now();
      const move = await ai.nextMove(fen);
      const timing = Date.now() - start;
      logger.next(
        `version=${version}; timing=${timing}ms; move=${squareLabel(
          move.from
        )}->${squareLabel(move.to)}`
      );
    })
  );
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
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'auto',
        }}
      >
        <button
          style={BUTTON_CSS}
          onClick={() => runMoveGenerationTest(logger, STARTING_POSITION)}
        >
          Move generation test
        </button>

        <button
          style={BUTTON_CSS}
          onClick={() => runMoveGenerationTest(logger, PERFT_POSITION_5, 3)}
        >
          Move generation test PERFT_5
        </button>

        <button
          style={BUTTON_CSS}
          onClick={() => runComputerNextMoveTest(logger, STARTING_POSITION_FEN)}
        >
          Move AI speed test
        </button>

        <button
          style={BUTTON_CSS}
          onClick={() =>
            runComputerNextMoveTest(logger, VIENNA_GAMBIT_ACCEPTED_FEN)
          }
        >
          Move AI speed test for vienna
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
