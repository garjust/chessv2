import { equal } from '../../lib/deep-equal';
import { FEN_LIBRARY, parseFEN } from '../lib/fen';
import { moveString } from '../move-notation';
import {
  Color,
  Move,
  MoveWithExtraData,
  Piece,
  Pin,
  Position,
  Square,
  SquareControl,
} from '../types';
import { flipColor } from '../utils';
import SquareControlMap from './square-control-map';
import { evaluate } from './evaluation';
import { DEBUG_FLAG } from './global-config';
import { applyMove, MoveResult, undoMove } from './move-execution';
import { generateMoves } from './move-generation';
import { copyToInternal, copyToExternal } from './position';
import { SquareControlByColor, PositionWithComputedData } from './types';
import { CurrentZobrist } from '../lib/zobrist/types';
import { Int32TupleZobrist } from '../lib/zobrist/int32-tuple-zobrist';
import { setFromPosition } from '../lib/zobrist/utils';

import { verifyEnums } from './wasm-chess-verify';
verifyEnums();

export default class Core {
  private internalPosition: PositionWithComputedData;
  private moveStack: MoveResult[] = [];
  private currentZobrist: CurrentZobrist;

  constructor(position: Position = parseFEN(FEN_LIBRARY.BLANK_POSITION_FEN)) {
    this.internalPosition = copyToInternal(position);
    this.currentZobrist = new Int32TupleZobrist();
    setFromPosition(this.currentZobrist, position);
  }

  applyMove(move: Move): Piece | undefined {
    const result = applyMove(this.internalPosition, move, this.currentZobrist);
    this.moveStack.push(result);

    if (DEBUG_FLAG) {
      const moves = [...this.moveStack.map((moveResult) => moveResult.move)];

      verifyAttackMap(this.internalPosition, Color.White, moves, 'makeMove');
      verifyAttackMap(this.internalPosition, Color.Black, moves, 'makeMove');
    }

    return result.captured?.piece;
  }

  undoLastMove() {
    const moveResult = this.moveStack.pop();
    if (moveResult) {
      undoMove(this.internalPosition, moveResult, this.currentZobrist);
    } else {
      throw Error('no last move to undo');
    }

    if (DEBUG_FLAG) {
      const moves = [
        ...this.moveStack.map((moveResult) => moveResult.move),
        moveResult.move,
      ];

      verifyAttackMap(this.internalPosition, Color.White, moves, 'unmakeMove');
      verifyAttackMap(this.internalPosition, Color.Black, moves, 'unmakeMove');
    }
  }

  evaluate(): number {
    return evaluate(this.internalPosition);
  }

  evaluateNormalized(): number {
    return this.internalPosition.turn === Color.White
      ? this.evaluate()
      : -1 * this.evaluate();
  }

  generateMoves(): MoveWithExtraData[] {
    return generateMoves(
      this.internalPosition,
      this.checks(this.internalPosition.turn),
    );
  }

  generateAttackingMoves(): MoveWithExtraData[] {
    return this.generateMoves().filter((move) => move.attack);
  }

  get position(): Position {
    return copyToExternal(this.internalPosition);
  }

  set position(position: Position) {
    this.internalPosition = copyToInternal(position);
    setFromPosition(this.currentZobrist, position);
    this.moveStack = [];
  }

  get zobrist() {
    return this.currentZobrist;
  }

  set zobrist(newZobrist: CurrentZobrist) {
    this.currentZobrist = newZobrist;
  }

  checks(color: Color): SquareControl[] {
    const king = this.internalPosition.kings[color];
    const checks: SquareControl[] = [];
    if (king) {
      for (const [
        ,
        squareControl,
      ] of this.internalPosition.squareControlByColor[
        flipColor(color)
      ].controlOfSquare(king)) {
        checks.push(squareControl);
      }
    }
    return checks;
  }

  get attacks(): SquareControlByColor {
    return this.internalPosition.squareControlByColor;
  }

  get pins(): Pin[] {
    return [
      ...this.internalPosition.absolutePins[Color.White].allPins,
      ...this.internalPosition.absolutePins[Color.Black].allPins,
    ];
  }

  pinBy(color: Color, square: Square) {
    return this.internalPosition.absolutePins[color].pinByPinnedPiece(square);
  }
}

const verifyAttackMap = (
  position: PositionWithComputedData,
  color: Color,
  moves: Move[],
  lastAction: 'makeMove' | 'unmakeMove',
) => {
  const computed = new SquareControlMap(position, color);
  const map = position.squareControlByColor[color];

  // Note: this code is broken because the equal function wants arrays to be
  // in the same order which they are not.
  if (!equal(map._squareControlByPiece, computed._squareControlByPiece)) {
    console.log(
      'square-wise map is out of sync',
      lastAction,
      moves.map((move) => moveString(move)),
    );
  }
  if (
    !equal(
      map._squareControlByAttackedSquare,
      computed._squareControlByAttackedSquare,
    )
  ) {
    console.log(
      'attacked-wise map is out of sync',
      lastAction,
      moves.map((move) => moveString(move)),
    );
  }
};
