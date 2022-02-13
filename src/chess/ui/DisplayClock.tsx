import React from 'react';
import { State } from '../workflow';
import { ChessComputerWrapped } from '../workflow/state';
import { useWorkflow } from './workflow';

export type DisplayClockProps = {
  style?: React.CSSProperties;
};

const render = (state: State) => ({
  whiteMs: state.clocks.WHITE,
  blackMs: state.clocks.BLACK,
});

const DisplayClock = ({ style }: DisplayClockProps) => {
  const { rendering } = useWorkflow(render);

  const { whiteMs, blackMs } = rendering;

  return (
    <div style={{ ...style }}>
      BLACK: {blackMs / 1000}
      <br />
      <br />
      WHITE: {whiteMs / 1000}
    </div>
  );
};

export default DisplayClock;
