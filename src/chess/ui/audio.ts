const MOVE_URL =
  'https://github.com/ornicar/lila/blob/38bfadac3e319516341771086e8edc594d4d4b07/public/sound/standard/Move.ogg';

export enum Sound {
  Move = 'MOVE',
}

const AudioMap = Object.freeze({
  [Sound.Move]: new Audio(MOVE_URL),
});

export const play = (sound: Sound): void => {
  AudioMap[sound].play();
};
