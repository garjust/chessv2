import {
  Color,
  ComputedPositionData,
  Move,
  MoveWithExtraData,
  MovesByPiece,
  Moveset,
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
    const moves = findSquaresForMove(position, piece, square);
    movesets.push({
      square,
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
  | 'opponentMovesByPiece'
  | 'totalMoves'
  | 'availableCaptures'
  | 'availableAttacks'
  | 'availableChecks'
  | 'checksOnSelf'
  | 'checkmate'
> => {
  const movesByPiece: MovesByPiece = new Map<
    PieceType,
    SquareMap<MoveWithExtraData[]>
  >();
  movesByPiece.set(PieceType.Bishop, new SquareMap<MoveWithExtraData[]>());
  movesByPiece.set(PieceType.King, new SquareMap<MoveWithExtraData[]>());
  movesByPiece.set(PieceType.Knight, new SquareMap<MoveWithExtraData[]>());
  movesByPiece.set(PieceType.Pawn, new SquareMap<MoveWithExtraData[]>());
  movesByPiece.set(PieceType.Queen, new SquareMap<MoveWithExtraData[]>());
  movesByPiece.set(PieceType.Rook, new SquareMap<MoveWithExtraData[]>());

  const opponentMovesByPiece: MovesByPiece = new Map<
    PieceType,
    SquareMap<MoveWithExtraData[]>
  >();
  opponentMovesByPiece.set(
    PieceType.Bishop,
    new SquareMap<MoveWithExtraData[]>()
  );
  opponentMovesByPiece.set(
    PieceType.King,
    new SquareMap<MoveWithExtraData[]>()
  );
  opponentMovesByPiece.set(
    PieceType.Knight,
    new SquareMap<MoveWithExtraData[]>()
  );
  opponentMovesByPiece.set(
    PieceType.Pawn,
    new SquareMap<MoveWithExtraData[]>()
  );
  opponentMovesByPiece.set(
    PieceType.Queen,
    new SquareMap<MoveWithExtraData[]>()
  );
  opponentMovesByPiece.set(
    PieceType.Rook,
    new SquareMap<MoveWithExtraData[]>()
  );

  let checkmate = false;
  let totalMoves = 0;
  const availableCaptures: Move[] = [];
  const availableAttacks: Move[] = [];
  const availableChecks: Move[] = [];
  const checksOnSelf: Move[] = [];

  // const opponentMovesets = movesetsForPosition(
  //   position,
  //   position.turn === Color.White ? Color.Black : Color.White
  // );
  // opponentMovesets.forEach(({ piece, square, moves }) => {
  //   const map = movesByPiece.get(piece.type);
  //   if (map) {
  //     map.set(
  //       square,
  //       moves.map((moveDetail) => {
  //         if (moveDetail.kingCapture) {
  //           checksOnSelf.push({ from: square, to: moveDetail.to });
  //         }
  //         return moveDetail;
  //       })
  //     );
  //     totalMoves += moves.length;
  //   }
  // });

  // const inCheck = checksOnSelf.length > 0;

  const movesets = movesetsForPosition(position, position.turn);
  movesets.forEach(({ piece, square, moves }) => {
    const map = movesByPiece.get(piece.type);
    if (map) {
      map.set(
        square,
        moves.map((move) => {
          if (move.capture) {
            availableCaptures.push({ from: square, to: move.to });
          }
          if (move.attack) {
            availableAttacks.push({ from: square, to: move.to });
          }
          if (move.kingAttack) {
            availableChecks.push({ from: square, to: move.to });
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
    opponentMovesByPiece,
    totalMoves,
    availableCaptures,
    availableAttacks,
    availableChecks,
    checksOnSelf,
    checkmate,
  };
};
