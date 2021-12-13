import React from 'react';
import './App.css';
import { ReactComponent as Pawn } from './piece-svg/pawn.svg';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Pawn width="50" height="50" />
      </header>
    </div>
  );
}

export default App;
