import {
  CastlingAvailability,
  Color,
  Move,
  Piece,
  PieceType,
  Square,
} from '../types';
import {
  ROOK_STARTING_SQUARES,
  flipColor,
  isStartPositionPawn,
} from '../utils';
import { updateChecksOnKings } from './checks';
import { down, up } from './move-utils';
import { updatePinsOnKings } from './pins';
import { KingChecks, KingPins, Position } from './types';

export type MoveResult = {
  move: Move;
  captured?: { square: Square; piece: Piece };
  // Store state on the move result that we cannot reverse.
  previousState: {
    halfMoveCount: number;
    castlingAvailability: CastlingAvailability;
    enPassantSquare: Square | null;
    pinsToKing: KingPins;
    checks: KingChecks;
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

export const applyMove = (position: Position, move: Move): MoveResult => {
  const { pieces } = position;
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
      enPassantSquare: position.enPassantSquare,
      halfMoveCount: position.halfMoveCount,
      pinsToKing: { ...position.pinsToKing },
      checks: { ...position.checks },
    },
  };

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
      if (move.to === ROOK_STARTING_SQUARES[captured.color].queenside) {
        position.castlingAvailability[captured.color].queenside = false;
      } else if (move.to === ROOK_STARTING_SQUARES[captured.color].kingside) {
        position.castlingAvailability[captured.color].kingside = false;
      }
    }
  }

  // En passant pawn move handling.
  if (piece.type === PieceType.Pawn) {
    if (position.enPassantSquare === move.to) {
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
  }

  if (isTwoSquarePawnMove(piece, move)) {
    position.enPassantSquare =
      piece.color === Color.White ? up(move.from) : down(move.from);
  } else {
    position.enPassantSquare = null;
  }

  // King move special handling.
  if (piece.type === PieceType.King) {
    // Update extra state
    position.kings[piece.color] = move.to;

    // The king moved, no more castling.
    position.castlingAvailability[piece.color].queenside = false;
    position.castlingAvailability[piece.color].kingside = false;

    // If the king move is a castle we need to move the corresponding rook.
    if (move.from - move.to === 2) {
      // queenside
      const rookFromSquare = ROOK_STARTING_SQUARES[piece.color].queenside;
      const rookToSquare = piece.color === Color.White ? 3 : 59;
      position.pieces.delete(rookFromSquare);
      position.pieces.set(rookToSquare, {
        color: piece.color,
        type: PieceType.Rook,
      });
    } else if (move.from - move.to === -2) {
      // kingside
      const rookFromSquare = ROOK_STARTING_SQUARES[piece.color].kingside;
      const rookToSquare = piece.color === Color.White ? 5 : 61;
      position.pieces.delete(rookFromSquare);
      position.pieces.set(rookToSquare, {
        color: piece.color,
        type: PieceType.Rook,
      });
    }
  }

  // If the moved piece is a rook update castling state.
  if (piece.type === PieceType.Rook) {
    if (move.from === ROOK_STARTING_SQUARES[piece.color].queenside) {
      position.castlingAvailability[piece.color].queenside = false;
    } else if (move.from === ROOK_STARTING_SQUARES[piece.color].kingside) {
      position.castlingAvailability[piece.color].kingside = false;
    }
  }

  updatePinsOnKings(
    position.pinsToKing,
    position.pieces,
    position.kings,
    position.turn,
    move,
    piece
  );
  // NOTE: Re-enable this when up to date check data is needed for move ordering
  // or evaluation. This adds check calculation to the leaf nodes of a move
  // search, while currently check calculation only happens in nodes of depth
  // N-1 in the search.
  // updateChecksOnKings(
  //   position.checks,
  //   position.pieces,
  //   position.kings,
  //   position.turn,
  //   move,
  //   piece,
  //   {
  //     enPassantSquare: position.enPassantSquare,
  //     castlingAvailability: position.castlingAvailability,
  //   }
  // );

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

    if (move.from - move.to === 2) {
      // queenside
      const rookFromSquare = ROOK_STARTING_SQUARES[piece.color].queenside;
      const rookToSquare = piece.color === Color.White ? 3 : 59;
      position.pieces.delete(rookToSquare);
      position.pieces.set(rookFromSquare, {
        color: piece.color,
        type: PieceType.Rook,
      });
    } else if (move.from - move.to === -2) {
      // kingside
      const rookFromSquare = ROOK_STARTING_SQUARES[piece.color].kingside;
      const rookToSquare = piece.color === Color.White ? 5 : 61;
      position.pieces.delete(rookToSquare);
      position.pieces.set(rookFromSquare, {
        color: piece.color,
        type: PieceType.Rook,
      });
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
  position.pinsToKing = result.previousState.pinsToKing;
  position.checks = result.previousState.checks;
};
