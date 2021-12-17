import { ChessComputer } from '../ai/types';
import { BLANK_POSITION_FEN, parseFEN } from '../fen';
import {
  Color,
  Position,
  Piece,
  Square,
  ComputedPositionData,
  PieceType,
  MoveDetail,
} from '../types';
import { SquareMap } from '../utils';

export enum SquareOverlayType {
  SelectedPiece = 'SELECTED_PIECE',
  Movable = 'MOVABLE',
  Capturable = 'CAPTURABLE',
  Check = 'CHECK',
}

export const HumanPlayer = Symbol('HUMAN');

export type Player = typeof HumanPlayer | ChessComputer;

export interface State {
  debugVersion?: number;
  boardOrientation: Color;
  displaySquareLabels: boolean;
  blackPlayer: Player;
  whitePlayer: Player;
  selectedSquare?: Square;
  squareOverlay?: SquareMap<SquareOverlayType>;
  position: Position;
  computedPositionData: ComputedPositionData;
}

const INITIAL_STATE: State = {
  debugVersion: 0,
  boardOrientation: Color.White,
  displaySquareLabels: false,
  blackPlayer: HumanPlayer,
  whitePlayer: HumanPlayer,
  position: parseFEN(BLANK_POSITION_FEN),
  computedPositionData: {
    movesByPiece: new Map<PieceType, SquareMap<MoveDetail[]>>(),
    opponentMovesByPiece: new Map<PieceType, SquareMap<MoveDetail[]>>(),
    totalMoves: 0,
    availableCaptures: [],
    availableAttacks: [],
    availableChecks: [],
    checksOnSelf: [],
    checkmate: false,
    evaluation: 0,
    bit: {},
  },
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

export const isSquareClickable = (state: State, square: Square): boolean => {
  if (
    (state.position.turn === Color.White &&
      state.whitePlayer !== HumanPlayer) ||
    (state.position.turn === Color.Black && state.blackPlayer !== HumanPlayer)
  ) {
    return false;
  }

  if (state.selectedSquare) {
    return true;
  }

  const piece = pieceInSquare(state, square);
  if (piece && piece.color === state.position.turn) {
    return true;
  }

  return false;
};
