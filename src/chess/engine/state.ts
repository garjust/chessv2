import { BLANK_POSITION_FEN, parseFEN } from '../fen';
import { Color, Position, Piece, Square, ComputedPositionData } from '../types';
import { SquareMap } from '../utils';

export enum SquareOverlayType {
  SelectedPiece = 'SELECTED_PIECE',
  Movable = 'MOVABLE',
  Capturable = 'CAPTURABLE',
  Check = 'CHECK',
}

export interface State {
  debugVersion?: number;
  boardOrientation: Color;
  displaySquareLabels: boolean;
  humanPlayer: Color;
  position: Position;
  computedPositionData?: ComputedPositionData;
  selectedSquare?: Square;
  squareOverlay?: SquareMap<SquareOverlayType>;
}

const INITIAL_STATE: State = {
  debugVersion: 0,
  boardOrientation: Color.White,
  displaySquareLabels: false,
  humanPlayer: Color.White,
  position: parseFEN(BLANK_POSITION_FEN),
};

export const createState = (overrides: Partial<State> = {}): State => ({
  ...INITIAL_STATE,
  ...overrides,
});

export const pieceInSquare = (state: State, square: Square): Piece | null =>
  state.position.pieces.get(square) || null;

export const squareIsSelected = (state: State, square: Square) =>
  state.selectedSquare &&
  state.selectedSquare.rank === square.rank &&
  state.selectedSquare.file === square.file;

export const squareOverlay = (state: State, square: Square) =>
  state.squareOverlay?.get(square);
