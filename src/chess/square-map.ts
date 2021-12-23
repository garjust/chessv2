import StringKeyMap from '../lib/string-key-map';
import { Square } from './types';
import { labelToSquare, squareLabel } from './utils';

export class SquareMap<T> extends StringKeyMap<Square, T> {
  constructor() {
    super(squareLabel, labelToSquare);
  }
}
