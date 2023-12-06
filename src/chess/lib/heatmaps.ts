import { Color, Move, Piece, PieceType, Square } from '../types';

export const HEATMAP_MULTIPLIER = 100;
const heatmapMultiplier = (arr: number[]) =>
  arr.map((x) => x * HEATMAP_MULTIPLIER);

const NULL_MATRIX = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const BISHOP_MATRIX = [
  [0, 0, 0, 2, 2, 0, 0, 0],
  [1, 1, 2, 2, 2, 2, 1, 1],
  [1, 2, 3, 3, 3, 3, 2, 1],
  [1, 6, 4, 4, 4, 4, 6, 1],
  [1, 1, 7, 4, 4, 7, 1, 1],
  [1, 1, 1, 8, 8, 1, 1, 1],
  [2, 8, 0, 7, 7, 0, 8, 2],
  [0, 1, 0, 0, 0, 0, 1, 0],
].map(heatmapMultiplier);

const KING_MATRIX = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 0, 0, 1, 1, 1],
  [8, 8, 9, 0, 0, 4, 9, 8],
].map(heatmapMultiplier);

const KNIGHT_MATRIX = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 2, 4, 6, 6, 4, 2, 1],
  [2, 4, 6, 7, 7, 6, 4, 2],
  [2, 4, 6, 7, 7, 6, 4, 2],
  [1, 2, 9, 5, 5, 9, 2, 1],
  [1, 1, 1, 7, 7, 1, 1, 1],
  [0, 0, 1, 1, 1, 1, 0, 0],
].map(heatmapMultiplier);

const PAWN_MATRIX = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [9, 9, 9, 9, 9, 9, 9, 9],
  [6, 1, 6, 7, 7, 6, 1, 6],
  [5, 1, 5, 8, 8, 5, 1, 5],
  [5, 1, 6, 9, 9, 3, 1, 5],
  [3, 6, 4, 3, 3, 2, 6, 3],
  [2, 2, 2, 0, 0, 8, 2, 2],
  [0, 0, 0, 0, 0, 0, 0, 0],
].map(heatmapMultiplier);

const QUEEN_MATRIX = [
  [0, 1, 2, 3, 3, 2, 1, 0],
  [1, 2, 3, 5, 5, 3, 2, 1],
  [2, 3, 5, 7, 7, 5, 3, 2],
  [3, 5, 7, 9, 9, 7, 5, 3],
  [3, 5, 7, 9, 9, 7, 6, 3],
  [2, 7, 5, 7, 7, 7, 3, 2],
  [1, 2, 7, 5, 7, 1, 2, 1],
  [0, 1, 2, 3, 3, 2, 1, 0],
].map(heatmapMultiplier);

const ROOK_MATRIX = [
  [3, 3, 3, 3, 3, 3, 3, 3],
  [8, 8, 9, 9, 9, 9, 8, 8],
  [0, 3, 2, 2, 2, 2, 3, 0],
  [1, 3, 2, 1, 1, 2, 3, 1],
  [1, 3, 2, 1, 1, 2, 3, 1],
  [4, 3, 2, 4, 2, 4, 3, 4],
  [0, 0, 3, 1, 1, 3, 0, 0],
  [1, 0, 2, 3, 3, 2, 0, 1],
].map(heatmapMultiplier);

export const HEATMAPS = {
  [PieceType.Null]: {
    [Color.White]: [...NULL_MATRIX].reverse().flat(),
    [Color.Black]: [...NULL_MATRIX].flat(),
  },

  [PieceType.Bishop]: {
    [Color.White]: [...BISHOP_MATRIX].reverse().flat(),
    [Color.Black]: [...BISHOP_MATRIX].flat(),
  },

  [PieceType.Knight]: {
    [Color.White]: [...KNIGHT_MATRIX].reverse().flat(),
    [Color.Black]: [...KNIGHT_MATRIX].flat(),
  },
  [PieceType.King]: {
    [Color.White]: [...KING_MATRIX].reverse().flat(),
    [Color.Black]: [...KING_MATRIX].flat(),
  },
  [PieceType.Pawn]: {
    [Color.White]: [...PAWN_MATRIX].reverse().flat(),
    [Color.Black]: [...PAWN_MATRIX].flat(),
  },
  [PieceType.Queen]: {
    [Color.White]: [...QUEEN_MATRIX].reverse().flat(),
    [Color.Black]: [...QUEEN_MATRIX].flat(),
  },
  [PieceType.Rook]: {
    [Color.White]: [...ROOK_MATRIX].reverse().flat(),
    [Color.Black]: [...ROOK_MATRIX].flat(),
  },
};

export const squareValue = (square: Square, piece: Piece): number =>
  HEATMAPS[piece.type][piece.color][square];

export const squareValueDiff = (move: Move, piece: Piece): number =>
  squareValue(move.to, piece) - squareValue(move.from, piece);
