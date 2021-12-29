import {
  AttackObject,
  Move,
  MoveWithExtraData,
  Piece,
  Position,
  Square,
} from '../types';
import { isLegalSquare, squareEquals } from '../utils';

// type MoveSquareFunction = (square: Square, n: number) => Square;

// const identitySquare = (square: Square, _n = 1): Square => square;

export const up = (square: Square, n = 1): Square => square + 8 * n;
export const down = (square: Square, n = 1): Square => square - 8 * n;
export const left = (square: Square, n = 1): Square => square - 1 * n;
export const right = (square: Square, n = 1): Square => square + 1 * n;
export const upLeft = (square: Square, n = 1): Square => square + 7 * n;
export const upRight = (square: Square, n = 1): Square => square + 9 * n;
export const downLeft = (square: Square, n = 1): Square => square - 9 * n;
export const downRight = (square: Square, n = 1): Square => square - 7 * n;

// const rayGenerator = function* (
//   square: Square,
//   scanFn: (square: Square) => Square
// ) {
//   while (isLegalSquare(square)) {
//     yield square;
//     square = scanFn(square);
//   }
// };

export const rayScanner = (
  position: Position,
  scanningPiece: { square: Square; piece: Piece },
  ray: Square[]
): MoveWithExtraData[] => {
  const moves: MoveWithExtraData[] = [];
  const from = scanningPiece.square;

  for (const to of ray) {
    const piece = position.pieces.get(to);
    if (piece) {
      if (piece.color === scanningPiece.piece.color) {
        // friend!
        break;
      } else {
        // foe!
        const attack: AttackObject = {
          attacked: to,
          attacker: {
            square: from,
            type: scanningPiece.piece.type,
          },
          slideSquares: moves.map(({ to }) => to),
          indirectAttacks: [],
        };

        // TODO: find indirectAttacks (forms of pins)
        // [R 2 3 q 5 6 p k]
        // for right()...
        // R square
        // q square is attacked through [2,3]
        // p square is indirectly attacked through [5,6]
        // k square is indirectly attacked through []

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

// export const squareScanner = (
//   position: Position,
//   scanningPiece: { square: Square; piece: Piece },
//   scanFn: (square: Square) => Square
// ): MoveWithExtraData[] => {
//   const moves: MoveWithExtraData[] = [];
//   const from = scanningPiece.square;

//   for (const to of rayGenerator(scanFn(from), scanFn)) {
//     const piece = position.pieces.get(to);
//     if (piece) {
//       if (piece.color === scanningPiece.piece.color) {
//         // friend!
//         break;
//       } else {
//         // foe!
//         const attack: AttackObject = {
//           attacked: to,
//           attacker: {
//             square: from,
//             type: scanningPiece.piece.type,
//           },
//           slideSquares: moves.map(({ to }) => to),
//           indirectAttacks: [],
//         };

//         // TODO: find indirectAttacks (forms of pins)
//         // [R 2 3 q 5 6 p k]
//         // for right()...
//         // R square
//         // q square is attacked through [2,3]
//         // p square is indirectly attacked through [5,6]
//         // k square is indirectly attacked through []

//         moves.push({ from, to, attack });
//         break;
//       }
//     } else {
//       // empty square!
//       moves.push({ from, to });
//     }
//   }

//   return moves;
// };

// Assumes a move for a bishop, rook, or queen.
// const unitMoveSquareFunction = ({ from, to }: Move): MoveSquareFunction => {
//   let rankFn: MoveSquareFunction = identitySquare;
//   let fileFn: MoveSquareFunction = identitySquare;

//   if (from.file - to.file < 0) {
//     fileFn = right;
//   } else if (from.file - to.file > 0) {
//     fileFn = left;
//   }

//   if (from.rank - to.rank < 0) {
//     rankFn = up;
//   } else if (from.rank - to.rank > 0) {
//     rankFn = down;
//   }

//   return (square: Square, n = 1) => rankFn(fileFn(square, n), n);
// };

// Assumes a sliding move
// export const squaresBetweenMove = (move: Move): Square[] => {
//   const squares: Square[] = [];

//   const scanFn = unitMoveSquareFunction(move);
//   let scannedSquare = scanFn(move.from, 1);

//   while (!squareEquals(scannedSquare, move.to)) {
//     squares.push(scannedSquare);
//     scannedSquare = scanFn(scannedSquare, 1);

//     if (!isLegalSquare(scannedSquare)) {
//       throw Error('failed to find squares between move, went out of bounds');
//     }
//   }

//   return squares;
// };
