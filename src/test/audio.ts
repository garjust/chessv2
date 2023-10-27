import { vi } from 'vitest';

class AudioStub {
  file: string;
  constructor(file: string) {
    this.file = file;
  }
  play() {
    console.log('play audio', this.file);
  }
}

vi.stubGlobal('Audio', AudioStub);
