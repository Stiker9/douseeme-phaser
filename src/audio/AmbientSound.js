export class AmbientSound {
  constructor(scene) {
    this.sound = scene.sound.add('ambient-sound', {
      volume: 0.42,
      loop: true,
    });
  }

  play() {
    if (!this.sound.isPlaying) {
      this.sound.play();
    }
  }
}
