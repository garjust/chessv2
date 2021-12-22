import { ChessComputer } from './types';
import {
  Color,
  ComputedPositionData,
  Move,
  MovesByPiece,
  Position,
} from '../types';
import { flattenMoves } from '../utils';
import { applyMove } from '../lib/move-execution';
import { evaluate } from '../lib/evaluation';
import { computeMovementData } from '../lib/move-generation';
import { board } from '../lib/bitmap';

function computeAll(position: Position): ComputedPositionData {
  return {
    ...computeMovementData(position),
    evaluation: evaluate(position),
    bitmaps: {
      whitePieces: board(position, { color: Color.White }),
      blackPieces: board(position, { color: Color.Black }),
    },
  };
}

const pluck = <T>(array: Array<T>): T =>
  array[Math.floor(Math.random() * array.length)];

type Node = {
  move?: Move;
  position: Position;
  computedPositionData: ComputedPositionData;
};

const NODES_SORT = {
  [Color.White]: (a: Node, b: Node) =>
    b.computedPositionData.evaluation - a.computedPositionData.evaluation,
  [Color.Black]: (a: Node, b: Node) =>
    a.computedPositionData.evaluation - b.computedPositionData.evaluation,
};

const map = (node: Node, color: Color, depth: number): Node => {
  console.log('map', node, depth, node.computedPositionData.evaluation);
  if (depth === 0) {
    return node;
  }

  const nodes: Node[] = flattenMoves(
    node.computedPositionData.movesByPiece
  ).map((move) => {
    const result = applyMove(node.position, move);
    const computedPositionData = computeAll(result.position);
    return {
      move,
      position: result.position,
      computedPositionData,
    };
  });

  const nextNodes = nodes
    .map((node) => map(node, color, depth - 1))
    .sort(NODES_SORT[color]);
  const bestEvaluation = nextNodes[0].computedPositionData.evaluation;

  return pluck(
    nextNodes.filter(
      (node) => node.computedPositionData.evaluation === bestEvaluation
    )
  );
};

export default class v3 implements ChessComputer {
  nextMove(
    position: Position,
    computedPositionData: ComputedPositionData
  ): Move {
    const result = map({ position, computedPositionData }, position.turn, 1);
    if (result.move) {
      return result.move;
    } else {
      throw Error('this should have worked');
    }
  }

  toJSON(): string {
    return 'justins chess computer v3';
  }
}
