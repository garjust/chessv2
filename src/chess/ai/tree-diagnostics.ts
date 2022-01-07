const Cut = Symbol('CUT');

type Node = {
  move: string;
  score: number;
  children: (Node | typeof Cut)[];
};

export class TreeDiagnostics {
  label: string;
  root: Node[] = [];

  constructor(label: string) {
    this.label = label;
  }
}
