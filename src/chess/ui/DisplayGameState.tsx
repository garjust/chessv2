import React from 'react';
import { State } from './workflow';
import { useWorkflow } from './workflow-context';
import { formatAsBytes, formatBits } from '../../lib/bits';
import { moveString } from '../move-notation';
import { Move } from '../types';

const isMove = (obj: object): obj is Move =>
  Object.prototype.hasOwnProperty.call(obj, 'from') &&
  Object.prototype.hasOwnProperty.call(obj, 'to');

function replacer(key: string, value: unknown) {
  if (key === 'evaluation') {
    return (value as number).toFixed(2);
  }

  if (key === 'zobrist') {
    const zobrist = value as [number, number];
    return `${zobrist[0]}:${zobrist[1]}`;
  }

  if (value instanceof Map) {
    return `{ size ${value.size} }`;
  }

  if (value instanceof Object) {
    if (isMove(value)) {
      return moveString(value);
    }
  }

  if (typeof value === 'symbol') {
    return value.toString();
  }

  if (typeof value === 'bigint') {
    return formatAsBytes(formatBits(value));
  }

  return value;
}

const DisplayGameState = ({ style }: { style?: React.CSSProperties }) => {
  const { rendering } = useWorkflow((state: State) => state);

  return (
    <pre style={{ ...style, fontSize: 14, margin: 0 }}>
      <code>{JSON.stringify(rendering, replacer, 2)}</code>
    </pre>
  );
};

export default DisplayGameState;
