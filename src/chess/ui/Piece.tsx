import React, { Ref, forwardRef, memo } from 'react';
import { Color, PieceType } from '../types';
import {
  PIECE_BLACK_FILL,
  PIECE_BLACK_STROKE,
  PIECE_WHITE_FILL,
  PIECE_WHITE_STROKE,
} from './theme';
import * as PieceSvg from './piece-svg';

const Piece = memo(
  forwardRef(
    (
      {
        type,
        color,
        size,
      }: {
        type: PieceType;
        color: Color;
        size: number;
      },
      storeImage: React.ForwardedRef<SVGSVGElement>,
    ) => {
      let Svg: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
      switch (type) {
        case PieceType.Bishop:
          Svg = PieceSvg.Bishop;
          break;
        case PieceType.King:
          Svg = PieceSvg.King;
          break;
        case PieceType.Knight:
          Svg = PieceSvg.Knight;
          break;
        case PieceType.Pawn:
          Svg = PieceSvg.Pawn;
          break;
        case PieceType.Queen:
          Svg = PieceSvg.Queen;
          break;
        case PieceType.Rook:
          Svg = PieceSvg.Rook;
          break;
      }

      const css: React.CSSProperties = {
        fill: color === Color.White ? PIECE_WHITE_FILL : PIECE_BLACK_FILL,
        stroke: color === Color.White ? PIECE_WHITE_STROKE : PIECE_BLACK_STROKE,
        marginBottom: -3,
      };

      return <Svg ref={storeImage} width={size} height={size} style={css} />;
    },
  ),
);

export default Piece;
