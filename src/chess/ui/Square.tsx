import React from 'react';
import './Square.css';
import { Color } from '../types';
import { squareLabel } from '../utils';
import {
  State,
  isSquareClickable,
  pieceInSquare,
  SquareOverlayType,
} from '../workflow/state';
import {
  BOARD_SQUARE_BLACK,
  BOARD_SQUARE_CAPTURABLE,
  BOARD_SQUARE_CHECK,
  BOARD_SQUARE_MOVABLE,
  BOARD_SQUARE_SELECTED,
  BOARD_SQUARE_WHITE,
  BOARD_SQUARE_LAST_MOVE,
} from './theme';
import { useWorkflow } from './workflow';
import { clickSquareAction } from '../workflow/action';
import Piece from './Piece';

export type SquareProps = {
  color: Color;
  square: number;
};

const makeRender =
  ({ square }: Pick<SquareProps, 'square'>) =>
  (state: State) => ({
    piece: pieceInSquare(state, square),
    overlay: state.squareOverlay?.get(square),
    isClickable: isSquareClickable(state, square),
    displaySquareLabels: state.displaySquareLabels,
  });

const Square = (props: SquareProps) => {
  const { rendering, emit } = useWorkflow(makeRender(props));

  const { square, color } = props;
  const { piece, overlay, isClickable, displaySquareLabels } = rendering;

  let css: React.CSSProperties = {
    position: 'relative',
    cursor: isClickable ? 'pointer' : 'inherit',
    gridArea: squareLabel(square),
    backgroundColor:
      color === Color.White ? BOARD_SQUARE_WHITE : BOARD_SQUARE_BLACK,
  };

  if (overlay) {
    switch (overlay) {
      case SquareOverlayType.Capturable:
        css = { ...css, ...BOARD_SQUARE_CAPTURABLE };
        break;
      case SquareOverlayType.Check:
        css = { ...css, ...BOARD_SQUARE_CHECK };
        break;
      case SquareOverlayType.LastMove:
        css = { ...css, ...BOARD_SQUARE_LAST_MOVE };
        break;
      case SquareOverlayType.Movable:
        css = { ...css, ...BOARD_SQUARE_MOVABLE };
        break;
      case SquareOverlayType.SelectedPiece:
        css = { ...css, ...BOARD_SQUARE_SELECTED };
        break;
    }
  }

  return (
    <div
      className="square"
      style={css}
      onClick={() => (isClickable ? emit(clickSquareAction(square)) : null)}
      tabIndex={0}
    >
      {piece !== undefined ? (
        <Piece type={piece.type} color={piece.color} />
      ) : null}
      <span
        style={{
          position: 'absolute',
          left: 0,
          opacity: displaySquareLabels ? 1 : 0,
        }}
      >
        {squareLabel(square)}
      </span>
    </div>
  );
};

export default Square;
