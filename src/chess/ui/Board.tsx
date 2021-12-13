import React from 'react';
import './Board.css';
import { BOARD_SQUARE_BLACK, BOARD_SQUARE_WHITE } from './theme';

const rankIndexToChar = (index: number): string =>
  String.fromCharCode(index + 97);

const indicesToSquare = (rank: number, file: number): string =>
  `${rankIndexToChar(rank)}${file + 1}`;

export type BoardProps = {
  squareSize: number;
};

const Board = ({ squareSize }: BoardProps) => {
  const squares: JSX.Element[] = [];
  for (let rank = 0; rank <= 8; rank++) {
    for (let file = 0; file <= 8; file++) {
      const square = indicesToSquare(rank, file);
      squares.push(
        <div
          key={square}
          style={{
            gridArea: square,
            backgroundColor:
              (rank + file) % 2 == 0 ? BOARD_SQUARE_BLACK : BOARD_SQUARE_WHITE,
          }}
        ></div>
      );
    }
  }

  return (
    <div
      className="board"
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
  );
};

export default Board;
