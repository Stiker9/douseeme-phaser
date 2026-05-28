import { LoopingAudio } from './LoopingAudio.js';

export class AmbientSound extends LoopingAudio {
  constructor() {
    super('/Sample/ambient.wav', 0.42);
  }
}
