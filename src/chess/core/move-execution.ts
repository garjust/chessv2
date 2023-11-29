import { CastlingMask, ROOK_STARTING_SQUARES } from '../castling';
import { PIECES } from '../piece-consants';
import {
  CastlingState,
  Color,
  DirectionUnit,
  Move,
  Piece,
  PieceType,
  Square,
} from '../types';
import { flipColor, isStartPositionPawn } from '../utils';
import { updateSquareControlMaps } from './attacks';
import CurrentZobrist from './current-zobrist';
import { CASTLING_ROOK_MOVES } from './lookup';
import { PositionWithComputedData, ZobristKey } from './types';

export type MoveResult = {
  move: Move;
  captured?: { square: Square; piece: Piece };
  // Store state on the move result that we cannot reverse as easily as copying.
  previousState: {
    halfMoveCount: number;
    castlingState: CastlingState;
    enPassantSquare: Square | null;
    zobrist?: ZobristKey;
  };
};

const isTwoSquarePawnMove = (piece: Piece, move: Move): boolean => {
  if (
    piece.type !== PieceType.Pawn ||
    !isStartPositionPawn(piece.color, move.from)
  ) {
    return false;
  }

  return piece.color === Color.White
    ? move.to >= 24 && move.to < 32
    : move.to >= 32 && move.to < 40;
};

export const applyMove = (
  position: PositionWithComputedData,
  move: Move,
  currentZobrist: CurrentZobrist,
): MoveResult => {
  const { pieces } = position;
  let piece = position.pieces.get(move.from);

  let enPassantCaptureSquare: Square | undefined;
  let castlingRookMove: Move | undefined;

  if (!piece) {
    throw Error('no piece to move');
  }
  if (piece.color !== position.turn) {
    throw Error('cannot move piece for other color');
  }

  const result: MoveResult = {
    move,
    previousState: {
      castlingState: position.castlingState,
      enPassantSquare: position.enPassantSquare,
      halfMoveCount: position.halfMoveCount,
      zobrist: currentZobrist.key,
    },
  };

  // If the move is a pawn promoting it will have the promotion property set.
  // In this case swap out the piece before executing the move so we only insert
  // a piece once.
  if (move.promotion) {
    piece = { color: piece.color, type: move.promotion };
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

  currentZobrist.updateSquareOccupancy(move.from, piece);
  currentZobrist.updateSquareOccupancy(move.to, piece);

  if (captured) {
    // If the captured piece is a rook we need to update castling state.
    if (captured.type === PieceType.Rook) {
      if (move.to === ROOK_STARTING_SQUARES[captured.color].queenside) {
        position.castlingState &= ~(
          CastlingMask.WhiteQueenside <<
          (captured.color * 2)
        );
      } else if (move.to === ROOK_STARTING_SQUARES[captured.color].kingside) {
        position.castlingState &= ~(
          CastlingMask.WhiteKingside <<
          (captured.color * 2)
        );
      }
    }
  }

  // En passant pawn move handling.
  if (piece.type === PieceType.Pawn) {
    if (position.enPassantSquare === move.to) {
      // This is an en passant capture
      enPassantCaptureSquare =
        piece.color === Color.White
          ? move.to + DirectionUnit.Down
          : move.to + DirectionUnit.Up;
      captured = pieces.get(enPassantCaptureSquare);
      if (captured) {
        result.captured = {
          square: enPassantCaptureSquare,
          piece: captured,
        };
      } else {
        throw Error('no piece captured with en passant capture');
      }
      pieces.delete(enPassantCaptureSquare);
    }
  }

  if (isTwoSquarePawnMove(piece, move)) {
    position.enPassantSquare =
      piece.color === Color.White
        ? move.from + DirectionUnit.Up
        : move.from + DirectionUnit.Down;
  } else {
    position.enPassantSquare = null;
  }

  // King move special handling.
  if (piece.type === PieceType.King) {
    // Update extra state
    position.kings[piece.color] = move.to;

    // The king moved, no more castling.
    if (
      (position.castlingState &
        (CastlingMask.WhiteQueenside << (piece.color * 2))) >
      0
    ) {
      currentZobrist.updateCastling(piece.color, 'queenside');
      position.castlingState &= ~(
        CastlingMask.WhiteQueenside <<
        (piece.color * 2)
      );
    }
    if (
      (position.castlingState &
        (CastlingMask.WhiteKingside << (piece.color * 2))) >
      0
    ) {
      currentZobrist.updateCastling(piece.color, 'kingside');
      position.castlingState &= ~(
        CastlingMask.WhiteKingside <<
        (piece.color * 2)
      );
    }

    // If the king move is a castle we need to move the corresponding rook.
    if (move.from - move.to === 2) {
      // queenside
      const rook = PIECES[piece.color][PieceType.Rook];
      castlingRookMove = CASTLING_ROOK_MOVES[piece.color].queenside;

      position.pieces.delete(castlingRookMove.from);
      position.pieces.set(castlingRookMove.to, rook);
      currentZobrist.updateSquareOccupancy(castlingRookMove.from, rook);
      currentZobrist.updateSquareOccupancy(castlingRookMove.to, rook);
    } else if (move.from - move.to === -2) {
      // kingside
      const rook = PIECES[piece.color][PieceType.Rook];
      castlingRookMove = CASTLING_ROOK_MOVES[piece.color].kingside;

      position.pieces.delete(castlingRookMove.from);
      position.pieces.set(castlingRookMove.to, rook);
      currentZobrist.updateSquareOccupancy(castlingRookMove.from, rook);
      currentZobrist.updateSquareOccupancy(castlingRookMove.to, rook);
    }
  }

  // If the moved piece is a rook update castling state.
  if (piece.type === PieceType.Rook) {
    if (move.from === ROOK_STARTING_SQUARES[piece.color].queenside) {
      if (
        (position.castlingState &
          (CastlingMask.WhiteQueenside << (piece.color * 2))) >
        0
      ) {
        currentZobrist.updateCastling(piece.color, 'queenside');
        position.castlingState &= ~(
          CastlingMask.WhiteQueenside <<
          (piece.color * 2)
        );
      }
    } else if (move.from === ROOK_STARTING_SQUARES[piece.color].kingside) {
      if (
        (position.castlingState &
          (CastlingMask.WhiteKingside << (piece.color * 2))) >
        0
      ) {
        currentZobrist.updateCastling(piece.color, 'kingside');
        position.castlingState &= ~(
          CastlingMask.WhiteKingside <<
          (piece.color * 2)
        );
      }
    }
  }

  // Update pins state for both colors.
  for (const color of [Color.White, Color.Black]) {
    position.absolutePins[color].update(
      position.pieces,
      move,
      position.kings[color],
      castlingRookMove,
    );
  }
  updateSquareControlMaps(
    position.squareControlByColor,
    position.pieces,
    move,
    piece,
    result.captured !== undefined,
    enPassantCaptureSquare,
    castlingRookMove,
  );

  if (result.captured) {
    currentZobrist.updateSquareOccupancy(
      result.captured.square,
      result.captured.piece,
    );
  }
  currentZobrist.updateTurn();

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

export const undoMove = (
  position: PositionWithComputedData,
  result: MoveResult,
  currentZobrist: CurrentZobrist,
): void => {
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

    if (move.from - move.to === 2) {
      // queenside
      position.pieces.delete(CASTLING_ROOK_MOVES[piece.color].queenside.to);
      position.pieces.set(CASTLING_ROOK_MOVES[piece.color].queenside.from, {
        color: piece.color,
        type: PieceType.Rook,
      });
    } else if (move.from - move.to === -2) {
      // kingside
      position.pieces.delete(CASTLING_ROOK_MOVES[piece.color].kingside.to);
      position.pieces.set(CASTLING_ROOK_MOVES[piece.color].kingside.from, {
        color: piece.color,
        type: PieceType.Rook,
      });
    }
  }

  position.squareControlByColor[Color.White].revert();
  position.squareControlByColor[Color.Black].revert();
  position.absolutePins[Color.White].revert();
  position.absolutePins[Color.Black].revert();

  if (result.previousState.zobrist) {
    currentZobrist.key = result.previousState.zobrist;
  }

  // Undo rest of the position state.
  if (position.turn === Color.White) {
    position.fullMoveCount--;
  }
  position.turn = flipColor(position.turn);
  position.castlingState = result.previousState.castlingState;
  position.enPassantSquare = result.previousState.enPassantSquare;
  position.halfMoveCount = result.previousState.halfMoveCount;
};
