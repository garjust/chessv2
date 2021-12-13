import React from 'react';
import { Color } from '../types';
import { BOARD_SQUARE_BLACK, BOARD_SQUARE_WHITE } from './theme';

export type SquareProps = {
  label: string;
  color: Color;
};

const Square = ({ label, color }: SquareProps) => {
  return (
    <div
      style={{
        gridArea: label,
        backgroundColor:
          color === Color.White ? BOARD_SQUARE_WHITE : BOARD_SQUARE_BLACK,
      }}
    ></div>
  );
};

export default Square;
