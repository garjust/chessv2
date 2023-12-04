import { expect, test } from 'vitest';
import Core from '.';
import { VIENNA_GAMBIT_ACCEPTED_GAME } from '../lib/example-games';
import { formatPosition, parseFEN, FEN_LIBRARY } from '../lib/fen';
import { moveFromString } from '../move-notation';

test('test position has moves applied and undone', () => {
  const core = new Core(parseFEN(FEN_LIBRARY.STARTING_POSITION_FEN));
  const moves = VIENNA_GAMBIT_ACCEPTED_GAME.map(moveFromString);

  for (let n = 0; n < 10; n++) {
    for (const move of moves) {
      core.applyMove(move);
    }
    for (let i = 0; i < moves.length; i++) {
      core.undoLastMove();
    }
  }

  expect(formatPosition(core.position)).toEqual(
    FEN_LIBRARY.STARTING_POSITION_FEN,
  );
});

test('zobrist en passant updating', () => {
  const core1 = new Core(parseFEN(FEN_LIBRARY.STARTING_POSITION_FEN));
  const core2 = new Core(parseFEN(FEN_LIBRARY.STARTING_POSITION_FEN));
  const moves1 = ['e2e4', 'b8c6', 'g1f3', 'd7d5', 'f3g5'].map(moveFromString);
  const moves2 = ['g1f3', 'b8c6', 'e2e3', 'd7d6', 'e3e4', 'd6d5', 'f3g5'].map(
    moveFromString,
  );

  moves1.map((move) => core1.applyMove(move));
  moves2.map((move) => core2.applyMove(move));

  expect(core1.zobrist.key).toEqual(core2.zobrist.key);
});

test('zobrist castling state updating', () => {
  const core1 = new Core(
    parseFEN('r3k2r/ppp2pp1/2nbbn2/2q5/7Q/3BBN2/PPPN1PPP/R3K2R b KQkq - 4 11'),
  );
  const core2 = new Core(
    parseFEN('r3k2r/ppp2pp1/2nbbn2/2q5/7Q/3BBN2/PPPN1PPP/R3K2R b KQkq - 4 11'),
  );
  const shuffleMoves = ['e6d5', 'f3d4', 'c5c4', 'a2a3', 'g7g5'];
  const moves1 = [...shuffleMoves, 'h4h8', 'f6g8', 'e1c1', 'a8d8'].map(
    moveFromString,
  );
  const moves2 = [...shuffleMoves, 'e1c1', 'a8d8', 'h4h8', 'f6g8'].map(
    moveFromString,
  );

  moves1.map((move) => core1.applyMove(move));
  moves2.map((move) => core2.applyMove(move));

  expect(core1.zobrist.key).toEqual(core2.zobrist.key);
});
