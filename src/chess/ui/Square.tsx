import React from 'react';
import './Square.css';
import { Color, Square as SquareData } from '../types';
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
} & SquareData;

const makeRender =
  ({ rank, file }: Pick<SquareProps, 'rank' | 'file'>) =>
  (state: State) => ({
    piece: pieceInSquare(state, { rank, file }),
    overlay: state.squareOverlay?.get({ rank, file }),
    isClickable: isSquareClickable(state, { rank, file }),
    displaySquareLabels: state.displaySquareLabels,
  });

const Square = (props: SquareProps) => {
  const { rendering, emit } = useWorkflow(makeRender(props));

  const { rank, file, color } = props;
  const { piece, overlay, isClickable, displaySquareLabels } = rendering;

  let css: React.CSSProperties = {
    position: 'relative',
    cursor: isClickable ? 'pointer' : 'inherit',
    gridArea: squareLabel({ rank, file }),
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
      onClick={() =>
        isClickable ? emit(clickSquareAction({ rank, file })) : null
      }
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
        {squareLabel({ rank, file })}
      </span>
    </div>
  );
};

export default Square;
