import React from 'react';
import { State } from '../workflow';
import { Color } from '../types';
import { rankFileToSquare, squareGenerator } from '../utils';
import './Board.css';
import Square from './Square';
import { useWorkflow } from './workflow';

export type BoardProps = {
  squareSize: number;
  style?: React.CSSProperties;
};

const render = (state: State) => ({
  boardOrientation: state.boardOrientation,
});

const Board = ({ squareSize, style }: BoardProps) => {
  const { rendering } = useWorkflow(render);

  const { boardOrientation } = rendering;

  const squares: JSX.Element[] = [];
  for (const square of squareGenerator()) {
    squares.push(
      <Square
        key={rankFileToSquare(square)}
        square={rankFileToSquare(square)}
        color={(square.rank + square.file) % 2 == 0 ? Color.Black : Color.White}
      />,
    );
  }

  return (
    <div
      className={
        boardOrientation === Color.White ? 'board' : 'board board--flipped'
      }
      style={{
        ...style,
        height: squareSize * 8,
        width: squareSize * 8,
        borderColor: 'black',
        borderWidth: '2px',
        borderStyle: 'solid',
      }}
    >
      {squares}
    </div>
  );
};

export default Board;
