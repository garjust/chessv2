import { Color, Move, Piece, PieceType, Position, Square } from '../types';
import {
  squareEquals,
  SquareMap,
  ROOK_STARTING_SQUARES,
  flipColor,
} from '../utils';
import { down, up } from './move-utils';

const isTwoRankMove = (move: Move): boolean =>
  Math.abs(move.from.rank - move.to.rank) === 2;

export const applyMove = (
  position: Position,
  move: Move
): { position: Position; captured?: Piece } => {
  const pieces = new SquareMap<Piece>();
  for (const [key, value] of position.pieces) {
    pieces.set(key, value);
  }

  const castlingAvailability = { ...position.castlingAvailability };
  let enPassantSquare: Square | null = null;
  let isCapture = false;

  let piece = pieces.get(move.from);

  if (!piece) {
    throw Error('no piece to move');
  }
  if (piece.color !== position.turn) {
    throw Error('cannot move piece for other color');
  }

  // If the move is a pawn promoting it will have the promotion property set.
  // In this case swap out the piece befor executing the move so we only insert
  // a piece once.
  if (move.promotion) {
    piece = { ...piece, type: move.promotion };
  }

  // Execute the move
  const captured = pieces.get(move.to);
  pieces.delete(move.from);
  pieces.set(move.to, piece);

  if (captured) {
    isCapture = true;

    // If the captured piece is a rook we need to update castling state.
    if (captured.type === PieceType.Rook) {
      if (squareEquals(move.to, ROOK_STARTING_SQUARES[piece.color].queenside)) {
        castlingAvailability[piece.color].queenside = false;
      } else if (
        squareEquals(move.to, ROOK_STARTING_SQUARES[piece.color].kingside)
      ) {
        castlingAvailability[piece.color].kingside = false;
      }
    }
  }

  // En passant pawn move handling.
  if (piece.type === PieceType.Pawn) {
    if (squareEquals(position.enPassantSquare, move.to)) {
      // This is an en passant capture
      isCapture = true;
      if (piece.color === Color.White) {
        pieces.delete(down(move.to));
      } else {
        pieces.delete(up(move.to));
      }
    }

    if (isTwoRankMove(move)) {
      enPassantSquare = move.from.rank === 1 ? up(move.from) : down(move.from);
    }
  }

  // King move special handling.
  if (piece.type === PieceType.King) {
    // The king moved, no more castling.
    castlingAvailability[piece.color].queenside = false;
    castlingAvailability[piece.color].kingside = false;

    // If the king move is a castle we need to move the corresponding rook.
    if (Math.abs(move.from.file - move.to.file) === 2) {
      if (move.from.file - move.to.file > 0) {
        // queenside
        const rookSquare = { rank: move.from.rank, file: 0 };
        const rook = position.pieces.get(rookSquare);
        if (!rook) {
          throw Error('no rook to castle with');
        }
        pieces.delete(rookSquare);
        pieces.set({ rank: move.from.rank, file: 3 }, rook);
      } else {
        // kingside
        const rookSquare = { rank: move.from.rank, file: 7 };
        const rook = position.pieces.get(rookSquare);
        if (!rook) {
          throw Error('no rook to castle with');
        }
        pieces.delete(rookSquare);
        pieces.set({ rank: move.from.rank, file: 5 }, rook);
      }
    }
  }

  // If the moved piece is a rook update castling state.
  if (piece.type === PieceType.Rook) {
    if (squareEquals(move.from, ROOK_STARTING_SQUARES[piece.color].queenside)) {
      castlingAvailability[piece.color].queenside = false;
    } else if (
      squareEquals(move.from, ROOK_STARTING_SQUARES[piece.color].kingside)
    ) {
      castlingAvailability[piece.color].kingside = false;
    }
  }

  return {
    position: Object.freeze({
      pieces,
      turn: flipColor(position.turn),
      castlingAvailability,
      enPassantSquare,
      halfMoveCount:
        piece.type !== PieceType.Pawn && !isCapture
          ? position.halfMoveCount + 1
          : 0,
      fullMoveCount:
        position.turn === Color.Black
          ? position.fullMoveCount + 1
          : position.fullMoveCount,
    }),
    captured,
  };
};
