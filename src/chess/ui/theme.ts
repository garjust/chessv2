import React from 'react';

export const BOARD_SQUARE_WHITE = '#f7cfa4';
export const BOARD_SQUARE_BLACK = '#c78d53';

export const PIECE_WHITE_FILL = 'white';
export const PIECE_WHITE_STROKE = 'black';
export const PIECE_BLACK_FILL = 'black';
export const PIECE_BLACK_STROKE = 'white';

export const BOARD_SQUARE_ATTACKED: React.CSSProperties = {
  backgroundColor: 'rgba(229, 60, 60, 0.8)',
  boxShadow: 'inset 0 0 8px 2px rgb(229, 60, 60)',
};

export const BOARD_SQUARE_CAPTURABLE: React.CSSProperties = {
  backgroundColor: 'rgba(199, 83, 141, 0.8)',
  boxShadow: 'inset 0 0 8px 2px rgb(199, 83, 141)',
};

export const BOARD_SQUARE_CHECK: React.CSSProperties = {
  backgroundColor: 'red',
  boxShadow: 'inset 0 0 0 1px red',
};

export const BOARD_SQUARE_LAST_MOVE: React.CSSProperties = {
  backgroundColor: 'rgba(141, 83, 199, 0.8)',
  boxShadow: 'inset 0 0 8px 2px rgb(141, 83, 199)',
};

export const BOARD_SQUARE_MOVABLE: React.CSSProperties = {
  backgroundColor: 'rgba(141, 199, 83, 0.8)',
  boxShadow: 'inset 0 0 8px 2px rgb(141, 199, 83)',
};

export const BOARD_SQUARE_SELECTED: React.CSSProperties = {
  backgroundColor: 'rgba(83, 141, 199, 0.8)',
  boxShadow: 'inset 0 0 8px 2px rgb(83, 141, 199)',
};

export const BUTTON_CSS: React.CSSProperties = {
  padding: 16,
  cursor: 'pointer',
};
