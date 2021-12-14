import React from 'react';
import './Square.css';
import { Color, Square as SquareData } from '../types';
import { squareLabel } from '../utils';
import { pieceInSquare, squareIsSelected } from '../engine/state';
import Piece from './Piece';
import { BOARD_SQUARE_BLACK, BOARD_SQUARE_WHITE } from './theme';
import { useWorkflow } from './workflow';
import { clickSquareAction } from '../engine/action';

export type SquareProps = {
  color: Color;
} & SquareData;

const Square = ({ rank, file, color }: SquareProps) => {
  const { state, emit } = useWorkflow();

  const piece = pieceInSquare(state, { rank, file });
  const isSelected = squareIsSelected(state, { rank, file });
  const { selectedSquare } = state;

  let css: React.CSSProperties = {
    position: 'relative',
    cursor: piece || selectedSquare ? 'pointer' : 'inherit',
    gridArea: squareLabel({ rank, file }),
    backgroundColor:
      color === Color.White ? BOARD_SQUARE_WHITE : BOARD_SQUARE_BLACK,
  };

  if (isSelected) {
    css = { ...css, backgroundColor: 'rgba(83, 141, 199, 0.8)' };
  }

  return (
    <div
      className="square"
      style={css}
      onClick={() =>
        piece || selectedSquare ? emit(clickSquareAction({ rank, file })) : null
      }
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
