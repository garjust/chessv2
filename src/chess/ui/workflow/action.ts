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

export const attemptEngineMoveAction = () =>
  ({
    type: Type.AttemptEngineMove,
  }) as const;

export const changeOverlayAction = () =>
  ({
    type: Type.ChangeOverlay,
  }) as const;

export const clickSquareAction = (square: Square, alternate = false) =>
  ({
    type: Type.ClickSquare,
    square,
    alternate,
  }) as const;

export const engineResponseAction = (engineId: string, response: UCIResponse) =>
  ({
    type: Type.EngineResponse,
    engineId,
    response,
  }) as const;

export const flipBoardAction = () =>
  ({
    type: Type.FlipBoard,
  }) as const;

export const loadEngineAction = (playingAs: Color) =>
  ({
    type: Type.LoadEngine,
    playingAs,
  }) as const;

export const loadEngineDoneAction = (instance: EngineInstance, color: Color) =>
  ({
    type: Type.LoadEngineDone,
    instance,
    color,
  }) as const;

export const movePieceAction = (move: Move) =>
  ({
    type: Type.MovePiece,
    move,
  }) as const;

export const navigatePositionAction = (to: Navigate) =>
  ({
    type: Type.NavigatePosition,
    to,
  }) as const;

export const overlaySquaresAction = () =>
  ({
    type: Type.OverlaySquares,
  }) as const;

export const receiveEngineMoveAction = (move: Move) =>
  ({
    type: Type.ReceiveEngineMove,
    move,
  }) as const;

export const resetOverlayAction = () =>
  ({
    type: Type.ResetOverlay,
  }) as const;

export const setPositionAction = (position: Position) =>
  ({
    type: Type.SetPosition,
    position,
  }) as const;

export const setPositionFromFENAction = (fenString: string) =>
  ({
    type: Type.SetPositionFromFEN,
    fenString,
  }) as const;

export const tickPlayersClockAction = () =>
  ({
    type: Type.TickPlayersClock,
  }) as const;

export const toggleSquareLabelsAction = () =>
  ({
    type: Type.ToggleSquareLabels,
  }) as const;

export type Action =
  | ReturnType<typeof attemptEngineMoveAction>
  | ReturnType<typeof changeOverlayAction>
  | ReturnType<typeof clickSquareAction>
  | ReturnType<typeof engineResponseAction>
  | ReturnType<typeof flipBoardAction>
  | ReturnType<typeof loadEngineAction>
  | ReturnType<typeof loadEngineDoneAction>
  | ReturnType<typeof movePieceAction>
  | ReturnType<typeof navigatePositionAction>
  | ReturnType<typeof overlaySquaresAction>
  | ReturnType<typeof receiveEngineMoveAction>
  | ReturnType<typeof resetOverlayAction>
  | ReturnType<typeof setPositionAction>
  | ReturnType<typeof setPositionFromFENAction>
  | ReturnType<typeof tickPlayersClockAction>
  | ReturnType<typeof toggleSquareLabelsAction>;
