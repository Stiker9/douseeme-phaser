const FADE_OUT_DURATION = 3000;

export class SpaceSample {
  constructor(scene) {
    this.scene = scene;
    this.sound = scene.sound.add('space-sample', {
      volume: 1,
      loop: true,
    });
    this.fadeTween = null;
  }

  play() {
    this.stopFade();
    this.sound.setVolume(1);

    if (!this.sound.isPlaying) {
      this.sound.play();
    }
  }

  fadeOutAndStop() {
    if (!this.sound.isPlaying) {
      return;
    }

    this.stopFade();

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
        this.sound.setVolume(1);
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
