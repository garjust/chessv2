import React from 'react';
import { State } from '../workflow';
import { formatPosition } from '../lib/fen';
import { useWorkflow } from './workflow';

export type DisplayGameFENProps = {
  style?: React.CSSProperties;
};

const render = (state: State) => ({
  position: state.position,
});

const DisplayGameFEN = ({ style }: DisplayGameFENProps) => {
  const { rendering } = useWorkflow(render);

  const { position } = rendering;

  return (
    <pre style={{ ...style, margin: 0, fontSize: 12 }}>
      <code style={{ backgroundColor: 'aqua' }}>
        {formatPosition(position)}
      </code>
    </pre>
  );
};

export default DisplayGameFEN;
