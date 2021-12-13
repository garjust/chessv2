import { Color, Piece, Square, SquareDef } from '../types';
import { buildBoard, squareInBoard } from '../utils';

export interface State {
  boardOrientation: Color;
  board: Square[][];
  displaySquareLabels: boolean;
  humanPlayer: Color;
  turn: Color;
}

const INITIAL_STATE: State = {
  boardOrientation: Color.White,
  board: buildBoard(),
  displaySquareLabels: true,
  humanPlayer: Color.White,
  turn: Color.White,
};

export const createState = (overrides: Partial<State> = {}): State => ({
  ...INITIAL_STATE,
  ...overrides,
});

export const pieceInSquare = (
  state: State,
  squareDef: SquareDef
): Piece | null => squareInBoard(state.board, squareDef).piece;
