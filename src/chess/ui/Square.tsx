import React from 'react';
import './Square.css';
import { Color, PieceType } from '../types';
import { squareLabel } from '../utils';
import {
  State,
  isSquareClickable,
  pieceInSquare,
  SquareLabel,
  SquareOverlayType,
  showHeatmap,
} from '../workflow/state';
import {
  BOARD_SQUARE_BLACK,
  BOARD_SQUARE_CAPTURABLE,
  BOARD_SQUARE_CHECK,
  BOARD_SQUARE_MOVABLE,
  BOARD_SQUARE_SELECTED,
  BOARD_SQUARE_WHITE,
  BOARD_SQUARE_LAST_MOVE,
  BOARD_SQUARE_ATTACKED,
} from './theme';
import { useWorkflow } from './workflow';
import { clickSquareAction } from '../workflow/action';
import Piece from './Piece';
import { HEATMAPS, HEATMAP_MULTIPLIER } from '../lib/heatmaps';

const DEFAULT_HEATMAP = HEATMAPS[PieceType.Rook][Color.White];

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
    squareLabels: state.squareLabels,
    showHeatmap: showHeatmap(state),
  });

const Square = (props: SquareProps) => {
  const { rendering, emit } = useWorkflow(makeRender(props));

  const { square, color } = props;
  const { piece, overlay, isClickable, squareLabels, showHeatmap } = rendering;

  let css: React.CSSProperties = {
    position: 'relative',
    cursor: isClickable ? 'pointer' : 'inherit',
    gridArea: squareLabel(square),
    backgroundColor:
      color === Color.White ? BOARD_SQUARE_WHITE : BOARD_SQUARE_BLACK,
  };

  if (showHeatmap) {
    const value = DEFAULT_HEATMAP[square] / HEATMAP_MULTIPLIER;
    const adjusted = (value + 1) / 10 + 0.65;
    css = {
      ...css,
      ...BOARD_SQUARE_SELECTED,
      filter: `brightness(${adjusted})`,
    };
  } else if (overlay) {
    switch (overlay) {
      case SquareOverlayType.Attacked:
        css = { ...css, ...BOARD_SQUARE_ATTACKED };
        break;
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

  let label: string | null = null;
  if (squareLabels === SquareLabel.Index) {
    label = square.toString();
  } else if (squareLabels === SquareLabel.Square) {
    label = squareLabel(square);
  }

  return (
    <div
      className="square"
      style={css}
      onClick={() => (isClickable ? emit(clickSquareAction(square)) : null)}
      tabIndex={0}
    >
      {piece ? <Piece type={piece.type} color={piece.color} /> : null}
      {label ? (
        <span
          style={{
            position: 'absolute',
            left: 0,
          }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
};

export default Square;
