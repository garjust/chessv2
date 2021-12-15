import React from 'react';
import { formatPosition } from '../fen';
import { useWorkflow } from './workflow';

export type DisplayGameFENProps = {
  style?: React.CSSProperties;
};

const DisplayGameFEN = ({ style }: DisplayGameFENProps) => {
  const { state } = useWorkflow();
  return (
    <pre style={style}>
      <code style={{ backgroundColor: 'aqua' }}>
        {formatPosition(state.position)}
      </code>
    </pre>
  );
};

export default DisplayGameFEN;
