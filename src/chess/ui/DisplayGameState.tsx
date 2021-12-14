import React from 'react';
import { formatPosition } from '../fen';
import { useWorkflow } from './workflow';

export type DisplayGameStateProps = {
  style?: React.CSSProperties;
};

const replacer = (key: string, value: unknown) => {
  switch (key) {
    case 'pieces':
      return 'Map { ... }';
    default:
      return value;
  }
};

const DisplayGameState = ({ style }: DisplayGameStateProps) => {
  const { state } = useWorkflow();
  return (
    <pre
      style={{
        ...style,
        display: 'grid',
        gridTemplateRows: 'auto min-content',
        gridTemplateColumns: 'min-content',
        gap: '1em',
      }}
    >
      <code>{JSON.stringify(state, replacer, 2)}</code>
      <code style={{ backgroundColor: 'aqua' }}>
        {formatPosition(state.position)}
      </code>
    </pre>
  );
};

export default DisplayGameState;
