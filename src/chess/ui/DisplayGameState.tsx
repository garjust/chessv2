import React from 'react';
import { useWorkflow } from './workflow';

export type DisplayGameStateProps = {
  style?: React.CSSProperties;
};

const replacer = (key: string, value: unknown) => {
  switch (key) {
    case 'board':
      return '...';
    default:
      return value;
  }
};

const DisplayGameState = ({ style }: DisplayGameStateProps) => {
  const { state } = useWorkflow();

  return (
    <pre style={style}>
      <code>{JSON.stringify(state, replacer, 2)}</code>
    </pre>
  );
};

export default DisplayGameState;
