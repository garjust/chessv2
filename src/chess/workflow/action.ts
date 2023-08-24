import { Color, Move, Position, Square } from '../types';
import { ChessComputerWrapped } from './state';

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

export declare namespace Action {
  export interface AttemptComputerMove {
    readonly type: Type.AttemptComputerMove;
  }

  export interface ChangeOverlay {
    readonly type: Type.ChangeOverlay;
  }

  export interface ChessComputerLoaded {
    readonly type: Type.ChessComputerLoaded;
    readonly instance: ChessComputerWrapped;
    readonly color: Color;
  }

  export interface ClickSquare {
    readonly type: Type.ClickSquare;
    readonly square: Square;
  }

  export interface FlipBoard {
    readonly type: Type.FlipBoard;
  }

  export interface LoadChessComputer {
    readonly type: Type.LoadChessComputer;
    readonly playingAs: Color;
  }

  export interface MovePiece {
    readonly type: Type.MovePiece;
    readonly move: Move;
  }

  export interface OverlaySquares {
    readonly type: Type.OverlaySquares;
  }

  export interface PreviousPosition {
    readonly type: Type.PreviousPosition;
  }

  export interface ReceiveComputerMove {
    readonly type: Type.ReceiveComputerMove;
    readonly move: Move;
  }

  export interface ResetOverlay {
    readonly type: Type.ResetOverlay;
  }

  export interface SetPosition {
    readonly type: Type.SetPosition;
    readonly position: Position;
  }

  export interface SetPositionFromFEN {
    readonly type: Type.SetPositionFromFEN;
    readonly fenString: string;
  }

  export interface TickPlayersClock {
    readonly type: Type.TickPlayersClock;
  }

  export interface ToggleSquareLabels {
    readonly type: Type.ToggleSquareLabels;
  }
}

export type Action =
  | Action.AttemptComputerMove
  | Action.ChangeOverlay
  | Action.ChessComputerLoaded
  | Action.ClickSquare
  | Action.FlipBoard
  | Action.LoadChessComputer
  | Action.OverlaySquares
  | Action.PreviousPosition
  | Action.ReceiveComputerMove
  | Action.ResetOverlay
  | Action.MovePiece
  | Action.SetPosition
  | Action.SetPositionFromFEN
  | Action.TickPlayersClock
  | Action.ToggleSquareLabels;

export const attemptComputerMoveAction = (): Action.AttemptComputerMove => ({
  type: Type.AttemptComputerMove,
});

export const changeOverlayAction = (): Action.ChangeOverlay => ({
  type: Type.ChangeOverlay,
});

export const chessComputerLoadedAction = (
  instance: ChessComputerWrapped,
  color: Color,
): Action.ChessComputerLoaded => ({
  type: Type.ChessComputerLoaded,
  instance,
  color,
});

export const clickSquareAction = (square: Square): Action.ClickSquare => ({
  type: Type.ClickSquare,
  square,
});

export const flipBoardAction = (): Action.FlipBoard => ({
  type: Type.FlipBoard,
});

export const loadChessComputerAction = (
  playingAs: Color,
): Action.LoadChessComputer => ({
  type: Type.LoadChessComputer,
  playingAs,
});

export const overlaySquaresAction = (): Action.OverlaySquares => ({
  type: Type.OverlaySquares,
});

export const previousPositionAction = (): Action.PreviousPosition => ({
  type: Type.PreviousPosition,
});

export const receiveComputerMoveAction = (
  move: Move,
): Action.ReceiveComputerMove => ({
  type: Type.ReceiveComputerMove,
  move,
});

export const resetOverlayAction = (): Action.ResetOverlay => ({
  type: Type.ResetOverlay,
});

export const movePieceAction = (move: Move): Action.MovePiece => ({
  type: Type.MovePiece,
  move,
});

export const setPositionAction = (position: Position): Action.SetPosition => ({
  type: Type.SetPosition,
  position,
});

export const setPositionFromFENAction = (
  fenString: string,
): Action.SetPositionFromFEN => ({
  type: Type.SetPositionFromFEN,
  fenString,
});

export const tickPlayersClockAction = (): Action.TickPlayersClock => ({
  type: Type.TickPlayersClock,
});

export const toggleSquareLabelsAction = (): Action.ToggleSquareLabels => ({
  type: Type.ToggleSquareLabels,
});
