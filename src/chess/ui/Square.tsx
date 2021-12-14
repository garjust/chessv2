import React from 'react';
import './Square.css';
import { Color, Square as SquareData } from '../types';
import { squareLabel } from '../utils';
import {
  pieceInSquare,
  squareOverlay,
  SquareOverlayType,
} from '../engine/state';
import Piece from './Piece';
import {
  BOARD_SQUARE_BLACK,
  BOARD_SQUARE_CAPTURABLE,
  BOARD_SQUARE_MOVABLE,
  BOARD_SQUARE_SELECTED,
  BOARD_SQUARE_WHITE,
} from './theme';
import { useWorkflow } from './workflow';
import { clickSquareAction } from '../engine/action';

export type SquareProps = {
  color: Color;
} & SquareData;

const Square = ({ rank, file, color }: SquareProps) => {
  const { state, emit } = useWorkflow();

  const { position, selectedSquare } = state;
  const piece = pieceInSquare(state, { rank, file });
  const overlay = squareOverlay(state, { rank, file });

  const isClickable =
    selectedSquare || (piece && piece.color === position.turn);

  let css: React.CSSProperties = {
    position: 'relative',
    cursor: isClickable ? 'pointer' : 'inherit',
    gridArea: squareLabel({ rank, file }),
    backgroundColor:
      color === Color.White ? BOARD_SQUARE_WHITE : BOARD_SQUARE_BLACK,
  };

  if (overlay) {
    switch (overlay) {
      case SquareOverlayType.SelectedPiece:
        css = { ...css, backgroundColor: BOARD_SQUARE_SELECTED };
        break;
      case SquareOverlayType.Capturable:
        css = { ...css, backgroundColor: BOARD_SQUARE_CAPTURABLE };
        break;
      case SquareOverlayType.Movable:
        css = { ...css, backgroundColor: BOARD_SQUARE_MOVABLE };
        break;
    }
  }

  return (
    <div
      className="square"
      style={css}
      onClick={() =>
        isClickable ? emit(clickSquareAction({ rank, file })) : null
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
