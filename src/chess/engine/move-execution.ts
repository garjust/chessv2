import {
  CastlingAvailability,
  Color,
  Move,
  Piece,
  PieceType,
  Square,
} from '../types';
import { squareEquals, ROOK_STARTING_SQUARES, flipColor } from '../utils';
import { down, up } from './move-utils';
import { Position } from './position';

export type MoveResult = {
  move: Move;
  captured?: { square: Square; piece: Piece };
  // Store state on the move result that we cannot reverse.
  previousState: {
    halfMoveCount: number;
    castlingAvailability: CastlingAvailability;
    enPassantSquare: Square | null;
  };
};

const isTwoRankMove = (move: Move): boolean =>
  Math.abs(move.from.rank - move.to.rank) === 2;

export const applyMove = (position: Position, move: Move): MoveResult => {
  const { pieces, enPassantSquare } = position;
  let piece = position.pieces.get(move.from);

  if (!piece) {
    throw Error('no piece to move');
  }
  if (piece.color !== position.turn) {
    throw Error('cannot move piece for other color');
  }

  const result: MoveResult = {
    move,
    previousState: {
      castlingAvailability: {
        [Color.White]: {
          kingside: position.castlingAvailability[Color.White].kingside,
          queenside: position.castlingAvailability[Color.White].queenside,
        },
        [Color.Black]: {
          kingside: position.castlingAvailability[Color.Black].kingside,
          queenside: position.castlingAvailability[Color.Black].queenside,
        },
      },
      enPassantSquare: position.enPassantSquare
        ? { ...position.enPassantSquare }
        : null,
      halfMoveCount: position.halfMoveCount,
    },
  };

  // Null out the en passant square before possibly assigning it to a new
  // square.
  position.enPassantSquare = null;

  // If the move is a pawn promoting it will have the promotion property set.
  // In this case swap out the piece before executing the move so we only insert
  // a piece once.
  if (move.promotion) {
    piece = { ...piece, type: move.promotion };
  }

  // Execute the move
  let captured = pieces.get(move.to);
  if (captured) {
    result.captured = {
      square: move.to,
      piece: captured,
    };
  }
  pieces.delete(move.from);
  pieces.set(move.to, piece);

  if (captured) {
    // If the captured piece is a rook we need to update castling state.
    if (captured.type === PieceType.Rook) {
      if (squareEquals(move.to, ROOK_STARTING_SQUARES[piece.color].queenside)) {
        position.castlingAvailability[piece.color].queenside = false;
      } else if (
        squareEquals(move.to, ROOK_STARTING_SQUARES[piece.color].kingside)
      ) {
        position.castlingAvailability[piece.color].kingside = false;
      }
    }
  }

  // En passant pawn move handling.
  if (piece.type === PieceType.Pawn) {
    if (squareEquals(enPassantSquare, move.to)) {
      // This is an en passant capture
      const capturedSquare =
        piece.color === Color.White ? down(move.to) : up(move.to);
      captured = pieces.get(capturedSquare);
      if (captured) {
        result.captured = {
          square: capturedSquare,
          piece: captured,
        };
      } else {
        throw Error('no piece captured with en passant capture');
      }
      pieces.delete(capturedSquare);
    }

    if (isTwoRankMove(move)) {
      position.enPassantSquare =
        move.from.rank === 1 ? up(move.from) : down(move.from);
    }
  }

  // King move special handling.
  if (piece.type === PieceType.King) {
    // Update extra state
    position.kings[piece.color] = move.to;

    // The king moved, no more castling.
    position.castlingAvailability[piece.color].queenside = false;
    position.castlingAvailability[piece.color].kingside = false;

    // If the king move is a castle we need to move the corresponding rook.
    if (Math.abs(move.from.file - move.to.file) === 2) {
      if (move.from.file - move.to.file > 0) {
        // queenside
        const rookFromSquare = { rank: move.from.rank, file: 0 };
        const rookToSquare = { rank: move.from.rank, file: 3 };
        position.pieces.delete(rookFromSquare);
        position.pieces.set(rookToSquare, {
          color: piece.color,
          type: PieceType.Rook,
        });
      } else {
        // kingside
        const rookFromSquare = { rank: move.from.rank, file: 7 };
        const rookToSquare = { rank: move.from.rank, file: 5 };
        position.pieces.delete(rookFromSquare);
        position.pieces.set(rookToSquare, {
          color: piece.color,
          type: PieceType.Rook,
        });
      }
    }
  }

  // If the moved piece is a rook update castling state.
  if (piece.type === PieceType.Rook) {
    if (squareEquals(move.from, ROOK_STARTING_SQUARES[piece.color].queenside)) {
      position.castlingAvailability[piece.color].queenside = false;
    } else if (
      squareEquals(move.from, ROOK_STARTING_SQUARES[piece.color].kingside)
    ) {
      position.castlingAvailability[piece.color].kingside = false;
    }
  }

  if (position.turn === Color.Black) {
    position.fullMoveCount++;
  }
  if (piece.type !== PieceType.Pawn && !captured) {
    position.halfMoveCount++;
  } else {
    position.halfMoveCount = 0;
  }
  position.turn = flipColor(position.turn);

  return result;
};

export const undoMove = (position: Position, result: MoveResult): void => {
  const { move } = result;
  let piece = position.pieces.get(move.to);
  if (!piece) {
    throw Error('no piece to unmove');
  }

  // If the move was a promotion set the piece back to a pawn.
  if (move.promotion) {
    piece = { type: PieceType.Pawn, color: piece.color };
  }

  // Reverse the piece move.
  position.pieces.set(move.from, piece);
  position.pieces.delete(move.to);
  if (result.captured) {
    position.pieces.set(result.captured.square, result.captured.piece);
  }

  // If the king move is a castle we need to move the corresponding rook back.
  if (piece.type === PieceType.King) {
    // Update extra state
    position.kings[piece.color] = move.from;

    if (Math.abs(move.from.file - move.to.file) === 2) {
      if (move.from.file - move.to.file > 0) {
        // queenside
        const rookFromSquare = { rank: move.from.rank, file: 0 };
        const rookToSquare = { rank: move.from.rank, file: 3 };
        position.pieces.delete(rookToSquare);
        position.pieces.set(rookFromSquare, {
          color: piece.color,
          type: PieceType.Rook,
        });
      } else {
        // kingside
        const rookFromSquare = { rank: move.from.rank, file: 7 };
        const rookToSquare = { rank: move.from.rank, file: 5 };
        position.pieces.delete(rookToSquare);
        position.pieces.set(rookFromSquare, {
          color: piece.color,
          type: PieceType.Rook,
        });
      }
    }
  }

  // Undo rest of the position state.
  if (position.turn === Color.White) {
    position.fullMoveCount--;
  }
  position.turn = flipColor(position.turn);
  position.castlingAvailability = result.previousState.castlingAvailability;
  position.enPassantSquare = result.previousState.enPassantSquare;
  position.halfMoveCount = result.previousState.halfMoveCount;
};
