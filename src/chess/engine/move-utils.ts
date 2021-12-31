import { AttackObject, MoveWithExtraData, Piece, Square } from '../types';

export const up = (square: Square, n = 1): Square => square + 8 * n;
export const down = (square: Square, n = 1): Square => square - 8 * n;
export const left = (square: Square, n = 1): Square => square - 1 * n;
export const right = (square: Square, n = 1): Square => square + 1 * n;
export const upLeft = (square: Square, n = 1): Square => square + 7 * n;
export const upRight = (square: Square, n = 1): Square => square + 9 * n;
export const downLeft = (square: Square, n = 1): Square => square - 9 * n;
export const downRight = (square: Square, n = 1): Square => square - 7 * n;

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
      moves.push({ from, to });
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
          attacked: to,
          attacker: {
            square: from,
            type: scanningPiece.piece.type,
          },
          slideSquares: moves.map(({ to }) => to),
        };

        moves.push({ from, to, attack });
        break;
      }
    } else {
      // empty square!
      moves.push({ from, to });
    }
  }

  return moves;
};
