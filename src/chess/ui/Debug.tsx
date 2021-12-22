import React, { CSSProperties, useEffect, useState } from 'react';
import { Observable, Subject } from 'rxjs';
import { parseFEN, STARTING_POSITION_FEN } from '../lib/fen';
import { countMoves, isCountCorrectForDepthFromStart } from '../lib/move-test';
import './Debug.css';

const BUTTON_CSS: CSSProperties = {
  padding: 16,
  cursor: 'pointer',
};

function runMoveGenerationTest(logger: Subject<string>, toDepth = 4) {
  const position = parseFEN(STARTING_POSITION_FEN);

  for (let i = 1; i <= toDepth; i++) {
    const start = Date.now();
    const count = countMoves(position, i);
    const timing = Date.now() - start;
    const passed = isCountCorrectForDepthFromStart(i, count);
    logger.next(
      `depth=${i}; count=${count}; timing=${timing}ms; passed=${
        passed ? 'yes' : 'no'
      }`
    );
  }
}

const Debug = () => {
  const [logger] = useState(new Subject<string>());
  const [log, setLog] = useState([] as string[]);

  useEffect(() => {
    console.log('subscribe');
    const subscription = logger.subscribe((str) => {
      setLog((log) => [...log, str]);
    });

    return function cleanup() {
      subscription.unsubscribe();
    };
  }, [logger]);

  return (
    <div className="debug">
      <div style={{ gridArea: 'buttons' }}>
        <button onClick={() => runMoveGenerationTest(logger)}>
          Move Generation
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
