import { BLANK_POSITION_FEN, parseFEN } from '../lib/fen';
import {
  Color,
  Move,
  MoveWithExtraData,
  Piece,
  Pin,
  Position as ExternalPosition,
} from '../types';
import { AttackMap } from './attacks';
import { findChecksOnKings } from './checks';
import { evaluate } from './evaluation';
import { applyMove, MoveResult, undoMove } from './move-execution';
import { generateMoves } from './move-generation';
import { copyToInternal, copyToExternal } from './position';
import {
  AttackedSquares,
  KingChecks,
  Position,
  ITranspositionTable,
} from './types';

export default class Engine {
  _position: Position;
  _moveStack: MoveResult[] = [];

  constructor(position: ExternalPosition = parseFEN(BLANK_POSITION_FEN)) {
    this._position = copyToInternal(position);
  }

  applyMove(
    move: Move,
    options: { table?: ITranspositionTable<unknown> } = {}
  ): Piece | undefined {
    const result = applyMove(this._position, move, options);
    this._moveStack.push(result);
    return result.captured?.piece;
  }

  undoLastMove(options: { table?: ITranspositionTable<unknown> } = {}) {
    const moveResult = this._moveStack.pop();
    if (moveResult) {
      undoMove(this._position, moveResult, options);
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

  get position(): ExternalPosition {
    return copyToExternal(this._position);
  }

  set position(position: ExternalPosition) {
    this._position = copyToInternal(position);
    this._moveStack = [];
  }

  get checks(): KingChecks {
    return findChecksOnKings(this._position.pieces, this._position.kings, {
      enPassantSquare: this._position.enPassantSquare,
      castlingAvailability: this._position.castlingAvailability,
    });
  }

  get attacks(): AttackedSquares {
    // return this._position.attackedSquares;
    return {
      [Color.White]: new AttackMap(this._position, Color.White),
      [Color.Black]: new AttackMap(this._position, Color.Black),
    };
  }

  get pins(): Pin[] {
    return [
      ...Array.from(this._position.pinsToKing[Color.White].values()),
      ...Array.from(this._position.pinsToKing[Color.Black].values()),
    ];
  }
}
