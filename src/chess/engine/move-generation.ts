import {
  Color,
  MoveWithExtraData,
  PieceMoves,
  Piece,
  PieceType,
  Position,
  Square,
  AttackObject,
  ComputedMovementData,
} from '../types';
import {
  isLegalSquare,
  squareEquals,
  flipColor,
  squaresInclude,
  isStartPositionPawn,
  isPromotionPositionPawn,
  findKing,
} from '../utils';
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
} from './move-utils';

const pawnMoves = (
  position: Position,
  color: Color,
  from: Square,
  { attacksOnly }: { attacksOnly: boolean }
): MoveWithExtraData[] => {
  let squares: MoveWithExtraData[] = [];
  const opponentColor = flipColor(color);
  const advanceFn = color === Color.White ? up : down;

  // Space forward of the pawn.
  if (
    !position.pieces.get(advanceFn(from)) &&
    isLegalSquare(advanceFn(from)) &&
    !attacksOnly
  ) {
    squares.push({ from, to: advanceFn(from) });

    // Space two squares forward of the pawn when it is in it's starting rank.
    if (
      !position.pieces.get(advanceFn(from, 2)) &&
      isStartPositionPawn(color, from)
    ) {
      squares.push({ from, to: advanceFn(from, 2) });
    }
  }

  // Pawn captures diagonally.
  if (
    position.pieces.get(advanceFn(left(from)))?.color === opponentColor ||
    squareEquals(position.enPassantSquare, advanceFn(left(from)))
  ) {
    const square = advanceFn(left(from));
    squares.push({
      from,
      to: square,
      attack: {
        attacker: { square: from, type: PieceType.Pawn },
        attacked: square,
        slideSquares: [],
      },
    });
  }
  if (
    position.pieces.get(advanceFn(right(from)))?.color === opponentColor ||
    squareEquals(position.enPassantSquare, advanceFn(right(from)))
  ) {
    const square = advanceFn(right(from));
    squares.push({
      from,
      to: square,
      attack: {
        attacker: { square: from, type: PieceType.Pawn },
        attacked: square,
        slideSquares: [],
      },
    });
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

  return squares;
};

const knightMoves = (
  position: Position,
  color: Color,
  from: Square
): MoveWithExtraData[] =>
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
    .map((to) => {
      let attack: AttackObject | undefined;
      if (position.pieces.get(to)) {
        attack = {
          attacker: { square: from, type: PieceType.Knight },
          attacked: to,
          slideSquares: [],
        };
      }

      return {
        from,
        to,
        attack,
      };
    });

const kingMoves = (
  position: Position,
  color: Color,
  from: Square,
  { skipCastling }: { skipCastling: boolean }
): MoveWithExtraData[] => {
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

  return squares.map((to) => {
    let attack: AttackObject | undefined;
    if (position.pieces.get(to)) {
      attack = {
        attacker: { square: from, type: PieceType.King },
        attacked: to,
        slideSquares: [],
      };
    }

    return {
      from,
      to,
      attack,
    };
  });
};

const bishopMoves = (
  position: Position,
  color: Color,
  from: Square
): MoveWithExtraData[] =>
  [upLeft, upRight, downLeft, downRight].flatMap((scanFn) =>
    squareScanner(position, { ...from, color, type: PieceType.Bishop }, scanFn)
  );

const rookMoves = (
  position: Position,
  color: Color,
  from: Square
): MoveWithExtraData[] =>
  [up, right, left, down].flatMap((scanFn) =>
    squareScanner(position, { ...from, color, type: PieceType.Rook }, scanFn)
  );

const queenMoves = (
  position: Position,
  color: Color,
  from: Square
): MoveWithExtraData[] => [
  ...bishopMoves(position, color, from),
  ...rookMoves(position, color, from),
];

const attacksOnSquare = (
  position: Position,
  attackingColor: Color,
  square: Square
): AttackObject[] => {
  const attacks: AttackObject[] = [];
  const color = flipColor(attackingColor);

  // Generate the moves for a super piece of the defending color
  // on the target square.
  const superPieceMoves = [
    kingMoves(position, color, square, {
      skipCastling: true,
    }),
    bishopMoves(position, color, square),
    rookMoves(position, color, square),
    knightMoves(position, color, square),
    pawnMoves(position, color, square, { attacksOnly: true }),
  ].flat();

  // Go through each move looking for attacks. An attack is valid if
  // the attacking and attacked piece are the same type.
  //
  // Note: treat bishops and rooks as queens as well
  superPieceMoves.forEach((move) => {
    if (move.attack) {
      const piece = position.pieces.get(move.to);
      if (
        move.attack.attacker.type === PieceType.Bishop ||
        move.attack.attacker.type === PieceType.Queen
      ) {
        if (
          piece &&
          (piece.type === move.attack.attacker.type ||
            piece.type === PieceType.Queen)
        ) {
          // We need to reverse the super piece move to find the real attack.
          attacks.push({
            attacked: move.attack.attacker.square,
            attacker: { square: move.attack.attacked, type: piece.type },
            slideSquares: move.attack.slideSquares,
          });
        }
      } else {
        if (piece && piece.type === move.attack.attacker.type) {
          // We need to reverse the super piece move to find the real attack.
          attacks.push({
            attacked: move.attack.attacker.square,
            attacker: { square: move.attack.attacked, type: piece.type },
            slideSquares: move.attack.slideSquares,
          });
        }
      }
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
  const moves: MoveWithExtraData[] = [];

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
      moves: moves.map((move) => ({ ...move, from: square })),
    });
  }

  return pieceMoves;
};

const findAttacksOnKing = (
  position: Position,
  attackingColor: Color
): AttackObject[] => {
  const king = findKing(position, flipColor(attackingColor));
  if (!king) {
    return [];
  }

  return attacksOnSquare(position, attackingColor, king);
};

export const generateMovementData = (
  position: Position
): ComputedMovementData => {
  const checks = findAttacksOnKing(position, flipColor(position.turn));

  const allMoves: MoveWithExtraData[] = [];
  const availableCaptures: MoveWithExtraData[] = [];

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
      if (move.attack) {
        const piece = position.pieces.get(move.from);
        if (piece) {
          availableCaptures.push(move);
        }
      }
    });

    allMoves.push(...moves);
  });

  return {
    moves: allMoves,
    checks,
    availableCaptures,
  };
};