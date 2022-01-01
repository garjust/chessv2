import { Color, PieceType } from '../types';

const BISHOP_MATRIX = [
  [-5, -2, 0, 0, 0, 0, -2, -5],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 5, 1, 1, 1, 1, 5, 1],
  [1, 1, 6, 1, 1, 6, 1, 1],
  [1, 1, 1, 6, 6, 1, 1, 1],
  [2, 8, -1, 8, 8, -1, 8, 2],
  [4, 2, -2, -5, -5, -2, 2, 4],
];

const KING_MATRIX = [
  [-10, -10, -10, -10, -10, -10, -10, -10],
  [-10, -10, -10, -10, -10, -10, -10, -10],
  [-10, -10, -10, -10, -10, -10, -10, -10],
  [0, -2, -5, -10, -10, -5, -2, 0],
  [0, -2, -5, -10, -10, -5, -2, 0],
  [0, 0, -2, -10, -10, -2, 0, 0],
  [1, 1, 1, -10, -10, 1, 1, 1],
  [5, 5, 10, -8, -8, 5, 10, 5],
];

const KNIGHT_MATRIX = [
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [-1, 1, 2, 1, 1, 2, 1, -1],
  [0, 4, 4, 4, 4, 4, 4, 0],
  [0, 1, 2, 4, 4, 2, 1, 0],
  [-1, 1, 10, 1, 1, 10, 1, -1],
  [-5, -1, 1, 6, 6, 1, -1, -5],
  [-10, -5, -1, 0, 0, -1, -5, -10],
];

const PAWN_MATRIX = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [10, 10, 10, 10, 10, 10, 10, 10],
  [6, 1, 5, 7, 7, 5, 1, 6],
  [5, 1, 4, 6, 6, 4, 1, 5],
  [4, 1, 1, 5, 5, 1, 1, 4],
  [1, 1, 1, 1, 1, -3, 1, 1],
  [1, 5, 5, -10, -10, 5, 5, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const QUEEN_MATRIX = [
  [-5, -2, 0, 0, 0, 0, -2, -5],
  [1, 1, 1, 2, 2, 1, 1, 1],
  [1, 1, 2, 6, 6, 2, 1, 1],
  [1, 2, 6, 5, 5, 6, 2, 1],
  [1, 2, 6, 8, 8, 6, 2, 1],
  [1, 5, 2, 6, 6, 5, 1, 1],
  [2, 1, 5, 2, 5, -1, 1, 1],
  [-5, -2, -2, -1, -1, -2, -2, -5],
];

const ROOK_MATRIX = [
  [5, 5, 5, 5, 5, 5, 5, 5],
  [10, 10, 10, 10, 10, 10, 10, 10],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, -2, -1, -1, -2, 0, 1],
  [1, 0, -2, -1, -1, -2, 0, 1],
  [4, 0, 0, 4, 0, 4, 0, 4],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [2, 4, 6, 10, 10, 8, 4, 2],
];

export const HEATMAPS = {
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
