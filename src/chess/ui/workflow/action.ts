import { UCIResponse } from '../../engine/workflow/uci-response';
import { Color, Move, Position, Square } from '../../types';
import { EngineInstance } from './state';

export enum Type {
  AttemptEngineMove = 'ATTEMPT_ENGINE_MOVE',
  ChangeOverlay = 'CHANGE_OVERLAY',
  ClickSquare = 'CLICK_SQUARE',
  EngineResponse = 'ENGINE_RESPONSE',
  FlipBoard = 'FLIP_BOARD',
  LoadEngine = 'LOAD_ENGINE',
  LoadEngineDone = 'LOAD_ENGINE_DONE',
  MovePiece = 'MOVE_PIECE',
  NavigatePosition = 'NAVIGATE_POSITION',
  OverlaySquares = 'OVERLAY_SQUARES',
  ReceiveEngineMove = 'RECEIVE_ENGINE_MOVE',
  ResetOverlay = 'RESET_OVERLAY',
  SetPosition = 'SET_POSITION',
  SetPositionFromFEN = 'SET_POSITION_FROM_FEN',
  TickPlayersClock = 'TICK_PLAYERS_CLOCK',
  ToggleSquareLabels = 'TOGGLE_SQUARE_LABELS',
}

export enum Navigate {
  Back = 'BACK',
  Forward = 'FORWARD',
  Start = 'START',
  Current = 'CURRENT',
}

export type AttemptEngineMoveAction = {
  readonly type: Type.AttemptEngineMove;
};

export type ChangeOverlayAction = {
  readonly type: Type.ChangeOverlay;
};

export type ClickSquareAction = {
  readonly type: Type.ClickSquare;
  readonly square: Square;
};

export type EngineResponseAction = {
  readonly type: Type.EngineResponse;
  engineId: string;
  response: UCIResponse;
};

export type FlipBoardAction = {
  readonly type: Type.FlipBoard;
};

export type LoadEngineAction = {
  readonly type: Type.LoadEngine;
  readonly playingAs: Color;
};

export type LoadEngineDoneAction = {
  readonly type: Type.LoadEngineDone;
  readonly instance: EngineInstance;
  readonly color: Color;
};

export type MovePieceAction = {
  readonly type: Type.MovePiece;
  readonly move: Move;
};

export type NavigatePositionAction = {
  readonly type: Type.NavigatePosition;
  readonly to: Navigate;
};

export type OverlaySquaresAction = {
  readonly type: Type.OverlaySquares;
};

export type ReceiveEngineMoveAction = {
  readonly type: Type.ReceiveEngineMove;
  readonly move: Move;
};

export type ResetOverlayAction = {
  readonly type: Type.ResetOverlay;
};

export type SetPositionAction = {
  readonly type: Type.SetPosition;
  readonly position: Position;
};

export type SetPositionFromFENAction = {
  readonly type: Type.SetPositionFromFEN;
  readonly fenString: string;
};

export type TickPlayersClockAction = {
  readonly type: Type.TickPlayersClock;
};

export type ToggleSquareLabelsAction = {
  readonly type: Type.ToggleSquareLabels;
};

export type Action =
  | AttemptEngineMoveAction
  | ChangeOverlayAction
  | ClickSquareAction
  | EngineResponseAction
  | FlipBoardAction
  | LoadEngineAction
  | LoadEngineDoneAction
  | MovePieceAction
  | NavigatePositionAction
  | OverlaySquaresAction
  | ReceiveEngineMoveAction
  | ResetOverlayAction
  | SetPositionAction
  | SetPositionFromFENAction
  | TickPlayersClockAction
  | ToggleSquareLabelsAction;

export const attemptEngineMoveAction = (): AttemptEngineMoveAction => ({
  type: Type.AttemptEngineMove,
});

export const changeOverlayAction = (): ChangeOverlayAction => ({
  type: Type.ChangeOverlay,
});

export const clickSquareAction = (square: Square): ClickSquareAction => ({
  type: Type.ClickSquare,
  square,
});

export const engineResponseAction = (
  engineId: string,
  response: UCIResponse,
): EngineResponseAction => ({
  type: Type.EngineResponse,
  engineId,
  response,
});

export const flipBoardAction = (): FlipBoardAction => ({
  type: Type.FlipBoard,
});

export const loadEngineAction = (playingAs: Color): LoadEngineAction => ({
  type: Type.LoadEngine,
  playingAs,
});

export const loadEngineDoneAction = (
  instance: EngineInstance,
  color: Color,
): LoadEngineDoneAction => ({
  type: Type.LoadEngineDone,
  instance,
  color,
});

export const movePieceAction = (move: Move): MovePieceAction => ({
  type: Type.MovePiece,
  move,
});

export const navigatePositionAction = (
  to: Navigate,
): NavigatePositionAction => ({
  type: Type.NavigatePosition,
  to,
});

export const overlaySquaresAction = (): OverlaySquaresAction => ({
  type: Type.OverlaySquares,
});

export const receiveEngineMoveAction = (
  move: Move,
): ReceiveEngineMoveAction => ({
  type: Type.ReceiveEngineMove,
  move,
});

export const resetOverlayAction = (): ResetOverlayAction => ({
  type: Type.ResetOverlay,
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
