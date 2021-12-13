import React from 'react';
import { Color } from '../color';
import {
  PIECE_BLACK_FILL,
  PIECE_BLACK_STROKE,
  PIECE_WHITE_FILL,
  PIECE_WHITE_STROKE,
} from './theme';

export type PieceProps = {
  Svg: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  color?: Color;
  size?: number;
};

const Piece = ({ Svg, color, size }: PieceProps) => {
  color = color ?? Color.White;
  size = size ?? 50;

  const css: React.CSSProperties = {
    fill: color === Color.White ? PIECE_WHITE_FILL : PIECE_BLACK_FILL,
    stroke: color === Color.White ? PIECE_WHITE_STROKE : PIECE_BLACK_STROKE,
  };

  return <Svg width={size} height={size} style={css} />;
};

export default Piece;
