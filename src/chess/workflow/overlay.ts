import { HEATMAPS } from '../lib/heatmaps';
import { Color, PieceType, Square } from '../types';
import {
  State,
  checkedSquare,
  SquareOverlayType,
  pieceInSquare,
} from './state';

export const setOverlayForPlay = (
  map: Map<Square, SquareOverlayType>,
  state: State
): void => {
  const { position, selectedSquare, lastMove, moves } = state;

  if (lastMove) {
    map.set(lastMove.from, SquareOverlayType.LastMove);
    map.set(lastMove.to, SquareOverlayType.LastMove);
  }

  const check = checkedSquare(state);
  if (check) {
    map.set(check, SquareOverlayType.Check);
  }

  if (selectedSquare !== undefined) {
    map.set(selectedSquare, SquareOverlayType.SelectedPiece);

    const piece = pieceInSquare(state, selectedSquare);
    if (piece) {
      const candidateSquares = moves.filter(
        (move) => move.from === selectedSquare
      );

      candidateSquares.forEach(({ to: square }) => {
        if (position.pieces.has(square)) {
          map.set(square, SquareOverlayType.Capturable);
        } else {
          map.set(square, SquareOverlayType.Movable);
        }
      });
    }
  }
};

export const setOverlayForAttacks = (
  map: Map<Square, SquareOverlayType>,
  attacks: Map<Square, number>
) => {
  for (const [square, count] of attacks) {
    if (count > 0) {
      map.set(square, SquareOverlayType.Attacked);
    }
  }
};
