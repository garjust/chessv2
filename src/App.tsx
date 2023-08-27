import React, { useState } from 'react';
import Game from './chess/ui/Game';
import Debug from './chess/ui/Debug';

enum Screen {
  Game,
  Debug,
}

const App = () => {
  const [screen, setScreen] = useState(Screen.Game);

  const toggleScreen = () => {
    setScreen(screen === Screen.Game ? Screen.Debug : Screen.Game);
  };

  return (
    <div
      className="theme app-container dark-mode"
      style={{
        minHeight: '100vh',
        padding: 24,
      }}
    >
      <button onClick={toggleScreen} style={{ marginBottom: 16, padding: 4 }}>
        Switch Screen
      </button>
      {screen === Screen.Game ? <Game /> : <Debug />}
    </div>
  );
};

export default App;
