import { BLANK_POSITION_FEN, parseFEN } from '../fen';
import { Color, Position, Piece, Square, SquareDef } from '../types';

export interface State {
  boardOrientation: Color;
  displaySquareLabels: boolean;
  humanPlayer: Color;
  position: Position;
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

export const pieceInSquare = (
  state: State,
  squareDef: SquareDef
): Piece | null =>
  state.position.pieces.find(
    (piece) =>
      piece.squareDef.rank === squareDef.rank &&
      piece.squareDef.file === squareDef.file
  )?.piece || null;
