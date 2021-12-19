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
  color: Color,
  from: Square,
  attacksOnly = false
): Pick<MoveWithExtraData, 'to' | 'capture' | 'kingCapture'>[] => {
  let squares: Square[] = [];
  const opponentColor = flipColor(color);
  const advanceFn = color === Color.White ? up : down;

  // Space forward of the pawn.
  if (
    !position.pieces.get(advanceFn(from)) &&
    isLegalSquare(advanceFn(from)) &&
    !attacksOnly
  ) {
    squares.push(advanceFn(from));

    // Space two squares forward of the pawn when it is in it's starting rank.
    if (
      !position.pieces.get(advanceFn(from, 2)) &&
      isStartPositionPawn(color, from)
    ) {
      squares.push(advanceFn(from, 2));
    }
  }

  // Pawn captures diagonally.
  if (
    position.pieces.get(advanceFn(left(from)))?.color === opponentColor ||
    squareEquals(position.enPassantSquare, advanceFn(left(from)))
  ) {
    squares.push(advanceFn(left(from)));
  }
  if (
    position.pieces.get(advanceFn(right(from)))?.color === opponentColor ||
    squareEquals(position.enPassantSquare, advanceFn(right(from)))
  ) {
    squares.push(advanceFn(right(from)));
  }

  // If the pawn will promote on next advancement take the possible pawn moves
  // and add possible promotions.
  if (isPromotionPositionPawn(color, from)) {
    squares = squares.flatMap((move) =>
      [PieceType.Bishop, PieceType.Knight, PieceType.Queen, PieceType.Rook].map(
        (pieceType) => ({ ...move, promotion: pieceType })
      )
    );
  }

  return squares.map((to) => ({
    to,
    ...findCaptures(position, to),
  }));
};

const knightMoves = (
  position: Position,
  color: Color,
  from: Square
): Pick<MoveWithExtraData, 'to' | 'capture' | 'kingCapture'>[] =>
  [
    up(left(from), 2),
    up(right(from), 2),
    left(up(from), 2),
    left(down(from), 2),
    down(left(from), 2),
    down(right(from), 2),
    right(up(from), 2),
    right(down(from), 2),
  ]
    .filter(
      (to) => isLegalSquare(to) && position.pieces.get(to)?.color !== color
    )
    .map((to) => ({
      to,
      ...findCaptures(position, to),
    }));

const kingMoves = (
  position: Position,
  color: Color,
  from: Square
): Pick<MoveWithExtraData, 'to' | 'capture' | 'kingCapture'>[] => {
  const squares = [
    up(from),
    left(from),
    right(from),
    down(from),
    upLeft(from),
    upRight(from),
    downLeft(from),
    downRight(from),
  ].filter(
    (to) => isLegalSquare(to) && position.pieces.get(to)?.color !== color
  );

  // Check if castling is possible and there are no pieces between the king
  // and the corresponding rook.
  if (
    position.castlingAvailability[color].kingside &&
    !position.pieces.get(right(from)) &&
    !position.pieces.get(right(from, 2))
  ) {
    squares.push(right(from, 2));
  }
  if (
    position.castlingAvailability[color].queenside &&
    !position.pieces.get(left(from)) &&
    !position.pieces.get(left(from, 2)) &&
    !position.pieces.get(left(from, 3))
  ) {
    squares.push(left(from, 2));
  }

  return squares.map((to) => ({
    to,
    ...findCaptures(position, to),
  }));
};

const bishopMoves = (
  position: Position,
  color: Color,
  from: Square
): Pick<MoveWithExtraData, 'to' | 'capture' | 'kingCapture'>[] =>
  [upLeft, upRight, downLeft, downRight]
    .flatMap((scanFn) => squareScanner(position, from, color, scanFn))
    .map((to) => ({
      to,
      ...findCaptures(position, to),
    }));

const rookMoves = (
  position: Position,
  color: Color,
  from: Square
): Pick<MoveWithExtraData, 'to' | 'capture' | 'kingCapture'>[] =>
  [up, right, left, down]
    .flatMap((scanFn) => squareScanner(position, from, color, scanFn))
    .map((to) => ({
      to,
      ...findCaptures(position, to),
    }));

const queenMoves = (
  position: Position,
  color: Color,
  from: Square
): Pick<MoveWithExtraData, 'to' | 'capture' | 'kingCapture'>[] => [
  ...bishopMoves(position, color, from),
  ...rookMoves(position, color, from),
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

const attackersToSquare = (
  position: Position,
  color: Color,
  square: Square
): Square[] => {
  const attackers: Square[] = [];
  const superPieceMoves = {
    [PieceType.Bishop]: bishopMoves(position, color, square),
    [PieceType.Rook]: rookMoves(position, color, square),
    [PieceType.Knight]: knightMoves(position, color, square),
    [PieceType.Pawn]: pawnMoves(position, color, square, true),
  };

  // The only moves in this array will be legitimate attacks so just check
  // the attacked piece is a pawn.
  superPieceMoves[PieceType.Pawn].forEach((move) => {
    if (position.pieces.get(move.to)?.type === PieceType.Pawn) {
      attackers.push(move.to);
    }
  });

  // Look for knights attacked by a knight move.
  superPieceMoves[PieceType.Knight].forEach((move) => {
    if (
      move.capture &&
      position.pieces.get(move.to)?.type === PieceType.Knight
    ) {
      attackers.push(move.to);
    }
  });

  // Look for bishops OR queens attacked by a bishop move.
  superPieceMoves[PieceType.Bishop].forEach((move) => {
    if (
      move.capture &&
      (position.pieces.get(move.to)?.type === PieceType.Bishop ||
        position.pieces.get(move.to)?.type === PieceType.Queen)
    ) {
      attackers.push(move.to);
    }
  });

  // Look for bishops OR queens attacked by a bishop move.
  superPieceMoves[PieceType.Rook].forEach((move) => {
    if (
      move.capture &&
      (position.pieces.get(move.to)?.type === PieceType.Rook ||
        position.pieces.get(move.to)?.type === PieceType.Queen)
    ) {
      attackers.push(move.to);
    }
  });

  return attackers;
};

const movesForPiece = (position: Position, piece: Piece, square: Square) => {
  const moves: Pick<
    MoveWithExtraData,
    'to' | 'capture' | 'kingCapture' | 'promotion'
  >[] = [];

  switch (piece.type) {
    case PieceType.Bishop:
      moves.push(...bishopMoves(position, piece.color, square));
      break;
    case PieceType.King:
      moves.push(...kingMoves(position, piece.color, square));
      break;
    case PieceType.Knight:
      moves.push(...knightMoves(position, piece.color, square));
      break;
    case PieceType.Pawn:
      moves.push(...pawnMoves(position, piece.color, square));
      break;
    case PieceType.Queen:
      moves.push(...queenMoves(position, piece.color, square));
      break;
    case PieceType.Rook:
      moves.push(...rookMoves(position, piece.color, square));
      break;
  }

  return moves;
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
