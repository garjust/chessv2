import { Move } from '../../types';
import { moveString } from '../../utils';

let idCounter = 1;

class Root {
  depth = 0;
  id: number;
  children: Node[] = [];
  move?: Move;
  score?: number;
  alpha?: number;
  beta?: number;
  cut = false;

  constructor() {
    this.id = idCounter++;
  }

  get label() {
    return `${this.id} [label="score=${this.score}; α=${this.alpha},β=${this.beta}"]`;
  }
}

class Node extends Root {
  parent: Node | Root;
  children: Node[] = [];
  depth: number;

  move: Move;

  constructor(parent: Node | Root, depth: number, move: Move) {
    super();
    this.move = move;
    this.parent = parent;
    this.depth = depth;
  }
}

export default class SearchTree {
  root: Root;
  cursor: Node | Root;

  constructor() {
    this.root = new Root();
    this.cursor = this.root;
  }

  enter(move: Move) {
    const node = new Node(this.cursor, this.cursor.depth + 1, move);
    node.move = move;
    this.cursor.children.push(node);
    this.cursor = node;
  }

  up() {
    if (this.cursor instanceof Node) {
      this.cursor = this.cursor.parent;
    } else {
      throw Error('cannot travel up from root');
    }
  }

  cut() {
    if (this.cursor instanceof Node) {
      this.cursor.cut = true;
    } else {
      throw Error('cannot cut root');
    }
  }

  score(x: number) {
    this.cursor.score = x;
  }

  bounds(alpha: number, beta: number) {
    this.cursor.alpha = alpha;
    this.cursor.beta = beta;
  }
}

const mvStr = (move?: Move) => (move ? moveString(move) : 'nomove');

// Output a DOT formatted string for graphviz. Oh boy.
export const dotString = (tree: SearchTree): string => {
  let str = 'digraph searchtree {';
  str += tree.root.label;
  str += traverse(tree.root);
  str += '}';
  return str;
};

const traverse = (node: Node | Root): string => {
  const parts: string[] = [];

  for (const child of node.children) {
    parts.push(child.label);
    if (child.cut) {
      const edgeAttributes = `[label="${mvStr(
        child.move
      )}"][style="dotted"][color="red"]`;
      parts.push(`${node.id} -> ${child.id} ${edgeAttributes};`);
    } else {
      parts.push(traverse(child));
      const edgeAttributes = `[label="${mvStr(child.move)}"]`;
      parts.push(`${node.id} -> ${child.id} ${edgeAttributes};`);
    }
  }

  return parts.join('');
};
