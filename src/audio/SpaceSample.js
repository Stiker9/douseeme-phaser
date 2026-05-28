import { LoopingAudio } from './LoopingAudio.js';

const FADE_OUT_DURATION = 3000;

export class SpaceSample extends LoopingAudio {
  constructor() {
    super('/Sample/space.wav', 1);
  }

  fadeOutAndStop() {
    super.fadeOutAndStop(FADE_OUT_DURATION);
  }
}
