import React from 'react';
import { State } from './workflow';
import { formatPosition } from '../lib/fen';
import { useWorkflow } from './workflow-context';

const render = (state: State) => ({
  position: state.game.position,
});

const DisplayGameFEN = ({ style }: { style?: React.CSSProperties }) => {
  const { rendering } = useWorkflow(render);

  const { position } = rendering;

  return (
    <pre style={{ ...style, margin: 0, fontSize: 12, justifySelf: 'center' }}>
      <code
        style={{
          // backgroundColor: 'var(--color-primary)',
          color: 'var(--color-white)',
          padding: 4,
        }}
      >
        {formatPosition(position)}
      </code>
    </pre>
  );
};

export default DisplayGameFEN;
