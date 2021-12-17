import {
  Color,
  ComputedPositionData,
  Move,
  MoveDetail,
  MovesByPiece,
  Moveset,
  Piece,
  PieceType,
  Position,
  Square,
} from './types';
import {
  isLegalSquare,
  squareEquals,
  SquareMap,
  squaresInclude,
  BLACK_PAWN_STARTING_RANK,
  WHITE_PAWN_STARTING_RANK,
  WHITE_QUEENSIDE_ROOK_START_SQUARE,
  WHITE_KINGSIDE_ROOK_START_SQUARE,
  BLACK_QUEENSIDE_ROOK_START_SQUARE,
  BLACK_KINGSIDE_ROOK_START_SQUARE,
} from './utils';

const up = (square: Square, n = 1): Square => ({
  rank: square.rank + n,
  file: square.file,
});

const down = (square: Square, n = 1): Square => ({
  rank: square.rank - n,
  file: square.file,
});

const left = (square: Square, n = 1): Square => ({
  rank: square.rank,
  file: square.file - n,
});

const right = (square: Square, n = 1): Square => ({
  rank: square.rank,
  file: square.file + n,
});

const upLeft = (square: Square, n = 1): Square => up(left(square, n), n);
const upRight = (square: Square, n = 1): Square => up(right(square, n), n);
const downLeft = (square: Square, n = 1): Square => down(left(square, n), n);
const downRight = (square: Square, n = 1): Square => down(right(square, n), n);

const squareScanner = (position: Position, piece: Piece) => {
  const scan = (
    squares: Square[],
    scanFn: (square: Square) => Square
  ): Square[] => {
    const next = scanFn(squares[squares.length - 1]);
    if (!isLegalSquare(next)) {
      return squares;
    }

    const nextPiece = position.pieces.get(next);
    if (nextPiece) {
      if (nextPiece.color === piece.color) {
        // friend!
        return squares;
      } else {
        // foe!
        return [...squares, next];
      }
    }

    // empty! keep scanning!
    return scan([...squares, next], scanFn);
  };

  return scan;
};

const isStartPositionPawn = (piece: Piece, square: Square): boolean =>
  piece.color === Color.White
    ? square.rank === WHITE_PAWN_STARTING_RANK
    : square.rank === BLACK_PAWN_STARTING_RANK;

const isTwoSquarePawnMove = (move: Move): boolean =>
  Math.abs(move.from.rank - move.to.rank) == 2;

const enPassantSquareFromMove = (piece: Piece, move: Move): Square | null => {
  if (piece.type === PieceType.Pawn && isTwoSquarePawnMove(move)) {
    return move.from.rank === 1 ? up(move.from) : down(move.from);
  } else {
    return null;
  }
};

const pawnMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => {
  const squares: Square[] = [];
  const opponentColor = piece.color === Color.White ? Color.Black : Color.White;
  const advanceFn = piece.color === Color.White ? up : down;

  // space above the pawn.
  if (!position.pieces.get(advanceFn(square))) {
    squares.push(advanceFn(square));

    // space two squares above the pawn and it is in the starting position.
    if (
      !position.pieces.get(advanceFn(square, 2)) &&
      isStartPositionPawn(piece, square)
    ) {
      squares.push(advanceFn(square, 2));
    }
  }

  if (
    position.pieces.get(advanceFn(left(square)))?.color === opponentColor ||
    squareEquals(position.enPassantSquare, advanceFn(left(square)))
  ) {
    squares.push(advanceFn(left(square)));
  }
  if (
    position.pieces.get(advanceFn(right(square)))?.color === opponentColor ||
    squareEquals(position.enPassantSquare, advanceFn(right(square)))
  ) {
    squares.push(advanceFn(right(square)));
  }

  return squares;
};

const bishopMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => {
  const squares: Square[] = [];

  [upLeft, upRight, downLeft, downRight].forEach((scanFn) => {
    squares.push(...squareScanner(position, piece)([square], scanFn).slice(1));
  });

  return squares;
};

const knightMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => {
  const squares: Square[] = [];

  [
    up(left(square), 2),
    up(right(square), 2),
    left(up(square), 2),
    left(down(square), 2),
    down(left(square), 2),
    down(right(square), 2),
    right(up(square), 2),
    right(down(square), 2),
  ]
    .filter(
      (candidateSquare) =>
        position.pieces.get(candidateSquare)?.color !== piece.color
    )
    .forEach((candidateSquare) => squares.push(candidateSquare));

  return squares;
};

const kingMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => {
  const squares: Square[] = [];

  [
    up(square),
    left(square),
    right(square),
    down(square),
    upLeft(square),
    upRight(square),
    downLeft(square),
    downRight(square),
  ]
    .filter(
      (candidateSquare) =>
        position.pieces.get(candidateSquare)?.color !== piece.color
    )
    .forEach((candidateSquare) => squares.push(candidateSquare));

  if (
    position.castlingAvailability[piece.color].kingside &&
    !position.pieces.get(right(square)) &&
    !position.pieces.get(right(square, 2))
  ) {
    squares.push(right(square, 2));
  }
  if (
    position.castlingAvailability[piece.color].queenside &&
    !position.pieces.get(left(square)) &&
    !position.pieces.get(left(square, 2)) &&
    !position.pieces.get(left(square, 3))
  ) {
    squares.push(left(square, 2));
  }

  return squares;
};

const queenMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => {
  const squares: Square[] = [];

  [up, right, left, down, upLeft, upRight, downLeft, downRight].forEach(
    (scanFn) => {
      squares.push(
        ...squareScanner(position, piece)([square], scanFn).slice(1)
      );
    }
  );

  return squares;
};

const rookMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => {
  const squares: Square[] = [];

  [up, right, left, down].forEach((scanFn) => {
    squares.push(...squareScanner(position, piece)([square], scanFn).slice(1));
  });

  return squares;
};

const movesetsForPosition = (position: Position, color?: Color): Moveset[] => {
  const movesets: Moveset[] = [];

  for (const [square, piece] of position.pieces.entries()) {
    if (color && piece.color !== color) {
      continue;
    }
    const moves = findSquaresForMove(position, square);
    movesets.push({
      square,
      piece,
      moves: augmentMoves(position, moves),
    });
  }

  return movesets;
};

const augmentMove = (position: Position, move: Square): MoveDetail => {
  const targetPiece = position.pieces.get(move);
  return {
    to: move,
    capture: Boolean(targetPiece),
    kingCapture: Boolean(targetPiece && targetPiece.type === PieceType.King),
  };
};

const augmentMoves = (position: Position, moves: Square[]): MoveDetail[] =>
  moves.map((move) => augmentMove(position, move));

export const findSquaresForMove = (
  position: Position,
  square: Square
): Square[] => {
  const piece = position.pieces.get(square);
  if (!piece) {
    throw Error('no piece to find moves for');
  }

  const squares: Square[] = [];

  switch (piece.type) {
    case PieceType.Bishop:
      squares.push(...bishopMoves(position, piece, square));
      break;
    case PieceType.King:
      squares.push(...kingMoves(position, piece, square));
      break;
    case PieceType.Knight:
      squares.push(...knightMoves(position, piece, square));
      break;
    case PieceType.Pawn:
      squares.push(...pawnMoves(position, piece, square));
      break;
    case PieceType.Queen:
      squares.push(...queenMoves(position, piece, square));
      break;
    case PieceType.Rook:
      squares.push(...rookMoves(position, piece, square));
      break;
  }

  return squares.filter(isLegalSquare);
};

export const applyMove = (position: Position, move: Move): Position => {
  const pieces = new SquareMap<Piece>();
  for (const [key, value] of position.pieces) {
    pieces.set(key, value);
  }
  const castlingAvailability = { ...position.castlingAvailability };

  const piece = pieces.get(move.from);

  if (!piece) {
    throw Error('no piece to move');
  }
  if (piece.color !== position.turn) {
    throw Error('cannot move piece for other color');
  }

  const legalSquares = findSquaresForMove(position, move.from);
  if (!squaresInclude(legalSquares, move.to)) {
    throw Error('illegal move!');
  }

  // Execute the move
  let isCapture = pieces.delete(move.from);
  pieces.set(move.to, piece);

  if (piece.type === PieceType.Rook) {
    if (squareEquals(move.from, WHITE_QUEENSIDE_ROOK_START_SQUARE)) {
      castlingAvailability[Color.White].queenside = false;
    } else if (squareEquals(move.from, WHITE_KINGSIDE_ROOK_START_SQUARE)) {
      castlingAvailability[Color.White].kingside = false;
    } else if (squareEquals(move.from, BLACK_QUEENSIDE_ROOK_START_SQUARE)) {
      castlingAvailability[Color.Black].queenside = false;
    } else if (squareEquals(move.from, BLACK_KINGSIDE_ROOK_START_SQUARE)) {
      castlingAvailability[Color.Black].kingside = false;
    }
  }

  if (piece.type === PieceType.King) {
    castlingAvailability[piece.color].queenside = false;
    castlingAvailability[piece.color].kingside = false;

    // This is a castling move
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
        castlingAvailability[piece.color].kingside = false;
      }
    }
  }

  if (
    piece.type === PieceType.Pawn &&
    squareEquals(position.enPassantSquare, move.to)
  ) {
    // This is an en passant capture
    isCapture = true;
    if (piece.color === Color.White) {
      pieces.delete(down(move.to));
    } else {
      pieces.delete(up(move.to));
    }
  }

  return Object.freeze({
    pieces,
    turn: position.turn === Color.White ? Color.Black : Color.White,
    castlingAvailability,
    enPassantSquare: enPassantSquareFromMove(piece, move),
    halfMoveCount:
      piece.type !== PieceType.Pawn && !isCapture
        ? position.halfMoveCount + 1
        : 0,
    fullMoveCount:
      position.turn === Color.Black
        ? position.fullMoveCount + 1
        : position.fullMoveCount,
  });
};

export const isCheck = (position: Position, color?: Color): boolean =>
  Boolean(checkedSquare(position, color));

export const checkedSquare = (
  position: Position,
  color?: Color
): Square | undefined => {
  let square;
  movesetsForPosition(position, color).find(({ moves }) =>
    moves.find(({ kingCapture, to }) => {
      if (kingCapture) {
        square = to;
      }
    })
  );

  return square;
};

export const computeMovementData = (
  position: Position
): Pick<
  ComputedPositionData,
  | 'movesByPiece'
  | 'totalMoves'
  | 'availableCaptures'
  | 'availableChecks'
  | 'checksOnSelf'
  | 'checkmate'
> => {
  const movesByPiece: MovesByPiece = new Map<
    PieceType,
    SquareMap<MoveDetail[]>
  >();
  movesByPiece.set(PieceType.Bishop, new SquareMap<MoveDetail[]>());
  movesByPiece.set(PieceType.King, new SquareMap<MoveDetail[]>());
  movesByPiece.set(PieceType.Knight, new SquareMap<MoveDetail[]>());
  movesByPiece.set(PieceType.Pawn, new SquareMap<MoveDetail[]>());
  movesByPiece.set(PieceType.Queen, new SquareMap<MoveDetail[]>());
  movesByPiece.set(PieceType.Rook, new SquareMap<MoveDetail[]>());

  let checkmate = false;
  let totalMoves = 0;
  const availableCaptures: Move[] = [];
  const availableChecks: Move[] = [];

  const movesets = movesetsForPosition(position, position.turn);
  movesets.forEach(({ piece, square, moves }) => {
    const map = movesByPiece.get(piece.type);
    if (map) {
      map.set(
        square,
        moves.map(({ to, capture, kingCapture }) => {
          if (capture) {
            availableCaptures.push({ from: square, to });
          }
          if (kingCapture) {
            checkmate = true;
          }
          return { to, capture, kingCapture };
        })
      );
      totalMoves += moves.length;
    }
  });

  return {
    movesByPiece,
    totalMoves,
    availableCaptures,
    availableChecks,
    checksOnSelf: [],
    checkmate,
  };
};
