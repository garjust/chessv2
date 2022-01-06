import { AvailableComputerVersions, ChessComputerWorker } from '../ai/types';
import { BLANK_POSITION_FEN, parseFEN } from '../lib/fen';
import {
  Color,
  Position,
  Piece,
  Square,
  Move,
  MoveWithExtraData,
  AttackObject,
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
  ai: ChessComputerWorker;
  version: AvailableComputerVersions;
  // This property is here to indicate to JSON.stringify replacer function
  // what type of object this is to avoid serializing the ai. JSON.stringify
  // does something to the wrapped WebWorker before it hits the replacer
  // function that explodes.
  __computer: true;
};

export type Player = typeof HumanPlayer | ChessComputerWrapped;

export interface State {
  debugVersion?: number;
  boardOrientation: Color;
  squareLabels: SquareLabel;
  players: {
    [Color.White]: Player;
    [Color.Black]: Player;
  };
  winner?: Color | typeof Draw;
  selectedSquare?: Square;
  overlayCategory: SquareOverlayCategory;
  squareOverlay?: Map<Square, SquareOverlayType>;
  position: Position;
  previousPositions: Position[];
  moves: MoveWithExtraData[];
  checks: AttackObject[];
  evaluation: number;
  lastMove?: Move;
}

const INITIAL_STATE: State = {
  debugVersion: 0,
  boardOrientation: Color.White,
  squareLabels: SquareLabel.None,
  players: {
    [Color.White]: HumanPlayer,
    [Color.Black]: HumanPlayer,
  },
  previousPositions: [],
  position: parseFEN(BLANK_POSITION_FEN),
  evaluation: 0,
  moves: [],
  checks: [],
  overlayCategory: SquareOverlayCategory.Play,
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
  state.checks.length > 0 ? state.checks[0].attacked.square : undefined;

export const availableCaptures = (state: State): Move[] =>
  state.moves.filter((move) => move.attack);

export const showHeatmap = (state: State) =>
  state.overlayCategory === SquareOverlayCategory.Heatmap;
