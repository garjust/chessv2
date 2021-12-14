import { Color, Move, Square } from '../types';

export enum Type {
  ClickSquare = 'CLICK_SQUARE',
  FlipBoard = 'FLIP_BOARD',
  Initialize = 'INITIALIZE',
  MovePiece = 'MOVE_PIECE',
  SetPositionFromFEN = 'SET_POSITION_FROM_FEN',
  ToggleSquareLabels = 'TOGGLE_SQUARE_LABELS',
}

export declare namespace Action {
  export interface ClickSquare {
    readonly type: Type.ClickSquare;
    readonly square: Square;
  }

  export interface FlipBoard {
    readonly type: Type.FlipBoard;
  }

  export interface Initialize {
    readonly type: Type.Initialize;
    readonly playingAs: Color;
  }

  export interface MovePiece {
    readonly type: Type.MovePiece;
    readonly move: Move;
  }

  export interface SetPositionFromFEN {
    readonly type: Type.SetPositionFromFEN;
    readonly fenString: string;
  }

  export interface ToggleSquareLabels {
    readonly type: Type.ToggleSquareLabels;
  }
}

export type Action =
  | Action.ClickSquare
  | Action.FlipBoard
  | Action.Initialize
  | Action.MovePiece
  | Action.SetPositionFromFEN
  | Action.ToggleSquareLabels;

export const clickSquareAction = (square: Square): Action.ClickSquare => ({
  type: Type.ClickSquare,
  square,
});

export const flipBoardAction = (): Action.FlipBoard => ({
  type: Type.FlipBoard,
});

export const initializeAction = (playingAs: Color): Action.Initialize => ({
  type: Type.Initialize,
  playingAs,
});

export const movePieceAction = (move: Move): Action.MovePiece => ({
  type: Type.MovePiece,
  move,
});

export const setPositionFromFENAction = (
  fenString: string
): Action.SetPositionFromFEN => ({
  type: Type.SetPositionFromFEN,
  fenString,
});

export const toggleSquareLabelsAction = (): Action.ToggleSquareLabels => ({
  type: Type.ToggleSquareLabels,
});
