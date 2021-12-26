import { SquareMap } from '../../square-map';
import {
  Color,
  ComputedPositionData,
  Move,
  MoveWithExtraData,
  PieceMoves,
  Piece,
  PieceType,
  Position,
  Square,
  AttackObject,
} from '../../types';
import {
  isLegalSquare,
  squareEquals,
  flipColor,
  squaresInclude,
  isStartPositionPawn,
  isPromotionPositionPawn,
} from '../../utils';
import { applyMove } from './move-execution';
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
  squaresBetweenMove,
} from './move-utils';

const pawnMoves = (
  position: Position,
  color: Color,
  from: Square,
  { attacksOnly }: { attacksOnly: boolean }
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
  from: Square,
  { skipCastling }: { skipCastling: boolean }
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
    !skipCastling &&
    position.castlingAvailability[color].kingside &&
    !position.pieces.get(right(from)) &&
    // Also check nothing is attacking the square being castled through
    attacksOnSquare(position, flipColor(color), right(from)).length === 0 &&
    !position.pieces.get(right(from, 2))
  ) {
    squares.push(right(from, 2));
  }
  if (
    !skipCastling &&
    position.castlingAvailability[color].queenside &&
    !position.pieces.get(left(from)) &&
    // Also check nothing is attacking the square being castled through
    attacksOnSquare(position, flipColor(color), left(from)).length === 0 &&
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
  const nextMoves = movesForPiece(position, piece, move.to, {
    skipCastling: false,
  });

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

const attacksOnSquare = (
  position: Position,
  attackingColor: Color,
  square: Square
): AttackObject[] => {
  const attacks: AttackObject[] = [];
  const color = flipColor(attackingColor);

  const superPieceMoves = {
    [PieceType.King]: kingMoves(position, color, square, {
      skipCastling: true,
    }),
    [PieceType.Bishop]: bishopMoves(position, color, square),
    [PieceType.Rook]: rookMoves(position, color, square),
    [PieceType.Knight]: knightMoves(position, color, square),
    [PieceType.Pawn]: pawnMoves(position, color, square, { attacksOnly: true }),
  };

  // The only moves in this array will be legitimate attacks so just check
  // the attacked piece is a pawn.
  superPieceMoves[PieceType.Pawn].forEach((move) => {
    if (position.pieces.get(move.to)?.type === PieceType.Pawn) {
      attacks.push({
        attacked: square,
        attacker: { square: move.to, type: PieceType.Pawn },
        slideSquares: [],
      });
    }
  });

  // Look for knights attacked by a knight move.
  superPieceMoves[PieceType.Knight].forEach((move) => {
    if (
      move.capture &&
      position.pieces.get(move.to)?.type === PieceType.Knight
    ) {
      attacks.push({
        attacked: square,
        attacker: { square: move.to, type: PieceType.Knight },
        slideSquares: [],
      });
    }
  });

  // Look for kings attacked by a king move.
  superPieceMoves[PieceType.King].forEach((move) => {
    if (move.capture && position.pieces.get(move.to)?.type === PieceType.King) {
      attacks.push({
        attacked: square,
        attacker: { square: move.to, type: PieceType.King },
        slideSquares: [],
      });
    }
  });

  // Look for bishops OR queens attacked by a bishop move.
  superPieceMoves[PieceType.Bishop].forEach((move) => {
    const piece = position.pieces.get(move.to);

    if (
      move.capture &&
      (piece?.type === PieceType.Bishop || piece?.type === PieceType.Queen)
    ) {
      attacks.push({
        attacked: square,
        attacker: { square: move.to, type: piece.type },
        slideSquares: squaresBetweenMove({ from: square, to: move.to }),
      });
    }
  });

  // Look for bishops OR queens attacked by a bishop move.
  superPieceMoves[PieceType.Rook].forEach((move) => {
    const piece = position.pieces.get(move.to);

    if (
      move.capture &&
      (piece?.type === PieceType.Rook || piece?.type === PieceType.Queen)
    ) {
      attacks.push({
        attacked: square,
        attacker: { square: move.to, type: piece.type },
        slideSquares: squaresBetweenMove({ from: square, to: move.to }),
      });
    }
  });

  return attacks;
};

const movesForPiece = (
  position: Position,
  piece: Piece,
  square: Square,
  { skipCastling }: { skipCastling: boolean }
) => {
  const moves: Pick<
    MoveWithExtraData,
    'to' | 'capture' | 'kingCapture' | 'promotion'
  >[] = [];

  switch (piece.type) {
    case PieceType.Bishop:
      moves.push(...bishopMoves(position, piece.color, square));
      break;
    case PieceType.King:
      moves.push(...kingMoves(position, piece.color, square, { skipCastling }));
      break;
    case PieceType.Knight:
      moves.push(...knightMoves(position, piece.color, square));
      break;
    case PieceType.Pawn:
      moves.push(
        ...pawnMoves(position, piece.color, square, { attacksOnly: false })
      );
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

const movesForPosition = (
  position: Position,
  options: { color?: Color; skipCastling?: boolean }
): PieceMoves[] => {
  const pieceMoves: PieceMoves[] = [];

  const color = options.color;
  const skipCastling = options.skipCastling ?? false;

  for (const [square, piece] of position.pieces.entries()) {
    if (color && piece.color !== color) {
      continue;
    }
    const moves = movesForPiece(position, piece, square, { skipCastling });
    pieceMoves.push({
      from: square,
      piece,
      moves: augmentMovesWithAttacks(
        position,
        piece,
        moves.map((move) => ({ ...move, from: square }))
      ),
    });
  }

  return pieceMoves;
};

const findAttacksOnKing = (
  position: Position,
  attackingColor: Color
): AttackObject[] => {
  let king: Square | undefined;
  for (const [square, piece] of position.pieces) {
    // Find the king we want to compute attacks for.
    if (piece.type === PieceType.King && piece.color !== attackingColor) {
      king = square;
      break;
    }
  }
  if (!king) {
    return [];
  }

  return attacksOnSquare(position, attackingColor, king);
};

export const computeMovementData = (
  position: Position
): Pick<
  ComputedPositionData,
  | 'moves'
  | 'checks'
  | 'availableCaptures'
  | 'availableAttacks'
  | 'availableChecks'
> => {
  const checks = findAttacksOnKing(position, flipColor(position.turn));

  const allMoves: MoveWithExtraData[] = [];
  const availableCaptures: Move[] = [];
  const availableAttacks: Move[] = [];
  const availableChecks: Move[] = [];

  const movesets = movesForPosition(position, {
    color: position.turn,
    skipCastling: checks.length > 0,
  });

  movesets.forEach(({ piece, from, moves }) => {
    // We need to prune moves when in check since only moves that remove the
    // check are legal.
    if (checks.length > 0) {
      if (checks.length === 1) {
        const check = checks[0];
        // In the case that the king is checked by a single piece we can capture
        // the piece or block the attack.
        if (piece.type !== PieceType.King) {
          moves = moves.filter(
            (move) =>
              squaresInclude(check.slideSquares, move.to) ||
              squareEquals(check.attacker.square, move.to)
          );
        } else {
          // The king can only move out of the check or capture the checking
          // piece. The king cannot block the check.
          moves = moves.filter((move) => {
            return !squaresInclude(check.slideSquares, move.to);
          });
        }
      } else {
        // In the case that the king is checked by multiple pieces (can only be 2)
        // the king must move.

        // Prune all moves if the piece is not the king.
        if (piece.type !== PieceType.King) {
          moves = [];
        }
        // Prune king moves that move to an attacked square.
        moves = moves.filter(
          (move) =>
            !squaresInclude(
              checks.flatMap((check) => check.slideSquares),
              move.to
            )
        );
      }
    }

    // We need to prune moves that result in a check on ourselves.
    //
    // This strategy computes an entirely new position after the candidate move
    // and then looks for attacks on the players king.
    moves = moves.filter((move) => {
      const result = applyMove(position, { from, to: move.to });
      return (
        findAttacksOnKing(result.position, result.position.turn).length === 0
      );
    });

    moves.forEach((move) => {
      if (move.capture) {
        availableCaptures.push({ from, to: move.to });
      }
      if (move.attack) {
        availableAttacks.push({ from, to: move.to });
      }
      if (move.kingAttack) {
        availableChecks.push({ from, to: move.to });
      }
    });

    allMoves.push(...moves);
  });

  return {
    moves: allMoves,
    checks,
    availableCaptures,
    availableAttacks,
    availableChecks,
  };
};