import { ChessComputer } from '../ai/types';
import { BLANK_POSITION_FEN, parseFEN } from '../fen';
import {
  Color,
  Position,
  Piece,
  Square,
  ComputedPositionData,
  PieceType,
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
    movesByPiece: new Map<PieceType, SquareMap<Square[]>>(),
    totalMoves: 0,
    availableCaptures: [],
    availableChecks: [],
    checksOnSelf: [],
    checkmate: false,
    evaluation: 0,
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
