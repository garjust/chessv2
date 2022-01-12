import { IAttackMap } from '../engine/types';
import { Pin, Square } from '../types';
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
  attacks: IAttackMap
) => {
  for (const [square, count] of attacks.attackEntries()) {
    if (count > 0) {
      map.set(square, SquareOverlayType.Attacked);
    }
  }
};

export const setOverlayForPins = (
  map: Map<Square, SquareOverlayType>,
  pins: Pin[]
) => {
  // Do each type of square involved in the pin one at a time so that we don't
  // color over squares as much as possible.
  for (const pin of pins) {
    for (const square of pin.legalMoveSquares) {
      map.set(square, SquareOverlayType.Movable);
    }
  }
  for (const pin of pins) {
    map.set(pin.attacker, SquareOverlayType.SelectedPiece);
  }
  for (const pin of pins) {
    map.set(pin.pinned, SquareOverlayType.Capturable);
  }
};
