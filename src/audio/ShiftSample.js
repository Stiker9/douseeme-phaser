const FADE_OUT_DURATION = 180;

export class ShiftSample {
  constructor(scene) {
    this.scene = scene;
    this.sound = scene.sound.add('shift-sample', {
      volume: 0.85,
      loop: true,
    });
    this.fadeTween = null;
  }

  setActive(isActive) {
    if (isActive) {
      this.play();
    } else {
      this.fadeOutAndStop();
    }
  }

  play() {
    this.stopFade();
    this.sound.setVolume(0.85);

    if (!this.sound.isPlaying) {
      this.sound.play();
    }
  }

  fadeOutAndStop() {
    if (!this.sound.isPlaying || this.fadeTween) {
      return;
    }

    const fade = { volume: this.sound.volume };
    this.fadeTween = this.scene.tweens.add({
      targets: fade,
      volume: 0,
      duration: FADE_OUT_DURATION,
      ease: 'Linear',
      onUpdate: () => {
        this.sound.setVolume(fade.volume);
      },
      onComplete: () => {
        this.sound.stop();
        this.sound.setVolume(0.85);
        this.fadeTween = null;
      },
    });
  }

  stopFade() {
    if (this.fadeTween) {
      this.fadeTween.stop();
      this.fadeTween = null;
    }
  }
}
