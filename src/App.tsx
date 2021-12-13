import React from 'react';
import Game from './chess/ui/Game';
import Piece from './chess/ui/Piece';
import * as PieceSvg from './chess/ui/piece-svg';

const App = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
      }}
    >
      <Piece Svg={PieceSvg.Bishop} />
      <Piece Svg={PieceSvg.King} />
      <Piece Svg={PieceSvg.Knight} />
      <Piece Svg={PieceSvg.Pawn} />
      <Piece Svg={PieceSvg.Queen} />
      <Piece Svg={PieceSvg.Rook} />

      <Game />
    </div>
  );
};

export default App;
