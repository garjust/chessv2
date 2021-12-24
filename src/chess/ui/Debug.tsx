import React, { CSSProperties, useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import {
  MoveTest,
  PERFT_POSITION_5,
  STARTING_POSITION,
} from '../lib/move-test';
import './Debug.css';

const BUTTON_CSS: CSSProperties = {
  padding: 16,
  cursor: 'pointer',
};

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
          Move Generation Test
        </button>

        <button
          style={BUTTON_CSS}
          onClick={() => runMoveGenerationTest(logger, PERFT_POSITION_5, 3)}
        >
          Move Generation Test PERFT_5
        </button>
      </div>
      <pre style={{ gridArea: 'log' }}>
        {log.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </pre>
    </div>
  );
};

export default Debug;
