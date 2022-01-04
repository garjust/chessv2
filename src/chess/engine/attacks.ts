import { SquareMap } from '../square-map';
import {
  Color,
  Piece,
  PieceType,
  Square,
  AttackObject,
  Move,
  SquareControlObject,
} from '../types';
import { flipColor, CASTLING_AVAILABILITY_BLOCKED, isSlider } from '../utils';
import { BISHOP_LOOKUP, QUEEN_LOOKUP, ROOK_LOOKUP } from './move-lookup';
import {
  bishopMoves,
  kingMoves,
  knightMoves,
  pawnMoves,
  queenMoves,
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
      enPassantSquare,
      castlingAvailability: CASTLING_AVAILABILITY_BLOCKED,
    }),
    bishopMoves(pieces, color, square, { skip }),
    rookMoves(pieces, color, square, { skip }),
    knightMoves(pieces, color, square),
    pawnMoves(pieces, color, square, {
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
  const pieceAttacks: Map<Square, SquareControlObject[]> = new SquareMap<
    SquareControlObject[]
  >();

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
  const attackedSquares: Map<Square, number> = new SquareMap<number>();

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

const removeAttacks = (
  attackedSquares: AttackedSquares,
  pieceAttacks: PieceAttacks,
  color: Color,
  square: Square
) => {
  const squares = pieceAttacks[color].get(square) ?? [];

  for (const squareControl of squares) {
    attackedSquares[color].set(
      squareControl.square,
      (attackedSquares[color].get(squareControl.square) ?? 0) - 1
    );
  }
  pieceAttacks[color].set(square, []);
};

export const updateAttackedSquares = (
  attackedSquares: AttackedSquares,
  pieceAttacks: PieceAttacks,
  pieces: Map<Square, Piece>,
  move: Move,
  movedPiece: Piece
) => {
  const opponentColor = flipColor(movedPiece.color);

  removeAttacks(attackedSquares, pieceAttacks, movedPiece.color, move.from);
  removeAttacks(attackedSquares, pieceAttacks, opponentColor, move.to);

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
    let isIncident = false;

    if (isSlider(piece.type)) {
      switch (piece.type) {
        case PieceType.Bishop:
          isIncident =
            BISHOP_LOOKUP[square].flat().includes(move.to) ||
            BISHOP_LOOKUP[square].flat().includes(move.from);
          break;
        case PieceType.Rook:
          isIncident =
            ROOK_LOOKUP[square].flat().includes(move.to) ||
            ROOK_LOOKUP[square].flat().includes(move.from);
          break;
        case PieceType.Queen:
          isIncident =
            QUEEN_LOOKUP[square].flat().includes(move.to) ||
            QUEEN_LOOKUP[square].flat().includes(move.from);

          break;
      }

      if (isIncident) {
        removeAttacks(attackedSquares, pieceAttacks, piece.color, square);

        const newAttacks: SquareControlObject[] = forPiece(
          piece,
          pieces,
          square
        );

        addAttacks(
          attackedSquares,
          pieceAttacks,
          piece.color,
          square,
          newAttacks
        );
      }
    }
  }
};
