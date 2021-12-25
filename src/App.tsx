import React, { useState } from 'react';
import Game from './chess/ui/Game';
import Debug from './chess/ui/Debug';

enum Screen {
  Game,
  Debug,
}

const App = () => {
  const [screen, setScreen] = useState(Screen.Game);

  return (
    <div
      style={{
        minHeight: '100vh',
      }}
    >
      {screen === Screen.Game ? <Game /> : <Debug />}
    </div>
  );
};

export default App;
