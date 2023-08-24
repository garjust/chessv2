import { parseFEN, FEN_LIBRARY } from '../../lib/fen';
import { Color } from '../../types';
import Pins from '../pins';

test('pins', () => {
  // Vienna gambit accepted with moreee pinsss.
  const position = parseFEN(
    '2k2bnr/pppr1p2/2n3p1/3NPB1p/5Bb1/5N2/PPP3PP/R2K3R w  - 2 14',
  );
  const absolutePins = {
    [Color.White]: new Pins(position.pieces, 3, Color.White),
    [Color.Black]: new Pins(position.pieces, 58, Color.Black),
  };

  expect(absolutePins[Color.White].allPins).toEqual([
    {
      pinned: 21,
      attacker: 30,
      legalMoveSquares: [12, 21],
    },
    {
      pinned: 35,
      attacker: 51,
      legalMoveSquares: [11, 19, 27, 43, 35],
    },
  ]);
  expect(absolutePins[Color.Black].allPins).toEqual([
    {
      pinned: 51,
      attacker: 37,
      legalMoveSquares: [44, 51],
    },
  ]);
});
