import React from 'react';
import StringKeyMap from '../../lib/string-key-map';
import { formatPosition } from '../fen';
import { useWorkflow } from './workflow';

export type DisplayGameStateProps = {
  style?: React.CSSProperties;
};

const replacer = (key: string, value: unknown) => {
  switch (key) {
    case 'pieces':
    case 'squareOverlay':
      if (value instanceof StringKeyMap) {
        return `Map { size ${value.size} }`;
      } else {
        return value;
      }
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
