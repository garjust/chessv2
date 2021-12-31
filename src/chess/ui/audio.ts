/* eslint-disable @typescript-eslint/no-var-requires */
const captureAudio = require('./audio-files/capture.ogg');
const moveAudio = require('./audio-files/move.ogg');
const notifyAudio = require('./audio-files/notify.ogg');
/* eslint-enable @typescript-eslint/no-var-requires */

export enum Sound {
  Capture = 'CAPTURE',
  Check = 'CHECK',
  Draw = 'DRAW',
  Lose = 'LOSE',
  Move = 'MOVE',
  Notify = 'NOTIFY',
  Win = 'WIN',
}

const AudioMap = Object.freeze({
  [Sound.Capture]: new Audio(captureAudio),
  [Sound.Check]: new Audio(notifyAudio),
  [Sound.Draw]: new Audio(notifyAudio),
  [Sound.Lose]: new Audio(notifyAudio),
  [Sound.Move]: new Audio(moveAudio),
  [Sound.Notify]: new Audio(notifyAudio),
  [Sound.Win]: new Audio(notifyAudio),
});

export const play = (sound: Sound): void => {
  AudioMap[sound].play();
};
