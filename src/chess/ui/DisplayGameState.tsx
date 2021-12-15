import React from 'react';
import StringKeyMap from '../../lib/string-key-map';
import { formatPosition } from '../fen';
import { Square } from '../types';
import { squareLabel } from '../utils';
import { useWorkflow } from './workflow';

export type DisplayGameStateProps = {
  style?: React.CSSProperties;
};

const replacer = (key: string, value: unknown) => {
  if (value instanceof StringKeyMap) {
    return `{ Map of size ${value.size} }`;
  }

  if (value instanceof Object) {
    const valueKeys = Object.keys(value);
    if (
      valueKeys.length === 2 &&
      valueKeys.includes('file') &&
      valueKeys.includes('rank')
    ) {
      return `{ ${squareLabel(value as Square)} }`;
    }
  }

  return value;
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
