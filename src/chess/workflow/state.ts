import { Color, FEN, Piece, Square, SquareDef } from '../types';
import { buildBoard, findPiecesInboard, squareInBoard } from '../utils';

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

export const fenForPosition = (state: State): FEN => {
  const { turn } = state;

  return {
    pieces: findPiecesInboard(state.board),
    turn,
    castlingAvailability: {
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true,
    },
    enPassantSquare: null,
    halfMoveCount: 6,
    fullMoveCount: 36,
  };
};
