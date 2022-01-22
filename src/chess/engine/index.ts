import { BLANK_POSITION_FEN, parseFEN } from '../lib/fen';
import {
  Color,
  Move,
  MoveWithExtraData,
  Piece,
  Pin,
  Position as ExternalPosition,
} from '../types';
import AttackMap from './attack-map';
import { findChecksOnKings } from './checks';
import CurrentZobrist from './current-zobrist';
import { evaluate } from './evaluation';
import { ENABLE_ATTACK_MAP, ENABLE_CHECK_TRACKING } from './global-config';
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
    return result.captured?.piece;
  }

  undoLastMove() {
    const moveResult = this._moveStack.pop();
    if (moveResult) {
      undoMove(this._position, moveResult, this._currentZobrist);
    } else {
      throw Error('no last move to undo');
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
      checks: this._position.checks,
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

  get checks(): KingChecks {
    if (ENABLE_CHECK_TRACKING) {
      return this._position.checks;
    } else {
      return findChecksOnKings(this._position.pieces, this._position.kings, {
        enPassantSquare: this._position.enPassantSquare,
        castlingAvailability: this._position.castlingAvailability,
      });
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
