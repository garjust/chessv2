import { Remote } from 'comlink';
import { ChessComputer } from '../ai/chess-computer';
import { FEN_LIBRARY, parseFEN } from '../lib/fen';
import {
  Color,
  Position,
  Piece,
  Square,
  Move,
  MoveWithExtraData,
  SquareControlObject,
} from '../types';

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

export const HumanPlayer = Symbol('HUMAN');
export const Draw = Symbol('DRAW');

export type ChessComputerWrapped = {
  ai: Remote<ChessComputer>;
  label: string;
  cleanup: () => void;
  // This property is here to indicate to JSON.stringify replacer function
  // what type of object this is to avoid serializing the comlink remote
  // object. JSON.stringify does something to the wrapped WebWorker before
  // it hits the replacer function that explodes.
  __computer: true;
};

export type Player = typeof HumanPlayer | ChessComputerWrapped;

export interface State {
  debugVersion?: number;
  boardOrientation: Color;
  squareLabels: SquareLabel;
  clocks: {
    lastTick: number;
    [Color.White]: number;
    [Color.Black]: number;
  };
  players: {
    [Color.White]: Player;
    [Color.Black]: Player;
  };
  winner?: Color | typeof Draw;
  selectedSquare?: Square;
  overlayCategory: SquareOverlayCategory;
  squareOverlay?: Map<Square, SquareOverlayType>;
  position: Position;
  moves: MoveWithExtraData[];
  checks: SquareControlObject[];
  evaluation: number;
  zobrist?: [number, number];
  lastMove?: Move;
}

const INITIAL_STATE: State = {
  debugVersion: 0,
  boardOrientation: Color.White,
  squareLabels: SquareLabel.None,
  clocks: {
    lastTick: Date.now(),
    [Color.White]: 600 * 1000,
    [Color.Black]: 600 * 1000,
  },
  players: {
    [Color.White]: HumanPlayer,
    [Color.Black]: HumanPlayer,
  },
  evaluation: 0,
  moves: [],
  checks: [],
  overlayCategory: SquareOverlayCategory.Play,
  position: parseFEN(FEN_LIBRARY.BLANK_POSITION_FEN),
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
  state.selectedSquare === square;

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
