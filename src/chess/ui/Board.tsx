import React from 'react';
import { State } from './workflow';
import { Color } from '../types';
import { rankFileToSquare, squareGenerator } from '../utils';
import './Board.css';
import BoardSquare from './BoardSquare';
import { useWorkflow } from './workflow-context';
import { BOARD_BORDER } from './theme';

const render = (state: State) => ({
  boardOrientation: state.boardOrientation,
});

const Board = ({
  squareSize,
  style,
}: {
  squareSize: number;
  style?: React.CSSProperties;
}) => {
  const { rendering } = useWorkflow(render);

  const { boardOrientation } = rendering;

  const squares: JSX.Element[] = [];
  for (const square of squareGenerator()) {
    squares.push(
      <BoardSquare
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
        backgroundColor: BOARD_BORDER,
      }}
    >
      {squares}
    </div>
  );
};

export default Board;
