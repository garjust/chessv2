import React from 'react';
import StringKeyMap from '../../lib/string-key-map';
import { Square } from '../types';
import { squareLabel } from '../utils';
import { useWorkflow } from './workflow';

export type DisplayGameStateProps = {
  style?: React.CSSProperties;
};

const formatBitmapString = (bitmap: string): string => {
  const parts: string[] = [];
  for (let i = 0; i < 64; i += 8) {
    parts.push(bitmap.slice(i, i + 8));
  }

  return parts.join(':');
};

const replacer = (key: string, value: unknown) => {
  if (value instanceof StringKeyMap || value instanceof Map) {
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
  }

  if (key === 'blackPlayer' || key === 'whitePlayer') {
    return (value as symbol).toString();
  }

  if (typeof value === 'bigint') {
    return formatBitmapString(value.toString(2).padStart(64, '0'));
  }

  return value;
};

const DisplayGameState = ({ style }: DisplayGameStateProps) => {
  const { state } = useWorkflow();
  return (
    <pre style={{ ...style, fontSize: 14, margin: 0 }}>
      <code>{JSON.stringify(state, replacer, 2)}</code>
    </pre>
  );
};

export default DisplayGameState;
