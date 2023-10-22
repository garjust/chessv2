import React from 'react';
import { Color } from '../types';
import { State } from './workflow';
import { useWorkflow } from './workflow-context';

export type DisplayClockProps = {
  style?: React.CSSProperties;
};

const render = (state: State) => ({
  whiteMs: state.clocks.WHITE,
  blackMs: state.clocks.BLACK,
  boardOrientation: state.boardOrientation,
});

const format = (ms: number): string => {
  const seconds = ms / 1000;
  const remainder = Math.round(seconds % 60);
  let remainderString: string;
  if (remainder === 0) {
    remainderString = '00';
  } else if (remainder <= 9) {
    remainderString = `0${remainder}`;
  } else {
    remainderString = remainder.toString();
  }

  return `${Math.floor(seconds / 60).toFixed(0)}:${remainderString}`;
};

const CLOCK_STYLING: React.CSSProperties = {
  padding: 32,
  fontSize: 32,
};

const DisplayClock = ({ style }: DisplayClockProps) => {
  const { rendering } = useWorkflow(render);

  const { whiteMs, blackMs, boardOrientation } = rendering;

  return (
    <div
      style={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        justifyContent: 'center',
      }}
    >
      <span style={{ ...CLOCK_STYLING, borderBottom: '1px solid black' }}>
        {boardOrientation === Color.White ? format(blackMs) : format(whiteMs)}
      </span>
      <span style={{ ...CLOCK_STYLING }}>
        {boardOrientation === Color.White ? format(whiteMs) : format(blackMs)}
      </span>
    </div>
  );
};

export default DisplayClock;
