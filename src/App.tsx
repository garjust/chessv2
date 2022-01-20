import React, { useState } from 'react';
import Game from './chess/ui/Game';
import Debug from './chess/ui/Debug';
import { BUTTON_CSS } from './chess/ui/theme';

enum Screen {
  Game,
  Debug,
}

const App = () => {
  const [screen, setScreen] = useState(Screen.Debug);

  const toggleScreen = () => {
    setScreen(screen === Screen.Game ? Screen.Debug : Screen.Game);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        margin: 24,
      }}
    >
      <button
        onClick={toggleScreen}
        style={{ ...BUTTON_CSS, marginBottom: 16, padding: 4 }}
      >
        Switch Screen
      </button>
      {screen === Screen.Game ? <Game /> : <Debug />}
    </div>
  );
};

export default App;
