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
import { pinsToSquare } from './move-generation';
import { KING_RAYS_FLAT } from './move-lookup';
import { down, up } from './move-utils';
import { KingSquares, Pin, Pins, Position } from './types';

const findPinsOnKings = (pieces: Map<Square, Piece>, kings: KingSquares) => {
  const whiteKing = kings[Color.White];
  const blackKing = kings[Color.Black];

  let whitePins;
  let blackPins;

  if (whiteKing) {
    whitePins = pinsToSquare(pieces, whiteKing, Color.White);
  }
  if (blackKing) {
    blackPins = pinsToSquare(pieces, blackKing, Color.Black);
  }

  return {
    [Color.White]: whitePins ? whitePins : new Map<Square, Pin>(),
    [Color.Black]: blackPins ? blackPins : new Map<Square, Pin>(),
  };
};

export type MoveResult = {
  move: Move;
  captured?: { square: Square; piece: Piece };
  // Store state on the move result that we cannot reverse.
  previousState: {
    halfMoveCount: number;
    castlingAvailability: CastlingAvailability;
    enPassantSquare: Square | null;
    pinsToKing: Pins;
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
    ? move.to >= 24 && move.from < 32
    : move.to >= 32 && move.from < 40;
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
      pinsToKing: position.pinsToKing,
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

  // updatePins(
  //   move,
  //   piece,
  //   position.pieces,
  //   position.kings,
  //   position.pinsToKing,
  //   position.turn
  // );
  // Just stupidly recompute the pins for now. If we mutate instead we can't
  // persist in previousState of the move result.
  position.pinsToKing = findPinsOnKings(position.pieces, position.kings);

  if (position.turn === Color.Black) {
    position.fullMoveCount++;
  }
  if (piece.type !== PieceType.Pawn && !captured) {
    position.halfMoveCount++;
  } else {
    position.halfMoveCount = 0;
  }
  position.turn = flipColor(position.turn);

  // console.log(
  //   'pins',
  //   'white',
  //   JSON.stringify(Array.from(position.pinsToKing.WHITE.values()), null, 2),
  //   'black',
  //   JSON.stringify(Array.from(position.pinsToKing.BLACK.values()), null, 2)
  // );

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

  // console.log('undoMove pins', position.pinsToKing);
};
