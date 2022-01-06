import {
  PERFT_POSITION_5,
  run,
  STARTING_POSITION,
  VIENNA_OPENING,
} from '../move-generation-perft';

const EMPTY_FN = () => {
  /* empty */
};

test('starting position perft', () => {
  expect(run(EMPTY_FN, STARTING_POSITION, 5)).toEqual(true);
});

test('vienna opening position perft', () => {
  expect(run(EMPTY_FN, VIENNA_OPENING, 5)).toEqual(true);
});

test('PERFT_5 position perft', () => {
  expect(run(EMPTY_FN, PERFT_POSITION_5, 5)).toEqual(true);
});
