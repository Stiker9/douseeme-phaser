import Phaser from 'phaser';

const BOT_SPEED = 1.35;
const TURN_SPEED = 0.035;
const TARGET_REACHED_DISTANCE = 28;
const SPRITE_SCALE = 3;
const SPRITE_WIDTH = 16;
const SPRITE_HEIGHT = 22;
const TRAIL_MAX = 9;

const COLORS = {
  C: 0x14161e,
  D: 0x0a0b11,
  L: 0x1d202c,
  F: 0x08090d,
  e: 0x6e1c1c,
  s: 0x1a1620,
};

const FRAMES = {
  idle_a: [
    '................',
    '................',
    '.....CCCCCC.....',
    '....CCCCCCCC....',
    '...CCDDDDDDCC...',
    '...CDFFFFFFDC...',
    '...CDFsFFsFDC...',
    '...CDFFeFeFDC...',
    '...CDFFFFFFDC...',
    '..CCCCCCCCCCCC..',
    '..CDCCCCCCCCDC..',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '..CCCCCCCCCCCC..',
    '..CCCCCCCCCCCC..',
    '..CCCCCCCCCCCC..',
    '...CCC..CCCC....',
    '...DCC..CCD.....',
    '...DD....DD.....',
  ],
  idle_b: [
    '................',
    '.....CCCCCC.....',
    '....CCCCCCCC....',
    '...CCDDDDDDCC...',
    '...CDFFFFFFDC...',
    '...CDFsFFsFDC...',
    '...CDFFeFeFDC...',
    '...CDFFFFFFDC...',
    '..CCCCCCCCCCCC..',
    '..CDCCCCCCCCDC..',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '..CCCCCCCCCCCC..',
    '..CCCCCCCCCCCC..',
    '..CCCCCCCCCCCC..',
    '...CCCC.CCCC....',
    '...DCC..CCD.....',
    '...DD....DD.....',
  ],
  walk_a: [
    '................',
    '.....CCCCCC.....',
    '....CCCCCCCC....',
    '...CCDDDDDDCC...',
    '...CDFFFFFFDC...',
    '...CDFsFFsFDC...',
    '...CDFFeFeFDC...',
    '...CDFFFFFFDC...',
    '..CCCCCCCCCCCC..',
    '..CDCCCCCCCCDC..',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCCL..',
    '...CCCCCCCCCCL..',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '..CCCCCCCCCCCC..',
    '..CCCCCCCCCCCCC.',
    '..CCCCCCCCCCCC..',
    '...CCCCCCCCCC...',
    '...CCC...CCC....',
    '..DCC.....CCD...',
    '..DD........D...',
  ],
  walk_b: [
    '................',
    '.....CCCCCC.....',
    '....CCCCCCCC....',
    '...CCDDDDDDCC...',
    '...CDFFFFFFDC...',
    '...CDFsFFsFDC...',
    '...CDFFeFeFDC...',
    '...CDFFFFFFDC...',
    '..CCCCCCCCCCCC..',
    '..CDCCCCCCCCDC..',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '..CCCCCCCCCCCC..',
    '..CCCCCCCCCCCC..',
    '..CCCCCCCCCCCC..',
    '...CCC..CCCC....',
    '...DCC..CCD.....',
    '...DD....DD.....',
  ],
  walk_c: [
    '................',
    '.....CCCCCC.....',
    '....CCCCCCCC....',
    '...CCDDDDDDCC...',
    '...CDFFFFFFDC...',
    '...CDFsFFsFDC...',
    '...CDFFeFeFDC...',
    '...CDFFFFFFDC...',
    '..CCCCCCCCCCCC..',
    '..CDCCCCCCCCDC..',
    '..LCCCCCCCCCC...',
    '..LCCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '..CCCCCCCCCCCC..',
    '.CCCCCCCCCCCCC..',
    '..CCCCCCCCCCCC..',
    '...CCCCCCCCCC...',
    '....CCC...CCC...',
    '...DCC.....CCD..',
    '...D........DD..',
  ],
  walk_d: [
    '................',
    '.....CCCCCC.....',
    '....CCCCCCCC....',
    '...CCDDDDDDCC...',
    '...CDFFFFFFDC...',
    '...CDFsFFsFDC...',
    '...CDFFeFeFDC...',
    '...CDFFFFFFDC...',
    '..CCCCCCCCCCCC..',
    '..CDCCCCCCCCDC..',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '..CCCCCCCCCCCC..',
    '..CCCCCCCCCCCC..',
    '..CCCCCCCCCCCC..',
    '...CCC..CCCC....',
    '...DCC..CCD.....',
    '...DD....DD.....',
  ],
};

const ANIMATIONS = {
  idle: { frames: ['idle_a', 'idle_a', 'idle_b', 'idle_b', 'idle_b', 'idle_a'], fps: 3 },
  walk: { frames: ['walk_a', 'walk_b', 'walk_c', 'walk_d'], fps: 7 },
};

export class Bot {
  constructor(scene, x, y, bounds) {
    this.scene = scene;
    this.bounds = bounds;
    this.x = x;
    this.y = y;
    this.angle = -Math.PI / 2;
    this.target = { x, y };
    this.objectiveTarget = null;
    this.hasKey = false;
    this.facing = 1;
    this.currentAnimation = 'idle';
    this.frameIndex = 0;
    this.frameAccumulator = 0;
    this.bobTime = 0;
    this.trail = [];
    this.trailAccumulator = 0;

    this.graphics = scene.add.graphics();
    this.graphics.setDepth(5);

    this.pickNewTarget();
  }

  update(stepScale) {
    const dt = stepScale / 60;
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.hypot(dx, dy);
    let isMoving = false;

    if (distance < TARGET_REACHED_DISTANCE) {
      if (!this.objectiveTarget) {
        this.pickNewTarget();
      }
    } else {
      const targetAngle = Math.atan2(dy, dx);
      this.angle = Phaser.Math.Angle.RotateTo(this.angle, targetAngle, TURN_SPEED * stepScale);
      this.x += Math.cos(this.angle) * BOT_SPEED * stepScale;
      this.y += Math.sin(this.angle) * BOT_SPEED * stepScale;
      this.clampToBounds();
      this.facing = dx > 0 ? 1 : -1;
      isMoving = true;
    }

    this.updateAnimation(isMoving, dt);
    this.updateTrail(isMoving, dt);
    this.draw(isMoving);
  }

  updateAnimation(isMoving, dt) {
    const nextAnimation = isMoving ? 'walk' : 'idle';

    if (this.currentAnimation !== nextAnimation) {
      this.currentAnimation = nextAnimation;
      this.frameIndex = 0;
      this.frameAccumulator = 0;
    }

    const animation = ANIMATIONS[this.currentAnimation];
    this.frameAccumulator += dt;

    while (this.frameAccumulator >= 1 / animation.fps) {
      this.frameAccumulator -= 1 / animation.fps;
      this.frameIndex = (this.frameIndex + 1) % animation.frames.length;
    }

    this.bobTime += dt;
  }

  updateTrail(isMoving, dt) {
    this.trailAccumulator += dt;

    if (isMoving && this.trailAccumulator > 0.06) {
      this.trailAccumulator = 0;
      this.trail.push({
        x: this.x,
        y: this.y,
        frame: this.getFrameKey(),
        facing: this.facing,
      });

      if (this.trail.length > TRAIL_MAX) {
        this.trail.shift();
      }
    }

    if (!isMoving && this.trailAccumulator > 0.12 && this.trail.length > 0) {
      this.trailAccumulator = 0;
      this.trail.shift();
    }
  }

  pickNewTarget() {
    if (this.objectiveTarget) {
      return;
    }

    const margin = 180;

    this.target.x = Phaser.Math.Between(this.bounds.x + margin, this.bounds.x + this.bounds.width - margin);
    this.target.y = Phaser.Math.Between(this.bounds.y + margin, this.bounds.y + this.bounds.height - margin);
  }

  setObjectiveTarget(x, y) {
    this.objectiveTarget = { x, y };
    this.target.x = x;
    this.target.y = y;
  }

  clearObjectiveTarget() {
    this.objectiveTarget = null;
    this.pickNewTarget();
  }

  draw(isMoving) {
    const frameKey = this.getFrameKey();
    const bobOffset = !isMoving && Math.sin(this.bobTime * 2) <= 0 ? SPRITE_SCALE : 0;
    const flicker = Phaser.Math.Clamp(
      0.85 + Math.sin(this.bobTime * 9.3) * 0.05 + (Math.random() < 0.02 ? -0.3 : 0),
      0.45,
      1,
    );

    this.graphics.clear();

    this.trail.forEach((trailFrame, index) => {
      const alpha = 0.04 + (index / Math.max(1, this.trail.length)) * 0.18;
      this.drawSprite(trailFrame.frame, trailFrame.x, trailFrame.y, trailFrame.facing, alpha);
    });

    this.drawSprite(frameKey, this.x, this.y + bobOffset, this.facing, 1);
    this.drawEyeGlow(this.x, this.y + bobOffset, this.facing, flicker);
  }

  drawSprite(frameKey, x, y, facing, alpha) {
    const rows = FRAMES[frameKey];
    const startX = Math.round(x - (SPRITE_WIDTH * SPRITE_SCALE) / 2);
    const startY = Math.round(y - SPRITE_HEIGHT * SPRITE_SCALE);

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex];

      for (let colIndex = 0; colIndex < row.length; colIndex += 1) {
        const sourceX = facing < 0 ? colIndex : SPRITE_WIDTH - 1 - colIndex;
        const color = COLORS[row[sourceX]];

        if (color) {
          this.graphics.fillStyle(color, alpha);
          this.graphics.fillRect(
            startX + colIndex * SPRITE_SCALE,
            startY + rowIndex * SPRITE_SCALE,
            SPRITE_SCALE,
            SPRITE_SCALE,
          );
        }
      }
    }
  }

  drawEyeGlow(x, y, facing, alpha) {
    const eyeY = Math.round(y - SPRITE_HEIGHT * SPRITE_SCALE + 7 * SPRITE_SCALE);
    const eyeOneX = Math.round(x + -1 * facing * SPRITE_SCALE);
    const eyeTwoX = Math.round(x + 1 * facing * SPRITE_SCALE);

    this.graphics.fillStyle(0xa83232, alpha);
    this.graphics.fillRect(eyeOneX, eyeY, SPRITE_SCALE, SPRITE_SCALE);
    this.graphics.fillRect(eyeTwoX, eyeY, SPRITE_SCALE, SPRITE_SCALE);

    this.graphics.fillStyle(0xa83232, alpha * 0.08);
    this.graphics.fillCircle(x, eyeY + SPRITE_SCALE / 2, 18);
    this.graphics.fillStyle(0xa83232, alpha * 0.16);
    this.graphics.fillCircle(x, eyeY + SPRITE_SCALE / 2, 9);
  }

  getFrameKey() {
    const animation = ANIMATIONS[this.currentAnimation];

    return animation.frames[this.frameIndex];
  }

  clampToBounds() {
    this.x = Phaser.Math.Clamp(this.x, this.bounds.x, this.bounds.x + this.bounds.width);
    this.y = Phaser.Math.Clamp(this.y, this.bounds.y, this.bounds.y + this.bounds.height);
  }
}
