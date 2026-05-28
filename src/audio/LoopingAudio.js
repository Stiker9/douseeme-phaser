export class LoopingAudio {
  constructor(src, volume = 1) {
    this.audio = new Audio(src);
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.audio.volume = volume;
    this.defaultVolume = volume;
    this.fadeFrame = null;
  }

  play() {
    this.stopFade();
    this.audio.volume = this.defaultVolume;

    if (this.audio.paused) {
      this.audio.play().catch(() => {
        // Browsers may block autoplay until the first user gesture.
      });
    }
  }

  fadeOutAndStop(duration = 0) {
    if (this.audio.paused) {
      return;
    }

    this.stopFade();

    if (duration <= 0) {
      this.stop();
      return;
    }

    const startedAt = performance.now();
    const startedVolume = this.audio.volume;

    const fade = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      this.audio.volume = startedVolume * (1 - progress);

      if (progress < 1) {
        this.fadeFrame = requestAnimationFrame(fade);
      } else {
        this.stop();
      }
    };

    this.fadeFrame = requestAnimationFrame(fade);
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.volume = this.defaultVolume;
    this.fadeFrame = null;
  }

  stopFade() {
    if (this.fadeFrame) {
      cancelAnimationFrame(this.fadeFrame);
      this.fadeFrame = null;
    }
  }
}
