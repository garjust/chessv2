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
import { isLegalSquare, squareEquals, SquareMap, flipColor } from '../utils';
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
  isPromotionPositionPawn,
  isStartPositionPawn,
} from './move-utils';

const pawnMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Pick<MoveWithExtraData, 'to' | 'capture' | 'kingCapture'>[] => {
  let squares: Square[] = [];
  const opponentColor = flipColor(piece.color);
  const advanceFn = piece.color === Color.White ? up : down;

  // Space forward of the pawn.
  if (
    !position.pieces.get(advanceFn(square)) &&
    isLegalSquare(advanceFn(square))
  ) {
    squares.push(advanceFn(square));

    // Space two squares forward of the pawn when it is in it's starting rank.
    if (
      !position.pieces.get(advanceFn(square, 2)) &&
      isStartPositionPawn(piece, square)
    ) {
      squares.push(advanceFn(square, 2));
    }
  }

  // Pawn captures diagonally.
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

  // If the pawn will promote on next advancement take the possible pawn moves
  // and add possible promotions.
  if (isPromotionPositionPawn(piece, square)) {
    squares = squares.flatMap((move) =>
      [PieceType.Bishop, PieceType.Knight, PieceType.Queen, PieceType.Rook].map(
        (pieceType) => ({ ...move, promotion: pieceType })
      )
    );
  }

  return squares.map((square) => ({
    to: square,
    ...findCaptures(position, square),
  }));
};

const knightMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Pick<MoveWithExtraData, 'to' | 'capture' | 'kingCapture'>[] =>
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
        isLegalSquare(candidateSquare) &&
        position.pieces.get(candidateSquare)?.color !== piece.color
    )
    .map((square) => ({
      to: square,
      ...findCaptures(position, square),
    }));

const kingMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Pick<MoveWithExtraData, 'to' | 'capture' | 'kingCapture'>[] => {
  const squares = [
    up(square),
    left(square),
    right(square),
    down(square),
    upLeft(square),
    upRight(square),
    downLeft(square),
    downRight(square),
  ].filter(
    (candidateSquare) =>
      isLegalSquare(candidateSquare) &&
      position.pieces.get(candidateSquare)?.color !== piece.color
  );

  // Check if castling is possible and there are no pieces between the king
  // and the corresponding rook.
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

  return squares.map((square) => ({
    to: square,
    ...findCaptures(position, square),
  }));
};

const bishopMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Pick<MoveWithExtraData, 'to' | 'capture' | 'kingCapture'>[] =>
  [upLeft, upRight, downLeft, downRight]
    .flatMap((scanFn) => squareScanner(position, square, piece.color, scanFn))
    .map((square) => ({
      to: square,
      ...findCaptures(position, square),
    }));

const rookMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Pick<MoveWithExtraData, 'to' | 'capture' | 'kingCapture'>[] =>
  [up, right, left, down]
    .flatMap((scanFn) => squareScanner(position, square, piece.color, scanFn))
    .map((square) => ({
      to: square,
      ...findCaptures(position, square),
    }));

const queenMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Pick<MoveWithExtraData, 'to' | 'capture' | 'kingCapture'>[] => [
  ...bishopMoves(position, piece, square),
  ...rookMoves(position, piece, square),
];

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

const augmentMoveWithAttacks = (
  position: Position,
  piece: Piece,
  move: Omit<MoveWithExtraData, 'attack' | 'kingAttack'>
): MoveWithExtraData => {
  const nextMoves = movesForPiece(position, piece, move.to);

  return {
    ...move,
    attack: nextMoves.some(({ capture }) => capture),
    kingAttack: nextMoves.some(({ kingCapture }) => kingCapture),
  };
};

const augmentMovesWithAttacks = (
  position: Position,
  piece: Piece,
  moves: Omit<MoveWithExtraData, 'attack' | 'kingAttack'>[]
): MoveWithExtraData[] =>
  moves.map((move) => augmentMoveWithAttacks(position, piece, move));

const movesForPiece = (position: Position, piece: Piece, square: Square) => {
  const moves: Pick<
    MoveWithExtraData,
    'to' | 'capture' | 'kingCapture' | 'promotion'
  >[] = [];

  switch (piece.type) {
    case PieceType.Bishop:
      moves.push(...bishopMoves(position, piece, square));
      break;
    case PieceType.King:
      moves.push(...kingMoves(position, piece, square));
      break;
    case PieceType.Knight:
      moves.push(...knightMoves(position, piece, square));
      break;
    case PieceType.Pawn:
      moves.push(...pawnMoves(position, piece, square));
      break;
    case PieceType.Queen:
      moves.push(...queenMoves(position, piece, square));
      break;
    case PieceType.Rook:
      moves.push(...rookMoves(position, piece, square));
      break;
  }

  return moves.filter(({ to }) => isLegalSquare(to));
};

const movesForPosition = (position: Position, color?: Color): PieceMoves[] => {
  const pieceMoves: PieceMoves[] = [];

  for (const [square, piece] of position.pieces.entries()) {
    if (color && piece.color !== color) {
      continue;
    }
    const moves = movesForPiece(position, piece, square);
    pieceMoves.push({
      from: square,
      piece,
      moves: augmentMovesWithAttacks(position, piece, moves),
    });
  }

  return pieceMoves;
};

export const isCheck = (position: Position, color?: Color): boolean =>
  Boolean(checkedSquare(position, color));

export const checkedSquare = (
  position: Position,
  color?: Color
): Square | undefined => {
  let square;
  movesForPosition(position, color).find(({ moves }) =>
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

  let totalMoves = 0;
  const availableCaptures: Move[] = [];
  const availableAttacks: Move[] = [];
  const availableChecks: Move[] = [];
  const checksOnSelf: Move[] = [];

  const movesets = movesForPosition(position, position.turn);
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
  };
};
