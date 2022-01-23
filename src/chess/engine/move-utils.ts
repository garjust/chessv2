import {
  AttackObject,
  Move,
  MoveWithExtraData,
  Piece,
  Square,
  SquareControlObject,
} from '../types';

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

export const rayScanner = (
  pieces: Map<Square, Piece>,
  scanningPiece: { square: Square; piece: Piece },
  ray: Square[],
  { skip = [] }: { skip: Square[] }
): MoveWithExtraData[] => {
  const moves: MoveWithExtraData[] = [];
  const from = scanningPiece.square;

  let attack: AttackObject | undefined;

  for (const to of ray) {
    if (skip.includes(to)) {
      moves.push({ from, to, piece: scanningPiece.piece });
      continue;
    }

    const piece = pieces.get(to);

    if (piece) {
      if (piece.color === scanningPiece.piece.color) {
        // friend!
        break;
      } else {
        // foe!
        attack = {
          attacked: { square: to, type: piece.type },
          attacker: {
            square: from,
            type: scanningPiece.piece.type,
          },
          slideSquares: moves.map(({ to }) => to),
        };

        moves.push({ from, to, piece: scanningPiece.piece, attack });
        break;
      }
    } else {
      // empty square!
      moves.push({ from, to, piece: scanningPiece.piece });
    }
  }

  return moves;
};

export const rayControlScanner = (
  pieces: Map<Square, Piece>,
  scanningPiece: { square: Square; piece: Piece },
  ray: Square[],
  skipPast?: Square,
  stopAt?: Square
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
      square: to,
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
