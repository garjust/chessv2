import { FEN_LIBRARY, parseFEN } from '../../lib/fen';
import {
  Color,
  Position,
  Piece,
  Square,
  Move,
  MoveWithExtraData,
  SquareControl,
} from '../../types';
import { Engine } from '../../engine/engine';

export enum SquareLabel {
  None = 'NONE',
  Index = 'INDEX',
  Square = 'SQUARE',
}

export enum SquareOverlayType {
  Attacked = 'ATTACKED',
  Capturable = 'CAPTURABLE',
  Check = 'CHECK',
  LastMove = 'LAST_MOVE',
  Movable = 'MOVABLE',
  SelectedPiece = 'SELECTED_PIECE',
}

export enum SquareOverlayCategory {
  Play = 'PLAY',
  AttacksForWhite = 'ATTACKS_FOR_WHITE',
  AttacksForBlack = 'ATTACKS_FOR_BLACK',
  Pins = 'PINS',
  Heatmap = 'HEATMAP',
}

/**
 * What the UI thinks an engine is currently doing.
 */
export enum UCIState {
  Idle = 'IDLE',
  WaitingForUCIOk = 'WAITING_FOR_UCIOK',
  WaitingForReadyOk = 'WAITING_FOR_READYOK',
  WaitingForMove = 'WAITING_FOR_MOVE',
}

export const HumanPlayer = Symbol('HUMAN');
export const Draw = Symbol('DRAW');

export type Player =
  | typeof HumanPlayer
  | {
      engineId: string;
    };

function createEngineId() {
  return `engine${Math.trunc(Math.random() * 1000000)}`;
}

export type EngineInstance = {
  id: string;
  label: string | null;
  uciState: UCIState;
  engine: Engine;
  toJSON(): unknown;
};

export const engineInstance = (engine: Engine): EngineInstance => ({
  id: createEngineId(),
  label: null,
  uciState: UCIState.Idle,
  engine,
  toJSON() {
    return { label: this.label, uciState: this.uciState };
  },
});

export const validateEngineInstanceState = (
  engine: EngineInstance,
  state: UCIState,
): void => {
  if (engine.uciState !== state) {
    throw Error(`engine ${engine.label} not in state ${state}`);
  }
};

export type State = Readonly<{
  debugVersion?: number;
  engines: Readonly<Record<string, EngineInstance>>;
  boardOrientation: Color;
  squareLabels: SquareLabel;
  selectedSquare: Square | null;
  overlayCategory: SquareOverlayCategory;
  squareOverlay: Record<Square, SquareOverlayType>;
  game: Readonly<{
    startFen: string;
    winner: Color | typeof Draw | null;
    evaluation: number;
    turn: Color;
    players: Readonly<{
      [Color.White]: Player;
      [Color.Black]: Player;
    }>;
    clocks: Readonly<{
      gameLength: number;
      plusTime: number;
      lastTick: number;
      [Color.White]: number;
      [Color.Black]: number;
    }>;
    position: Readonly<Position>;
    moves: Readonly<MoveWithExtraData[]>;
    moveList: Readonly<Move[]>;
    moveIndex: number;
    checks: Readonly<SquareControl[]>;
  }>;
  lastMove: Move | null;
}>;

const GAME_LENGTH_SECONDS = 300;
const PLUS_TIME_SECONDS = 5;

const INITIAL_STATE: State = {
  debugVersion: 0,
  engines: {},
  boardOrientation: Color.White,
  squareLabels: SquareLabel.None,
  selectedSquare: null,
  overlayCategory: SquareOverlayCategory.Play,
  squareOverlay: {},
  game: {
    startFen: FEN_LIBRARY.BLANK_POSITION_FEN,
    winner: null,
    evaluation: 0,
    turn: Color.White,
    players: {
      [Color.White]: HumanPlayer,
      [Color.Black]: HumanPlayer,
    },
    clocks: {
      lastTick: Date.now(),
      gameLength: GAME_LENGTH_SECONDS,
      plusTime: PLUS_TIME_SECONDS,
      [Color.White]: GAME_LENGTH_SECONDS * 1000,
      [Color.Black]: GAME_LENGTH_SECONDS * 1000,
    },
    position: parseFEN(FEN_LIBRARY.BLANK_POSITION_FEN),
    moves: [],
    moveList: [],
    moveIndex: 0,
    checks: [],
  },
  lastMove: null,
};

export const createState = (overrides: Partial<State> = {}): State => ({
  ...INITIAL_STATE,
  ...overrides,
});

export const pieceInSquare = (
  state: State,
  square: Square,
): Piece | undefined => state.game.position.pieces.get(square);

export const squareIsSelected = (state: State, square: Square) =>
  state.selectedSquare === square;

export const squareOverlay = (state: State, square: Square) =>
  state.squareOverlay[square];

export const squareContainsMovablePiece = (
  state: State,
  square: Square,
): boolean => pieceInSquare(state, square)?.color === state.game.position.turn;

export const checkedSquare = (state: State): Square | undefined =>
  state.game.checks.length > 0 ? state.game.checks[0].to : undefined;

export const availableCaptures = (state: State): Move[] =>
  state.game.moves.filter((move) => move.attack);

export const showHeatmap = (state: State) =>
  state.overlayCategory === SquareOverlayCategory.Heatmap;

export const getEngineInstance = (state: State, id: string): EngineInstance => {
  const instance = state.engines[id];
  if (instance === undefined) {
    throw Error(`failed to find engine ${id}`);
  }
  return instance;
};

export const engineStateAs = (
  state: State,
  engineId: string,
  uciState: UCIState,
): State => ({
  ...state,
  engines: {
    ...state.engines,
    [engineId]: {
      ...state.engines[engineId],
      uciState,
    },
  },
});

export const isWaitingForEngine = (state: State, engineId: string): boolean => {
  const player = state.game.players[state.game.turn];
  return player !== HumanPlayer && player.engineId === engineId;
};

export const isDisplayingCurrentPosition = (state: State): boolean =>
  state.game.moveIndex === state.game.moveList.length;

export const gameIsOver = (state: State): boolean => state.game.winner !== null;
