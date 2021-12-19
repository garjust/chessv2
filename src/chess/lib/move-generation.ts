import {
  Color,
  ComputedPositionData,
  Move,
  MoveWithExtraData,
  MovesByPiece,
  PieceMoves,
  Piece,
  PieceType,
  Position,
  Square,
} from '../types';
import {
  isLegalSquare,
  squareEquals,
  SquareMap,
  BLACK_PAWN_STARTING_RANK,
  WHITE_PAWN_STARTING_RANK,
  flipColor,
} from '../utils';
import {
  down,
  left,
  right,
  up,
  upLeft,
  upRight,
  downLeft,
  downRight,
  squareScanner,
} from './move-utils';

const isStartPositionPawn = (piece: Piece, square: Square): boolean =>
  piece.color === Color.White
    ? square.rank === WHITE_PAWN_STARTING_RANK
    : square.rank === BLACK_PAWN_STARTING_RANK;

const pawnMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => {
  const squares: Square[] = [];
  const opponentColor = flipColor(piece.color);
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

const bishopMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => {
  const squares: Square[] = [];

  [upLeft, upRight, downLeft, downRight].forEach((scanFn) => {
    squares.push(
      ...squareScanner(position, piece.color)([square], scanFn).slice(1)
    );
  });

  return squares;
};

const rookMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => {
  const squares: Square[] = [];

  [up, right, left, down].forEach((scanFn) => {
    squares.push(
      ...squareScanner(position, piece.color)([square], scanFn).slice(1)
    );
  });

  return squares;
};

const queenMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => [
  ...bishopMoves(position, piece, square),
  ...rookMoves(position, piece, square),
];

const movesetsForPosition = (
  position: Position,
  color?: Color
): PieceMoves[] => {
  const movesets: PieceMoves[] = [];

  for (const [square, piece] of position.pieces.entries()) {
    if (color && piece.color !== color) {
      continue;
    }
    const moves = findSquaresForMove(position, piece, square);
    movesets.push({
      from: square,
      piece,
      moves: augmentMoves(position, piece, moves),
    });
  }

  return movesets;
};

const findCaptures = (
  position: Position,
  to: Square
): { capture: boolean; kingCapture: boolean } => {
  const targetPiece = position.pieces.get(to);

  return {
    capture: Boolean(targetPiece),
    kingCapture: Boolean(targetPiece && targetPiece.type === PieceType.King),
  };
};

const augmentMove = (
  position: Position,
  piece: Piece,
  to: Square
): MoveWithExtraData => {
  const furtherMoves = findSquaresForMove(position, piece, to);
  const furtherMovesWithCaptures = furtherMoves.map((furtherMove) => ({
    to,
    ...findCaptures(position, furtherMove),
  }));

  return {
    to,
    ...findCaptures(position, to),
    attack: furtherMovesWithCaptures.some(({ capture }) => capture),
    kingAttack: furtherMovesWithCaptures.some(({ kingCapture }) => kingCapture),
  };
};

const augmentMoves = (
  position: Position,
  piece: Piece,
  moves: Square[]
): MoveWithExtraData[] =>
  moves.map((move) => augmentMove(position, piece, move));

export const findSquaresForMove = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => {
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
  | 'availableAttacks'
  | 'availableChecks'
  | 'checkmate'
> => {
  const movesByPiece: MovesByPiece = new Map<
    PieceType,
    SquareMap<MoveWithExtraData[]>
  >([
    [PieceType.Bishop, new SquareMap<MoveWithExtraData[]>()],
    [PieceType.King, new SquareMap<MoveWithExtraData[]>()],
    [PieceType.Knight, new SquareMap<MoveWithExtraData[]>()],
    [PieceType.Pawn, new SquareMap<MoveWithExtraData[]>()],
    [PieceType.Queen, new SquareMap<MoveWithExtraData[]>()],
    [PieceType.Rook, new SquareMap<MoveWithExtraData[]>()],
  ]);

  let checkmate = false;
  let totalMoves = 0;
  const availableCaptures: Move[] = [];
  const availableAttacks: Move[] = [];
  const availableChecks: Move[] = [];
  const checksOnSelf: Move[] = [];

  const movesets = movesetsForPosition(position, position.turn);
  movesets.forEach(({ piece, from, moves }) => {
    const map = movesByPiece.get(piece.type);
    if (map) {
      map.set(
        from,
        moves.map((move) => {
          if (move.capture) {
            availableCaptures.push({ from, to: move.to });
          }
          if (move.attack) {
            availableAttacks.push({ from, to: move.to });
          }
          if (move.kingAttack) {
            availableChecks.push({ from, to: move.to });
          }
          if (move.kingCapture) {
            checkmate = true;
          }
          return move;
        })
      );
      totalMoves += moves.length;
    }
  });

  return {
    movesByPiece,
    totalMoves,
    availableCaptures,
    availableAttacks,
    availableChecks,
    checkmate,
  };
};
