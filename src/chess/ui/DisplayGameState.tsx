import React from 'react';
import { useWorkflow } from './workflow';

export type DisplayGameStateProps = {
  style?: React.CSSProperties;
};

const DisplayGameState = ({ style }: DisplayGameStateProps) => {
  const { state } = useWorkflow();

  return (
    <pre style={style}>
      <code>{JSON.stringify(state)}</code>
    </pre>
  );
};

export default DisplayGameState;
