import { FEN_LIBRARY, parseFEN } from '../../lib/fen';
import {
  Color,
  Position,
  Piece,
  Square,
  Move,
  MoveWithExtraData,
  SquareControlObject,
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

export enum UCIState {
  Idle = 'IDLE',
  WaitingForUCIOk = 'WAITING_FOR_UCIOK',
  WaitingForReadyOk = 'WAITING_FOR_READYOK',
  WaitingForMove = 'WAITING_FOR_MOVE',
}

export const HumanPlayer = Symbol('HUMAN');
export const Draw = Symbol('DRAW');

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

export type Player =
  | typeof HumanPlayer
  | {
      engineId: string;
    };

export type State = Readonly<{
  debugVersion?: number;
  boardOrientation: Color;
  squareLabels: SquareLabel;
  clocks: Readonly<{
    gameLength: number;
    plusTime: number;
    lastTick: number;
    [Color.White]: number;
    [Color.Black]: number;
  }>;
  engines: Readonly<Record<string, EngineInstance>>;
  players: Readonly<{
    [Color.White]: Player;
    [Color.Black]: Player;
  }>;
  winner?: Color | typeof Draw;
  selectedSquare?: Square;
  overlayCategory: SquareOverlayCategory;
  squareOverlay: Record<Square, SquareOverlayType>;
  position: Readonly<Position>;
  moves: Readonly<MoveWithExtraData[]>;
  checks: Readonly<SquareControlObject[]>;
  evaluation: number;
  zobrist?: Readonly<[number, number]>;
  lastMove?: Move;
  moveList: Readonly<Move[]>;
  moveIndex: number;
}>;

const GAME_LENGTH = 300;
const PLUS_TIME = 5;

const INITIAL_STATE: State = {
  debugVersion: 0,
  evaluation: 0,
  boardOrientation: Color.White,
  squareLabels: SquareLabel.None,
  players: {
    [Color.White]: HumanPlayer,
    [Color.Black]: HumanPlayer,
  },
  engines: {},
  checks: [],
  position: parseFEN(FEN_LIBRARY.BLANK_POSITION_FEN),
  overlayCategory: SquareOverlayCategory.Play,
  squareOverlay: {},
  clocks: {
    lastTick: Date.now(),
    gameLength: GAME_LENGTH,
    plusTime: PLUS_TIME,
    [Color.White]: GAME_LENGTH * 1000,
    [Color.Black]: GAME_LENGTH * 1000,
  },
  moveList: [],
  moveIndex: 0,
  moves: [],
};

export const createState = (overrides: Partial<State> = {}): State => ({
  ...INITIAL_STATE,
  ...overrides,
});

export const pieceInSquare = (
  state: State,
  square: Square,
): Piece | undefined => state.position.pieces.get(square);

export const squareIsSelected = (state: State, square: Square) =>
  state.selectedSquare === square;

export const squareOverlay = (state: State, square: Square) =>
  state.squareOverlay[square];

export const isSquareClickable = (state: State, square: Square): boolean => {
  if (
    (state.position.turn === Color.White &&
      state.players[Color.White] !== HumanPlayer) ||
    (state.position.turn === Color.Black &&
      state.players[Color.Black] !== HumanPlayer)
  ) {
    return false;
  }

  if (state.selectedSquare !== undefined) {
    return true;
  }

  const piece = pieceInSquare(state, square);
  if (piece && piece.color === state.position.turn) {
    return true;
  }

  return false;
};

export const checkedSquare = (state: State): Square | undefined =>
  state.checks.length > 0 ? state.checks[0].square : undefined;

export const availableCaptures = (state: State): Move[] =>
  state.moves.filter((move) => move.attack);

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
  const player = state.players[state.position.turn];
  return player !== HumanPlayer && player.engineId === engineId;
};
