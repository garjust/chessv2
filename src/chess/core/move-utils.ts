import {
  AttackObject,
  Move,
  MoveWithExtraData,
  Piece,
  Square,
  SquareControlObject,
} from '../types';
import {
  PROMOTION_OPTION_PIECE_TYPES,
  directionOfMove,
  isSliderPieceType,
} from '../utils';

export const up = (square: Square, n = 1): Square => square + 8 * n;
export const down = (square: Square, n = 1): Square => square - 8 * n;
export const left = (square: Square, n = 1): Square => square - 1 * n;
export const right = (square: Square, n = 1): Square => square + 1 * n;
export const upLeft = (square: Square, n = 1): Square => square + 7 * n;
export const upRight = (square: Square, n = 1): Square => square + 9 * n;
export const downLeft = (square: Square, n = 1): Square => square - 9 * n;
export const downRight = (square: Square, n = 1): Square => square - 7 * n;

export const isMoveUp = (move: Move): boolean =>
  move.from < move.to && isMoveInFile(move);

export const isMoveDown = (move: Move): boolean =>
  move.from > move.to && isMoveInFile(move);

export const isMoveInFile = (move: Move): boolean =>
  (move.from - move.to) % 8 === 0;

export const squareControlXraysMove = (
  squareControl: SquareControlObject,
  move: Move,
): boolean =>
  isSliderPieceType(squareControl.attacker.type) &&
  directionOfMove(squareControl.attacker.square, squareControl.to) ===
    directionOfMove(move.from, move.to);

export const rayControlScanner = (
  pieces: Map<Square, Piece>,
  scanningPiece: { square: Square; piece: Piece },
  ray: Square[],
  skipPast?: Square,
  stopAt?: Square,
): SquareControlObject[] => {
  const moves: SquareControlObject[] = [];
  const slideSquares: Square[] = [];
  const from = scanningPiece.square;
  let skip = skipPast !== undefined ? true : false;

  for (const to of ray) {
    if (skip) {
      slideSquares.push(to);

      if (to === skipPast) {
        skip = false;
      } else {
        const piece = pieces.get(to);
        if (piece) {
          // Stop scanning if we hit a piece of either colour
          break;
        }
      }

      continue;
    }

    moves.push({
      attacker: { square: from, type: scanningPiece.piece.type },
      to: to,
      slideSquares: [...slideSquares],
    });
    slideSquares.push(to);

    if (to === stopAt) {
      break;
    }

    const piece = pieces.get(to);
    if (piece) {
      // Stop scanning if we hit a piece of either colour
      break;
    }
  }

  return moves;
};

export const expandPromotions = (move: MoveWithExtraData) =>
  PROMOTION_OPTION_PIECE_TYPES.map((pieceType) => ({
    ...move,
    promotion: pieceType,
  }));
