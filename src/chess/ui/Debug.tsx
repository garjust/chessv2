import React, { useEffect, useState } from 'react';
import { Observer, Subject } from 'rxjs';
import { ComputerRegistry } from '../ai';
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
import { moveString } from '../utils';
import { BUTTON_CSS } from './theme';
import { loadComputer } from '../workers';
import { formatNumber } from '../../lib/formatter';

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
  const ai = await loadComputer('v6');

  const fens = [STARTING_POSITION_FEN, VIENNA_OPENING_FEN, PERFT_5_FEN];

  for (const fen of fens) {
    const start = Date.now();
    await ai.nextMove(parseFEN(fen));
    const timing = Date.now() - start;
    const diagnostics = await ai.searchDiagnostics;
    logger.next(
      `ai=${diagnostics.label}; timing=${formatNumber(
        timing
      )}ms; nodes=${formatNumber(diagnostics.result?.totalNodes)}`
    );
    console.log(diagnostics.label, diagnostics.result);
  }

  logger.next('--');
}

async function runComputerNextMoveTest(logger: Observer<string>, fen: string) {
  const computers = await Promise.all(
    Object.keys(ComputerRegistry).map(async (version) => {
      return {
        version,
        ai: await loadComputer(version as AvailableComputerVersions),
      };
    })
  );

  for (const { version, ai } of computers) {
    if (['v1', 'v2'].includes(version)) {
      continue;
    }

    const start = Date.now();
    await ai.nextMove(parseFEN(fen));
    const timing = Date.now() - start;
    const diagnostics = await ai.searchDiagnostics;
    logger.next(
      `ai=${diagnostics.label}; timing=${formatNumber(
        timing
      )}ms; nodes=${formatNumber(
        diagnostics.result?.totalNodes
      )}; cuts=${formatNumber(diagnostics.result?.totalCuts)}`
    );
    console.log(diagnostics.label, diagnostics.result);
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
          onClick={() => runComputerNextMoveTest(logger, STARTING_POSITION_FEN)}
        >
          Move AI perft
        </button>

        <button
          style={BUTTON_CSS}
          onClick={() => runComputerNextMoveTest(logger, PERFT_5_FEN)}
        >
          Move AI perft PERFT_5
        </button>

        <button
          style={BUTTON_CSS}
          onClick={() => runComputerNextMoveTest(logger, VIENNA_OPENING_FEN)}
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
