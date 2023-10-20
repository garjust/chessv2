import React, { useState } from 'react';
import Game from './chess/ui/Game';
import Debug from './chess/ui/Debug';

enum Screen {
  Game = 'GAME',
  Debug = 'DEBUG',
}

const App = () => {
  const [screen, setScreen] = useState(Screen.Game);

  return (
    <div
      className="theme app-container dark-mode"
      style={{
        minHeight: '100vh',
        padding: 24,
      }}
    >
      <button
        onClick={() => {
          setScreen(screen === Screen.Game ? Screen.Debug : Screen.Game);
        }}
        style={{ marginBottom: 16, padding: 4 }}
      >
        Switch Screen
      </button>
      {screen === Screen.Game ? <Game /> : <></>}
      {screen === Screen.Debug ? <Debug /> : <></>}
    </div>
  );
};

export default App;
