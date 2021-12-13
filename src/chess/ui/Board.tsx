import React from 'react';
import { Color } from '../color';
import './Board.css';
import Square from './Square';
import { useWorkflow } from './WorkflowContext';

const rankIndexToChar = (index: number): string =>
  String.fromCharCode(index + 97);

const indicesToSquare = (rank: number, file: number): string =>
  `${rankIndexToChar(rank)}${file + 1}`;

export type BoardProps = {
  squareSize: number;
};

const Board = ({ squareSize }: BoardProps) => {
  const { state } = useWorkflow();

  const squares: JSX.Element[] = [];
  for (let rank = 0; rank <= 8; rank++) {
    for (let file = 0; file <= 8; file++) {
      const square = indicesToSquare(rank, file);
      squares.push(
        <Square
          key={square}
          label={square}
          color={(rank + file) % 2 == 0 ? Color.Black : Color.White}
        />
      );
    }
  }

  return (
    <div>
      <div
        className={
          state.boardOrientation === Color.White
            ? 'board'
            : 'board board--flipped'
        }
        style={{
          height: squareSize * 8,
          width: squareSize * 8,
          borderColor: 'black',
          borderWidth: '2px',
          borderStyle: 'solid',
        }}
      >
        {squares}
      </div>
    </div>
  );
};

export default Board;
