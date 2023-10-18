import { Color, Move, Position, Square } from '../../types';
import { WrappedSearchEngine } from './state';

export enum Type {
  AttemptComputerMove = 'ATTEMPT_COMPUTER_MOVE',
  ChangeOverlay = 'CHANGE_OVERLAY',
  ChessComputerLoaded = 'CHESS_COMPUTER_LOADED',
  ClickSquare = 'CLICK_SQUARE',
  FlipBoard = 'FLIP_BOARD',
  LoadChessComputer = 'LOAD_CHESS_COMPUTER',
  MovePiece = 'MOVE_PIECE',
  OverlaySquares = 'OVERLAY_SQUARES',
  PreviousPosition = 'PREVIOUS_POSITION',
  ReceiveComputerMove = 'RECEIVE_COMPUTER_MOVE',
  ResetOverlay = 'RESET_OVERLAY',
  SetPosition = 'SET_POSITION',
  SetPositionFromFEN = 'SET_POSITION_FROM_FEN',
  TickPlayersClock = 'TICK_PLAYERS_CLOCK',
  ToggleSquareLabels = 'TOGGLE_SQUARE_LABELS',
}

export interface AttemptComputerMoveAction {
  readonly type: Type.AttemptComputerMove;
}

export interface ChangeOverlayAction {
  readonly type: Type.ChangeOverlay;
}

export interface ChessComputerLoadedAction {
  readonly type: Type.ChessComputerLoaded;
  readonly instance: WrappedSearchEngine;
  readonly color: Color;
}

export interface ClickSquareAction {
  readonly type: Type.ClickSquare;
  readonly square: Square;
}

export interface FlipBoardAction {
  readonly type: Type.FlipBoard;
}

export interface LoadChessComputerAction {
  readonly type: Type.LoadChessComputer;
  readonly playingAs: Color;
}

export interface MovePieceAction {
  readonly type: Type.MovePiece;
  readonly move: Move;
}

export interface OverlaySquaresAction {
  readonly type: Type.OverlaySquares;
}

export interface PreviousPositionAction {
  readonly type: Type.PreviousPosition;
}

export interface ReceiveComputerMoveAction {
  readonly type: Type.ReceiveComputerMove;
  readonly move: Move;
}

export interface ResetOverlayAction {
  readonly type: Type.ResetOverlay;
}

export interface SetPositionAction {
  readonly type: Type.SetPosition;
  readonly position: Position;
}

export interface SetPositionFromFENAction {
  readonly type: Type.SetPositionFromFEN;
  readonly fenString: string;
}

export interface TickPlayersClockAction {
  readonly type: Type.TickPlayersClock;
}

export interface ToggleSquareLabelsAction {
  readonly type: Type.ToggleSquareLabels;
}

export type Action =
  | AttemptComputerMoveAction
  | ChangeOverlayAction
  | ChessComputerLoadedAction
  | ClickSquareAction
  | FlipBoardAction
  | LoadChessComputerAction
  | OverlaySquaresAction
  | PreviousPositionAction
  | ReceiveComputerMoveAction
  | ResetOverlayAction
  | MovePieceAction
  | SetPositionAction
  | SetPositionFromFENAction
  | TickPlayersClockAction
  | ToggleSquareLabelsAction;

export const attemptComputerMoveAction = (): AttemptComputerMoveAction => ({
  type: Type.AttemptComputerMove,
});

export const changeOverlayAction = (): ChangeOverlayAction => ({
  type: Type.ChangeOverlay,
});

export const chessComputerLoadedAction = (
  instance: WrappedSearchEngine,
  color: Color,
): ChessComputerLoadedAction => ({
  type: Type.ChessComputerLoaded,
  instance,
  color,
});

export const clickSquareAction = (square: Square): ClickSquareAction => ({
  type: Type.ClickSquare,
  square,
});

export const flipBoardAction = (): FlipBoardAction => ({
  type: Type.FlipBoard,
});

export const loadChessComputerAction = (
  playingAs: Color,
): LoadChessComputerAction => ({
  type: Type.LoadChessComputer,
  playingAs,
});

export const overlaySquaresAction = (): OverlaySquaresAction => ({
  type: Type.OverlaySquares,
});

export const previousPositionAction = (): PreviousPositionAction => ({
  type: Type.PreviousPosition,
});

export const receiveComputerMoveAction = (
  move: Move,
): ReceiveComputerMoveAction => ({
  type: Type.ReceiveComputerMove,
  move,
});

export const resetOverlayAction = (): ResetOverlayAction => ({
  type: Type.ResetOverlay,
});

export const movePieceAction = (move: Move): MovePieceAction => ({
  type: Type.MovePiece,
  move,
});

export const setPositionAction = (position: Position): SetPositionAction => ({
  type: Type.SetPosition,
  position,
});

export const setPositionFromFENAction = (
  fenString: string,
): SetPositionFromFENAction => ({
  type: Type.SetPositionFromFEN,
  fenString,
});

export const tickPlayersClockAction = (): TickPlayersClockAction => ({
  type: Type.TickPlayersClock,
});

export const toggleSquareLabelsAction = (): ToggleSquareLabelsAction => ({
  type: Type.ToggleSquareLabels,
});
