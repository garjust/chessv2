import equal from 'fast-deep-equal/es6';
import { BLANK_POSITION_FEN, parseFEN } from '../lib/fen';
import {
  Color,
  Move,
  MoveWithExtraData,
  Piece,
  Pin,
  Position as ExternalPosition,
  SquareControlObject,
} from '../types';
import { flipColor } from '../utils';
import AttackMap from './attack-map';
import { findChecksOnKing } from './checks';
import CurrentZobrist from './current-zobrist';
import { evaluate } from './evaluation';
import { DEBUG_FLAG, ENABLE_ATTACK_MAP } from './global-config';
import { applyMove, MoveResult, undoMove } from './move-execution';
import { generateMoves } from './move-generation';
import { copyToInternal, copyToExternal } from './position';
import { AttackedSquares, KingChecks, Position, ZobristKey } from './types';

export default class Engine {
  _position: Position;
  _moveStack: MoveResult[] = [];
  _currentZobrist: CurrentZobrist;

  constructor(position: ExternalPosition = parseFEN(BLANK_POSITION_FEN)) {
    this._position = copyToInternal(position);
    this._currentZobrist = new CurrentZobrist(position);
  }

  applyMove(move: Move): Piece | undefined {
    const result = applyMove(this._position, move, this._currentZobrist);
    this._moveStack.push(result);

    if (DEBUG_FLAG) {
      verifyAttackMap(
        this._position.attackedSquares[Color.White],
        this,
        Color.White
      );
      verifyAttackMap(
        this._position.attackedSquares[Color.Black],
        this,
        Color.Black
      );
    }

    return result.captured?.piece;
  }

  undoLastMove() {
    const moveResult = this._moveStack.pop();
    if (moveResult) {
      undoMove(this._position, moveResult, this._currentZobrist);
    } else {
      throw Error('no last move to undo');
    }

    if (DEBUG_FLAG) {
      verifyAttackMap(
        this._position.attackedSquares[Color.White],
        this,
        Color.White
      );
      verifyAttackMap(
        this._position.attackedSquares[Color.Black],
        this,
        Color.Black
      );
    }
  }

  evaluate(): number {
    return evaluate(this._position);
  }

  evaluateNormalized(): number {
    return this._position.turn === Color.White
      ? this.evaluate()
      : -1 * this.evaluate();
  }

  generateMoves(): MoveWithExtraData[] {
    return generateMoves(this._position.pieces, this._position.turn, {
      attackedSquares: this._position.attackedSquares,
      pinsToKing: this._position.pinsToKing,
      checks: this.checks(this._position.turn),
      kings: this._position.kings,
      enPassantSquare: this._position.enPassantSquare,
      castlingAvailability: this._position.castlingAvailability,
    });
  }

  generateAttackingMoves(): MoveWithExtraData[] {
    return this.generateMoves().filter((move) => move.attack);
  }

  get position(): ExternalPosition {
    return copyToExternal(this._position);
  }

  set position(position: ExternalPosition) {
    this._position = copyToInternal(position);
    this._currentZobrist = new CurrentZobrist(position);
    this._moveStack = [];
  }

  get zobrist(): ZobristKey {
    return this._currentZobrist.key;
  }

  checks(color: Color): SquareControlObject[] {
    if (ENABLE_ATTACK_MAP) {
      const king = this._position.kings[color];
      return king
        ? this._position.attackedSquares[flipColor(color)].controlOfSquare(king)
        : [];
    } else {
      return findChecksOnKing(
        this._position.pieces,
        this._position.kings[color],
        color,
        {
          enPassantSquare: this._position.enPassantSquare,
          castlingAvailability: this._position.castlingAvailability,
        }
      );
    }
  }

  get attacks(): AttackedSquares {
    if (ENABLE_ATTACK_MAP) {
      return this._position.attackedSquares;
    } else {
      return {
        [Color.White]: new AttackMap(this._position, Color.White),
        [Color.Black]: new AttackMap(this._position, Color.Black),
      };
    }
  }

  get pins(): Pin[] {
    return [
      ...Array.from(this._position.pinsToKing[Color.White].values()),
      ...Array.from(this._position.pinsToKing[Color.Black].values()),
    ];
  }
}

const verifyAttackMap = (map: AttackMap, engine: Engine, color: Color) => {
  const computed = new AttackMap(engine._position, color);

  // Note: this code is broken because the equal function wants arrays to be
  // in the same order which they are not.
  if (!equal(map._squareControlByPiece, computed._squareControlByPiece)) {
    console.log('square-wise map is out of sync');
  }
  if (
    !equal(
      map._squareControlByAttackedSquare,
      computed._squareControlByAttackedSquare
    )
  ) {
    console.log('attacked-wise map is out of sync');
  }
};
