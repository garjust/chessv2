import {
  Color,
  PieceType,
  CastlingState,
  SquareFile,
  Square,
} from '../../types';
import { CurrentZobrist } from './types';

const numbers = (n: number): number[] => {
  const array: number[] = [];
  for (let i = 0; i < n; i++) {
    array.push(Math.abs(Math.random() * 2 ** 31));
  }
  return array;
};

const N = 1 + 8 + 16 + 64 * 6 * 2; // 793

export const squareOccupancyIndex = (
  color: Color,
  type: PieceType,
  square: Square,
) => 25 + color * 384 + (type - 1) * 64 + square;

export class Int32TupleZobrist implements CurrentZobrist {
  private zobristNumbersX: number[];
  private zobristNumbersY: number[];
  private keyX: number;
  private keyY: number;

  private keyXStack: number[] = [];
  private keyYStack: number[] = [];

  constructor() {
    this.zobristNumbersX = numbers(N);
    this.zobristNumbersY = numbers(N);

    this.keyX = 0;
    this.keyY = 0;
  }

  pushKey() {
    this.keyXStack.push(this.keyX);
    this.keyYStack.push(this.keyY);
  }

  popKey() {
    const keyX = this.keyXStack.pop();
    const keyY = this.keyYStack.pop();

    if (keyX === undefined || keyY === undefined) {
      throw Error('popped zobrist state that did not exist');
    }

    this.keyX = keyX;
    this.keyY = keyY;
  }

  get key(): [number, number] {
    return [this.keyX, this.keyY];
  }

  updateTurn() {
    this.keyX ^= this.zobristNumbersX[0];
    this.keyY ^= this.zobristNumbersY[0];
  }

  updateEnPassantFile(file: SquareFile) {
    const i = 1 + file;
    this.keyX ^= this.zobristNumbersX[i];
    this.keyY ^= this.zobristNumbersY[i];
  }

  updateCastlingState(castlingState: CastlingState) {
    const i = 9 + castlingState;
    this.keyX ^= this.zobristNumbersX[i];
    this.keyY ^= this.zobristNumbersY[i];
  }

  updateSquareOccupancy(color: Color, type: PieceType, square: Square) {
    const i = squareOccupancyIndex(color, type, square);
    this.keyX ^= this.zobristNumbersX[i];
    this.keyY ^= this.zobristNumbersY[i];
  }
}
