import { LoopingAudio } from './LoopingAudio.js';

const FADE_OUT_DURATION = 180;

export class ShiftSample extends LoopingAudio {
  constructor() {
    super('/Sample/shift.wav', 0.85);
  }

  setActive(isActive) {
    if (isActive) {
      this.play();
    } else {
      this.fadeOutAndStop();
    }
  }

  fadeOutAndStop() {
    super.fadeOutAndStop(FADE_OUT_DURATION);
  }
}
