import { FEN_PIECE_TO_PIECE_TYPE, PIECE_TYPE_TO_FEN_PIECE } from './lib/fen';
import { Move, PieceType, PromotionOption, SquareLabel } from './types';
import { labelToSquare, squareLabel } from './utils';

const pieceTypeToMoveStringCharacter = (
  type: Exclude<PromotionOption, PieceType.Null>,
): string => PIECE_TYPE_TO_FEN_PIECE[type];

// UCI-variant long algebraic notation
export const moveString = (move: Move, delimiter = ''): string =>
  move.promotion
    ? `${squareLabel(move.from)}${delimiter}${squareLabel(
        move.to,
      )}${pieceTypeToMoveStringCharacter(move.promotion)}`
    : `${squareLabel(move.from)}${delimiter}${squareLabel(move.to)}`;

// UCI-variant long algebraic notation
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
