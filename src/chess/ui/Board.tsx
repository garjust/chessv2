import React from 'react';
import { Color } from '../types';
import { squareGenerator, squareLabel } from '../utils';
import './Board.css';
import Square from './Square';
import { useWorkflow } from './workflow';

export type BoardProps = {
  squareSize: number;
  style?: React.CSSProperties;
};

const Board = ({ squareSize, style }: BoardProps) => {
  const { state } = useWorkflow();

  const squares: JSX.Element[] = [];
  for (const { rank, file } of squareGenerator()) {
    squares.push(
      <Square
        key={squareLabel({ rank, file })}
        rank={rank}
        file={file}
        color={(rank + file) % 2 == 0 ? Color.Black : Color.White}
      />
    );
  }

  return (
    <div
      className={
        state.boardOrientation === Color.White
          ? 'board'
          : 'board board--flipped'
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
