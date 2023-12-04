/**
 * Interface for a wrapped zobrist number representing a position. The wrapper
 * provides methods for updating the zobrist number for changes in a position.
 * The wrapper can also manage a stack of previous zobrist numbers for move-undo
 * operations.
 *
 * The generic `T` type gives the representation of the zobrist number internally.
 */
export interface CurrentZobrist<T = number | bigint | [number, number]> {
  key: T;
  updateSquareOccupancy: (
    color: number,
    pieceType: number,
    square: number,
  ) => void;
  updateCastlingState: (castlingState: number) => void;
  updateEnPassantFile: (file: number) => void;
  updateTurn: () => void;
  pushKey: () => void;
  popKey: () => void;
}
