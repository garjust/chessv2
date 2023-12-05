import * as WasmChess from 'wasm-chess';
import {
  CastlingState,
  Color,
  PieceType,
  SquareFile,
  SquareRank,
} from '../types';
import { CurrentZobrist } from '../lib/zobrist/types';
import { TranspositionTable } from '../engine/types';

// Check the wasm types implement interfaces the chess core/engine uses.
const _1: TranspositionTable<Uint8Array> =
  undefined as unknown as WasmChess.TTable;
const _2: CurrentZobrist = undefined as unknown as WasmChess.TTable;
const _3: CurrentZobrist = undefined as unknown as WasmChess.ManagedKey;

const assert = (msg: string, a: number, b: number) => {
  if (a !== b) {
    throw new Error(`wasm-chess enum match verification failed: ${msg}`);
  }
};

/**
 * Verify wasm-chess enums have the same value as the enums we define in
 * TypeScript. These enum values are used for bitfield operations so **MUST**
 * be the same.
 */
export const verifyEnums = () => {
  assert('rank-1', SquareRank._1, WasmChess.Rank._1);
  assert('rank-2', SquareRank._2, WasmChess.Rank._2);
  assert('rank-3', SquareRank._3, WasmChess.Rank._3);
  assert('rank-4', SquareRank._4, WasmChess.Rank._4);
  assert('rank-5', SquareRank._5, WasmChess.Rank._5);
  assert('rank-6', SquareRank._6, WasmChess.Rank._6);
  assert('rank-7', SquareRank._7, WasmChess.Rank._7);
  assert('rank-8', SquareRank._8, WasmChess.Rank._8);

  assert('file-1', SquareFile._A, WasmChess.File._A);
  assert('file-2', SquareFile._B, WasmChess.File._B);
  assert('file-3', SquareFile._C, WasmChess.File._C);
  assert('file-4', SquareFile._D, WasmChess.File._D);
  assert('file-5', SquareFile._E, WasmChess.File._E);
  assert('file-6', SquareFile._F, WasmChess.File._F);
  assert('file-7', SquareFile._G, WasmChess.File._G);
  assert('file-8', SquareFile._H, WasmChess.File._H);

  assert('color-white', Color.White, WasmChess.Color.White);
  assert('color-black', Color.Black, WasmChess.Color.Black);

  assert('piece-type-pawn', PieceType.Pawn, WasmChess.PieceType.Pawn);
  assert('piece-type-knight', PieceType.Knight, WasmChess.PieceType.Knight);
  assert('piece-type-bishop', PieceType.Bishop, WasmChess.PieceType.Bishop);
  assert('piece-type-rook', PieceType.Rook, WasmChess.PieceType.Rook);
  assert('piece-type-queen', PieceType.Queen, WasmChess.PieceType.Queen);
  assert('piece-type-king', PieceType.King, WasmChess.PieceType.King);

  assert('castling-None', CastlingState.None, WasmChess.CastlingState.None);
  assert(
    'castling-White_OO',
    CastlingState.White_OO,
    WasmChess.CastlingState.White_OO,
  );
  assert(
    'castling-White_OOO',
    CastlingState.White_OOO,
    WasmChess.CastlingState.White_OOO,
  );
  assert(
    'castling-Black_OO',
    CastlingState.Black_OO,
    WasmChess.CastlingState.Black_OO,
  );
  assert(
    'castling-Black_OOO',
    CastlingState.Black_OOO,
    WasmChess.CastlingState.Black_OOO,
  );
  assert('castling-White', CastlingState.White, WasmChess.CastlingState.White);
  assert('castling-Black', CastlingState.Black, WasmChess.CastlingState.Black);
  assert(
    'castling-Kingside',
    CastlingState.Kingside,
    WasmChess.CastlingState.Kingside,
  );
  assert(
    'castling-Queenside',
    CastlingState.Queenside,
    WasmChess.CastlingState.Queenside,
  );
  assert(
    'castling-White_OO__Black_OOO',
    CastlingState.White_OO__Black_OOO,
    WasmChess.CastlingState.White_OO__Black_OOO,
  );
  assert(
    'castling-White_OO__Black',
    CastlingState.White_OO__Black,
    WasmChess.CastlingState.White_OO__Black,
  );
  assert(
    'castling-White_OOO__Black_OO',
    CastlingState.White_OOO__Black_OO,
    WasmChess.CastlingState.White_OOO__Black_OO,
  );
  assert(
    'castling-White_OOO__Black',
    CastlingState.White_OOO__Black,
    WasmChess.CastlingState.White_OOO__Black,
  );
  assert(
    'castling-White__Black_OO',
    CastlingState.White__Black_OO,
    WasmChess.CastlingState.White__Black_OO,
  );
  assert(
    'castling-White__Black_OOO',
    CastlingState.White__Black_OOO,
    WasmChess.CastlingState.White__Black_OOO,
  );
  assert('castling-All', CastlingState.All, WasmChess.CastlingState.All);
};
