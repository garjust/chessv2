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
  SquareControlObject,
} from '../types';
import { flipColor } from '../utils';
import AttackMap from './attack-map';
import CurrentZobrist from './current-zobrist';
import { evaluate } from './evaluation';
import { DEBUG_FLAG } from './global-config';
import { applyMove, MoveResult, undoMove } from './move-execution';
import { generateMoves } from './move-generation';
import { copyToInternal, copyToExternal } from './position';
import { AttackedSquares, PositionWithComputedData, ZobristKey } from './types';

export default class Core {
  private internalPosition: PositionWithComputedData;
  private moveStack: MoveResult[] = [];
  private currentZobrist: CurrentZobrist;

  constructor(position: Position = parseFEN(FEN_LIBRARY.BLANK_POSITION_FEN)) {
    this.internalPosition = copyToInternal(position);
    this.currentZobrist = new CurrentZobrist(position);
  }

  applyMove(move: Move): Piece | undefined {
    const result = applyMove(this.internalPosition, move, this.currentZobrist);
    this.moveStack.push(result);

    if (DEBUG_FLAG) {
      const moves = [...this.moveStack.map((moveResult) => moveResult.move)];

      verifyAttackMap(
        this.internalPosition.attackedSquares[Color.White],
        this.internalPosition,
        Color.White,
        moves,
        'makeMove',
      );
      verifyAttackMap(
        this.internalPosition.attackedSquares[Color.Black],
        this.internalPosition,
        Color.Black,
        moves,
        'makeMove',
      );
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

      verifyAttackMap(
        this.internalPosition.attackedSquares[Color.White],
        this.internalPosition,
        Color.White,
        moves,
        'unmakeMove',
      );
      verifyAttackMap(
        this.internalPosition.attackedSquares[Color.Black],
        this.internalPosition,
        Color.Black,
        moves,
        'unmakeMove',
      );
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
      this.internalPosition.pieces,
      this.internalPosition.turn,
      {
        attackedSquares: this.internalPosition.attackedSquares,
        pins: this.internalPosition.absolutePins[this.internalPosition.turn],
        checks: this.checks(this.internalPosition.turn),
        kings: this.internalPosition.kings,
        enPassantSquare: this.internalPosition.enPassantSquare,
        castlingAvailability: this.internalPosition.castlingAvailability,
      },
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
    this.currentZobrist = new CurrentZobrist(position);
    this.moveStack = [];
  }

  get zobrist(): ZobristKey {
    return this.currentZobrist.key;
  }

  checks(color: Color): SquareControlObject[] {
    const king = this.internalPosition.kings[color];
    const checks: SquareControlObject[] = [];
    if (king) {
      for (const [, squareControl] of this.internalPosition.attackedSquares[
        flipColor(color)
      ].controlOfSquare(king)) {
        checks.push(squareControl);
      }
    }
    return checks;
  }

  get attacks(): AttackedSquares {
    return this.internalPosition.attackedSquares;
  }

  get pins(): Pin[] {
    return [
      ...this.internalPosition.absolutePins[Color.White].allPins,
      ...this.internalPosition.absolutePins[Color.Black].allPins,
    ];
  }
}

const verifyAttackMap = (
  map: AttackMap,
  position: Position,
  color: Color,
  moves: Move[],
  lastAction: 'makeMove' | 'unmakeMove',
) => {
  const computed = new AttackMap(position, color);

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
