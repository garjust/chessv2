import React from 'react';
import './Square.css';
import { Color, SquareDef } from '../types';
import { squareLabel } from '../utils';
import { pieceInSquare } from '../engine/state';
import Piece from './Piece';
import { BOARD_SQUARE_BLACK, BOARD_SQUARE_WHITE } from './theme';
import { useWorkflow } from './workflow';

export type SquareProps = {
  color: Color;
} & SquareDef;

const Square = ({ rank, file, color }: SquareProps) => {
  const { state } = useWorkflow();

  const piece = pieceInSquare(state, { rank, file });

  return (
    <div
      className="square"
      style={{
        position: 'relative',
        gridArea: squareLabel({ rank, file }),
        backgroundColor:
          color === Color.White ? BOARD_SQUARE_WHITE : BOARD_SQUARE_BLACK,
      }}
      tabIndex={0}
    >
      {piece !== null ? <Piece type={piece.type} color={piece.color} /> : ''}
      <span
        style={{
          position: 'absolute',
          left: 0,
          opacity: state.displaySquareLabels ? 1 : 0,
        }}
      >
        {squareLabel({ rank, file })}
      </span>
    </div>
  );
};

export default Square;
