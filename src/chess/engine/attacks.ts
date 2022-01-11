import {
  Color,
  Piece,
  PieceType,
  Square,
  AttackObject,
  Move,
  SquareControlObject,
} from '../types';
import { flipColor, CASTLING_AVAILABILITY_BLOCKED } from '../utils';
import {
  BISHOP_RAY_BITARRAYS,
  QUEEN_RAY_BITARRAYS,
  ROOK_RAY_BITARRAYS,
} from './move-lookup';
import {
  bishopMoves,
  kingMoves,
  knightMoves,
  pawnMoves,
  rookMoves,
} from './piece-movement';
import { forPiece } from './piece-movement-control';
import { AttackedSquares, PieceAttacks } from './types';

export const attacksOnSquare = (
  pieces: Map<Square, Piece>,
  attackingColor: Color,
  square: Square,
  {
    enPassantSquare,
    skip,
  }: {
    enPassantSquare: Square | null;
    skip: Square[];
  }
): AttackObject[] => {
  const attacks: AttackObject[] = [];
  const color = flipColor(attackingColor);

  // Generate the moves for a super piece of the defending color
  // on the target square.
  const superPieceMoves = [
    kingMoves(pieces, color, square, {
      castlingOnly: false,
      castlingAvailability: CASTLING_AVAILABILITY_BLOCKED,
      pieceAttacks: {
        [Color.White]: new Map<Square, SquareControlObject[]>(),
        [Color.Black]: new Map<Square, SquareControlObject[]>(),
      },
    }),
    bishopMoves(pieces, color, square, { skip }),
    rookMoves(pieces, color, square, { skip }),
    knightMoves(pieces, color, square),
    pawnMoves(pieces, color, square, {
      advanceOnly: false,
      attacksOnly: true,
      enPassantSquare: enPassantSquare,
    }),
  ];

  // Go through each move looking for attacks. An attack is valid if
  // the attacking and attacked piece are the same type.
  //
  // Note: treat bishops and rooks as queens as well
  for (const movesByPieceType of superPieceMoves) {
    for (const move of movesByPieceType) {
      if (move.attack) {
        const piece = pieces.get(move.to);
        if (
          move.attack.attacker.type === PieceType.Bishop ||
          move.attack.attacker.type === PieceType.Rook
        ) {
          if (
            piece &&
            (piece.type === move.attack.attacker.type ||
              piece.type === PieceType.Queen)
          ) {
            // We need to reverse the super piece move to find the real attack.
            attacks.push({
              attacked: move.attack.attacker,
              attacker: move.attack.attacked,
              slideSquares: move.attack.slideSquares,
            });
          }
        } else {
          if (piece && piece.type === move.attack.attacker.type) {
            // We need to reverse the super piece move to find the real attack.
            attacks.push({
              attacked: move.attack.attacker,
              attacker: move.attack.attacked,
              slideSquares: move.attack.slideSquares,
            });
          }
        }
      }
    }
  }

  return attacks;
};

export const allPieceAttacks = (
  pieces: Map<Square, Piece>,
  attackingColor: Color
): Map<Square, SquareControlObject[]> => {
  const pieceAttacks = new Map<Square, SquareControlObject[]>();

  for (let square = 0; square < 64; square++) {
    pieceAttacks.set(square, []);
  }

  for (let square = 0; square < 64; square++) {
    const attacks = attacksOnSquare(pieces, attackingColor, square, {
      enPassantSquare: null,
      skip: [],
    });

    for (const attack of attacks) {
      const attackersObjects = pieceAttacks.get(attack.attacker.square);
      if (!attackersObjects) {
        throw Error('cant be possible');
      }

      attackersObjects.push({
        square,
        attacker: attack.attacker,
        slideSquares: attack.slideSquares,
      });
    }
  }

  return pieceAttacks;
};

export const allAttackedSquares = (
  pieces: Map<Square, Piece>,
  attackingColor: Color
): Map<Square, number> => {
  const attackedSquares = new Map<Square, number>();

  for (let square = 0; square < 64; square++) {
    attackedSquares.set(square, 0);

    const attacks = attacksOnSquare(pieces, attackingColor, square, {
      enPassantSquare: null,
      skip: [],
    });

    attackedSquares.set(square, attacks.length);
  }

  return attackedSquares;
};

const addAttacks = (
  attackedSquares: AttackedSquares,
  pieceAttacks: PieceAttacks,
  color: Color,
  square: Square,
  squares: SquareControlObject[]
) => {
  for (const squareControl of squares) {
    attackedSquares[color].set(
      squareControl.square,
      (attackedSquares[color].get(squareControl.square) ?? 0) + 1
    );
  }
  pieceAttacks[color].set(square, squares);
};

export type SquareControlChangeset = {
  square: Square;
  squares: SquareControlObject[];
  color: Color;
};

const removeAttacks = (
  attackedSquares: AttackedSquares,
  pieceAttacks: PieceAttacks,
  color: Color,
  square: Square
): SquareControlChangeset => {
  const squares = pieceAttacks[color].get(square) ?? [];
  const changeset = {
    color,
    square,
    squares,
  };

  for (const squareControl of squares) {
    attackedSquares[color].set(
      squareControl.square,
      (attackedSquares[color].get(squareControl.square) ?? 0) - 1
    );
  }
  pieceAttacks[color].set(square, []);

  return changeset;
};

export const updateAttackedSquares = (
  attackedSquares: AttackedSquares,
  pieceAttacks: PieceAttacks,
  pieces: Map<Square, Piece>,
  move: Move,
  movedPiece: Piece
): SquareControlChangeset[] => {
  const changes: SquareControlChangeset[] = [];
  const opponentColor = flipColor(movedPiece.color);

  changes.push(
    removeAttacks(attackedSquares, pieceAttacks, movedPiece.color, move.from)
  );
  changes.push({
    color: movedPiece.color,
    square: move.to,
    squares: [],
  });
  changes.push(
    removeAttacks(attackedSquares, pieceAttacks, opponentColor, move.to)
  );

  // Find the squares that are now attacked by the moved piece.
  const newAttacks: SquareControlObject[] = forPiece(
    movedPiece,
    pieces,
    move.to
  );
  addAttacks(
    attackedSquares,
    pieceAttacks,
    movedPiece.color,
    move.to,
    newAttacks
  );

  // Find sliding pieces affected by the moved piece.
  for (const [square, piece] of pieces) {
    if (square === move.from || square === move.to) {
      // We have already covered pieces in the move from/to squares.
      continue;
    }

    let isFromIncident = false;
    let isToIncident = false;

    switch (piece.type) {
      case PieceType.Bishop:
        isFromIncident = BISHOP_RAY_BITARRAYS[square][move.from];
        isToIncident = BISHOP_RAY_BITARRAYS[square][move.to];
        break;
      case PieceType.Rook:
        isFromIncident = ROOK_RAY_BITARRAYS[square][move.from];
        isToIncident = ROOK_RAY_BITARRAYS[square][move.to];
        break;
      case PieceType.Queen:
        isFromIncident = QUEEN_RAY_BITARRAYS[square][move.from];
        isToIncident = QUEEN_RAY_BITARRAYS[square][move.to];
        break;
      default:
        break;
    }

    if (isFromIncident || isToIncident) {
      changes.push(
        removeAttacks(attackedSquares, pieceAttacks, piece.color, square)
      );
      const newAttacks: SquareControlObject[] = forPiece(piece, pieces, square);

      addAttacks(
        attackedSquares,
        pieceAttacks,
        piece.color,
        square,
        newAttacks
      );
    }
  }

  return changes;
};

export const updateAttackedSquaresFromChangeset = (
  squareControlChanges: SquareControlChangeset[],
  attackedSquares: AttackedSquares,
  pieceAttacks: PieceAttacks
) => {
  for (const change of squareControlChanges) {
    removeAttacks(attackedSquares, pieceAttacks, change.color, change.square);
    addAttacks(
      attackedSquares,
      pieceAttacks,
      change.color,
      change.square,
      change.squares
    );
  }
};
