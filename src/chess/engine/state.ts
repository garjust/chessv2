import StringKeyMap from '../../lib/string-key-map';
import { BLANK_POSITION_FEN, parseFEN } from '../fen';
import { Color, Position, Piece, Square } from '../types';

export enum SquareOverlayType {
  SelectedPiece = 'SELECTED_PIECE',
  Movable = 'MOVABLE',
  Capturable = 'CAPTURABLE',
}

export interface State {
  boardOrientation: Color;
  displaySquareLabels: boolean;
  humanPlayer: Color;
  position: Position;
  selectedSquare?: Square;
  squareOverlay?: StringKeyMap<Square, SquareOverlayType>;
}

const INITIAL_STATE: State = {
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
