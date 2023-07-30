import { Move, PromotionOption, SquareLabel } from './types';
import {
  FEN_PIECE_TO_PIECE_TYPE,
  labelToSquare,
  pieceTypeToMoveStringCharacter,
  squareLabel,
} from './utils';

export const moveString = (move: Move, delimiter = ''): string =>
  move.promotion
    ? `${squareLabel(move.from)}${delimiter}${squareLabel(
        move.to
      )}${pieceTypeToMoveStringCharacter(move.promotion)}`
    : `${squareLabel(move.from)}${delimiter}${squareLabel(move.to)}`;

export const moveFromString = (moveString: string): Move => {
  const from = moveString.slice(0, 2) as SquareLabel;
  const to = moveString.slice(2, 4) as SquareLabel;
  const promotion = moveString.slice(4, 5) as 'n' | 'b' | 'q' | 'r';

  const move: Move = {
    from: labelToSquare(from),
    to: labelToSquare(to),
  };

  if (promotion.length > 0) {
    move.promotion = FEN_PIECE_TO_PIECE_TYPE[promotion] as PromotionOption;
  }

  return move;
};
