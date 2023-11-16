import React from 'react';
import { Color } from '../types';
import { State } from './workflow';
import { useWorkflow } from './workflow-context';

const SCRAMBLE_CUTOFF_MS = 10000;

// Round the clock numbers if they are larger than the scarmble cutoff since
// the precision would not be rendered.
const render = (state: State) => ({
  whiteSeconds:
    state.game.clocks[Color.White] >= SCRAMBLE_CUTOFF_MS
      ? Math.round(state.game.clocks[Color.White] / 1000)
      : state.game.clocks[Color.White] / 1000,
  blackSeconds:
    state.game.clocks[Color.Black] >= SCRAMBLE_CUTOFF_MS
      ? Math.round(state.game.clocks[Color.Black] / 1000)
      : state.game.clocks[Color.Black] / 1000,
  boardOrientation: state.boardOrientation,
});

const format = (seconds: number): string => {
  const remainder = seconds % 60;
  if (seconds >= SCRAMBLE_CUTOFF_MS / 1000) {
    return `${Math.floor(seconds / 60).toFixed(0)}:${remainder
      .toFixed(0)
      .padStart(2, '0')}`;
  } else {
    return `${remainder.toFixed(1).padStart(4, '0')}`;
  }
};

const CLOCK_STYLING: React.CSSProperties = {
  padding: 24,
  fontSize: 32,
};

const DisplayClock = ({ style }: { style?: React.CSSProperties }) => {
  const { rendering } = useWorkflow(render);
  const { whiteSeconds, blackSeconds, boardOrientation } = rendering;

  return (
    <div
      style={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: 120,
      }}
    >
      <span
        style={{
          ...CLOCK_STYLING,
          borderBottom: '1px solid',
          borderBottomColor: '--var(color-white)',
        }}
      >
        {boardOrientation === Color.White
          ? format(blackSeconds)
          : format(whiteSeconds)}
      </span>
      <span style={{ ...CLOCK_STYLING }}>
        {boardOrientation === Color.White
          ? format(whiteSeconds)
          : format(blackSeconds)}
      </span>
    </div>
  );
};

export default DisplayClock;
