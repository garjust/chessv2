import { ChessComputer } from '../ai/types';
import { BLANK_POSITION_FEN, parseFEN } from '../lib/fen';
import {
  Color,
  Position,
  Piece,
  Square,
  ComputedPositionData,
  PieceType,
  MoveWithExtraData,
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
  players: {
    [Color.White]: Player;
    [Color.Black]: Player;
  };
  selectedSquare?: Square;
  squareOverlay?: SquareMap<SquareOverlayType>;
  position: Position;
  computedPositionData: ComputedPositionData;
}

const INITIAL_STATE: State = {
  debugVersion: 0,
  boardOrientation: Color.White,
  displaySquareLabels: false,
  players: {
    [Color.White]: HumanPlayer,
    [Color.Black]: HumanPlayer,
  },
  position: parseFEN(BLANK_POSITION_FEN),
  computedPositionData: {
    movesByPiece: new Map<PieceType, SquareMap<MoveWithExtraData[]>>(),
    opponentMovesByPiece: new Map<PieceType, SquareMap<MoveWithExtraData[]>>(),
    totalMoves: 0,
    availableCaptures: [],
    availableAttacks: [],
    availableChecks: [],
    checksOnSelf: [],
    checkmate: false,
    evaluation: 0,
    bitmaps: {},
  },
};

export const createState = (overrides: Partial<State> = {}): State => ({
  ...INITIAL_STATE,
  ...overrides,
});

export const pieceInSquare = (
  state: State,
  square: Square
): Piece | undefined => state.position.pieces.get(square);

export const squareIsSelected = (state: State, square: Square) =>
  state.selectedSquare &&
  state.selectedSquare.rank === square.rank &&
  state.selectedSquare.file === square.file;

export const squareOverlay = (state: State, square: Square) =>
  state.squareOverlay?.get(square);

export const isSquareClickable = (state: State, square: Square): boolean => {
  if (
    (state.position.turn === Color.White &&
      state.players[Color.White] !== HumanPlayer) ||
    (state.position.turn === Color.Black &&
      state.players[Color.Black] !== HumanPlayer)
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
