import AttackMap from '../../core/attack-map';
import { Pin, Square } from '../../types';
import {
  State,
  checkedSquare,
  SquareOverlayType,
  pieceInSquare,
} from './state';

export const setOverlayForPlay = (
  map: Record<Square, SquareOverlayType>,
  state: State,
): void => {
  const { position, selectedSquare, lastMove, moves } = state;

  if (lastMove) {
    map[lastMove.from] = SquareOverlayType.LastMove;
    map[lastMove.to] = SquareOverlayType.LastMove;
  }

  const check = checkedSquare(state);
  if (check) {
    map[check] = SquareOverlayType.Check;
  }

  if (selectedSquare !== undefined) {
    map[selectedSquare] = SquareOverlayType.SelectedPiece;

    const piece = pieceInSquare(state, selectedSquare);
    if (piece) {
      const candidateSquares = moves.filter(
        (move) => move.from === selectedSquare,
      );

      candidateSquares.forEach(({ to: square }) => {
        if (position.pieces.has(square)) {
          map[square] = SquareOverlayType.Capturable;
        } else {
          map[square] = SquareOverlayType.Movable;
        }
      });
    }
  }
};

export const setOverlayForAttacks = (
  map: Record<Square, SquareOverlayType>,
  attacks: AttackMap,
) => {
  for (const [square, count] of attacks.attackCounts()) {
    if (count > 0) {
      map[square] = SquareOverlayType.Attacked;
    }
  }
};

export const setOverlayForPins = (
  map: Record<Square, SquareOverlayType>,
  pins: Pin[],
) => {
  // Do each type of square involved in the pin one at a time so that we don't
  // color over squares as much as possible.
  for (const pin of pins) {
    for (const square of pin.legalMoveSquares) {
      map[square] = SquareOverlayType.Movable;
    }
  }
  for (const pin of pins) {
    map[pin.attacker] = SquareOverlayType.SelectedPiece;
  }
  for (const pin of pins) {
    map[pin.pinned] = SquareOverlayType.Capturable;
  }
};
