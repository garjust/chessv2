import React from 'react';
import { State } from '../workflow';
import { ChessComputerWrapped } from '../workflow/state';
import { Square } from '../types';
import { squareLabel } from '../utils';
import { useWorkflow } from './workflow';
import { formatBitboard } from '../lib/bitboard-def';

export type DisplayGameStateProps = {
  style?: React.CSSProperties;
};

const render = (state: State) => ({
  state,
});

function replacer(key: string, value: unknown) {
  if (key === 'evaluation') {
    return (value as number).toPrecision(6);
  }

  if (value instanceof Map) {
    return `{ size ${value.size} }`;
  }

  if (value instanceof Array) {
    return `[ length ${value.length} ]`;
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((value as any).__computer) {
      return (value as ChessComputerWrapped).label;
    }
  }

  if (typeof value === 'symbol') {
    return value.toString();
  }

  if (typeof value === 'bigint') {
    return formatBitboard(value);
  }

  return value;
}

const DisplayGameState = ({ style }: DisplayGameStateProps) => {
  const { rendering } = useWorkflow(render);

  const { state } = rendering;

  return (
    <pre style={{ ...style, fontSize: 14, margin: 0 }}>
      <code>{JSON.stringify(state, replacer, 2)}</code>
    </pre>
  );
};

export default DisplayGameState;
