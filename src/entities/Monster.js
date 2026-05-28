import Phaser from 'phaser';
import { LegSystem } from './LimbSystem.js';
import { Segment, normalizeRelativeAngle } from './Segment.js';

function smoothStep(value) {
  const x = Phaser.Math.Clamp(value, 0, 1);

  return x * x * (3 - 2 * x);
}

export class Monster {
  constructor(scene, x, y, bounds = null) {
    this.scene = scene;
    this.bounds = bounds;
    this.x = x;
    this.y = y;
    this.absAngle = 0;
    this.fSpeed = 0;
    this.fAccel = 0.42;
    this.fFric = 0.18;
    this.fRes = 0.18;
    this.fThresh = 18;
    this.rSpeed = 0;
    this.rAccel = 0.026;
    this.rFric = 0.004;
    this.rRes = 0.2;
    this.rThresh = 0.05;
    this.children = [];
    this.systems = [];
    this.spineSegments = [];
    this.neckSegments = [];
    this.tailSegments = [];
    this.time = 0;
    this.headLookOffset = 0;
    this.frozenNeckAngle = 0;
    this.neckTransition = 0;
    this.visualHead = { x, y, angle: 0 };
    this.moveSpeedMultiplier = 2;
    this.sprintMultiplier = 10;
    this.isSprinting = false;
    this.isFrozen = false;

    this.graphics = scene.add.graphics();
    this.graphics.setDepth(10);
    this.followTarget = scene.add.zone(x, y, 1, 1);

    this.buildBody();
  }

  buildBody() {
    const legCount = 10;
    const size = 8 / Math.sqrt(legCount);
    let spine = this;

    for (let i = 0; i < 6; i += 1) {
      spine = this.addSegment(spine, size * 4, 0, Math.PI * 0.66, 1.1);
      this.spineSegments.push(spine);
      this.neckSegments.push(spine);
      this.addRibs(spine, size, 3, 0.1, size * 3);
    }

    for (let leg = 0; leg < legCount; leg += 1) {
      if (leg > 0) {
        for (let ribSet = 0; ribSet < 6; ribSet += 1) {
          spine = this.addSegment(spine, size * 4, 0, Math.PI / 2, 1.5);
          this.spineSegments.push(spine);
          this.addRibs(spine, size, 3, 0.3, size * 3);
        }
      }

      this.addLegPair(spine, size);
    }

    const tailLength = 60;
    for (let i = 0; i < tailLength; i += 1) {
      spine = this.addSegment(spine, size * 4, 0, Math.PI * 0.66, 1.1);
      this.spineSegments.push(spine);
      this.tailSegments.push(spine);
      this.addRibs(spine, size, 3, 0.1, size * 3 * ((tailLength - i) / tailLength));
    }
  }

  addSegment(parent, size, angle, range, stiffness) {
    return new Segment(parent, size, angle, range, stiffness);
  }

  addRibs(spine, size, count, curl, length) {
    for (let side = -1; side <= 1; side += 2) {
      let rib = this.addSegment(spine, size * 3, side, 0.1, 2);

      for (let i = 0; i < count; i += 1) {
        rib = this.addSegment(rib, length, -side * curl, 0.1, 2);
      }
    }
  }

  addLegPair(spine, size) {
    for (let side = -1; side <= 1; side += 2) {
      let leg = this.addSegment(spine, size * 12, side * Math.PI * 0.25, 0, 8);
      leg = this.addSegment(leg, size * 16, -side * Math.PI * 0.25, Math.PI * 2, 1);
      leg = this.addSegment(leg, size * 16, side * Math.PI * 0.5, Math.PI, 2);

      for (let finger = 0; finger < 4; finger += 1) {
        this.addSegment(leg, size * 4, (finger / 3 - 0.5) * Math.PI * 0.5, 0.1, 4);
      }

      new LegSystem(leg, 3, size * 12, this);
    }
  }

  update(stepScale, targetX, targetY) {
    const delta = this.scene.game.loop.delta;

    this.time += delta;
    this.updateNeckTransition(delta);
    this.follow(targetX, targetY, Math.min(stepScale, 2.5));
    this.draw();
    this.followTarget.setPosition(this.x, this.y);
  }

  setSprinting(isSprinting) {
    this.isSprinting = isSprinting;
  }

  setFrozen(isFrozen) {
    if (isFrozen && !this.isFrozen) {
      this.initializeFrozenNeckPose();
    }

    this.isFrozen = isFrozen;
  }

  updateNeckTransition(delta) {
    const direction = this.isFrozen ? 1 : -1;
    const speed = delta / 620;

    this.neckTransition = Phaser.Math.Clamp(this.neckTransition + direction * speed, 0, 1);
  }

  follow(targetX, targetY, stepScale) {
    if (this.isFrozen) {
      this.fSpeed = 0;
      this.rSpeed = 0;
      this.animateFrozenHeadAndNeck(targetX, targetY);
      return;
    }

    this.headLookOffset *= 0.82;

    const dist = Math.hypot(this.x - targetX, this.y - targetY);
    const angle = Math.atan2(targetY - this.y, targetX - this.x);
    let accel = this.fAccel * stepScale;

    if (this.systems.length > 0) {
      const plantedLegs = this.systems.reduce((sum, system) => sum + (system.step === 0 ? 1 : 0), 0);
      accel *= plantedLegs / this.systems.length;
    }

    this.fSpeed += accel * (dist > this.fThresh ? 1 : 0);
    this.fSpeed *= 1 - this.fRes;
    this.speed = Math.max(0, this.fSpeed - this.fFric * stepScale);

    const diff = normalizeRelativeAngle(this.absAngle - angle);
    if (Math.abs(diff) > this.rThresh && dist > this.fThresh) {
      this.rSpeed -= this.rAccel * stepScale * (2 * (diff > 0) - 1);
    }

    this.rSpeed *= 1 - this.rRes;
    if (Math.abs(this.rSpeed) > this.rFric) {
      this.rSpeed -= this.rFric * (2 * (this.rSpeed > 0) - 1);
    } else {
      this.rSpeed = 0;
    }

    this.absAngle = normalizeRelativeAngle(this.absAngle + this.rSpeed);
    const speedMultiplier = this.isSprinting ? this.sprintMultiplier : this.moveSpeedMultiplier;

    this.x += this.speed * Math.cos(this.absAngle) * stepScale * speedMultiplier;
    this.y += this.speed * Math.sin(this.absAngle) * stepScale * speedMultiplier;
    this.clampToBounds();

    this.absAngle += Math.PI;
    this.children.forEach((child) => child.follow(true));
    this.systems.forEach((system) => system.update(stepScale));
    this.absAngle -= Math.PI;
  }

  draw() {
    this.graphics.clear();
    this.graphics.lineStyle(1, 0xf3f5ee, 0.92);

    if (this.neckTransition > 0) {
      this.drawFrozenBodyFromNeckBase();
      this.drawFrozenTailOverlay();
      this.drawFrozenNeckOverlay();
    }

    if (this.neckTransition < 1) {
      this.drawHead();
      this.children.forEach((child) => this.drawSegmentTree(child, 1 - this.neckTransition));
    }
  }

  drawHead() {
    this.drawHeadShape(this.x, this.y, this.absAngle + this.headLookOffset);
  }

  drawHeadShape(x, y, angle, alpha = 1) {
    const radius = 5;
    const start = Math.PI / 4 + angle;
    const end = (Math.PI * 7) / 4 + angle;

    this.graphics.lineStyle(1, 0xf3f5ee, 0.92 * alpha);
    this.graphics.beginPath();
    this.graphics.arc(x, y, radius, start, end, false);
    this.graphics.lineTo(
      x + radius * Math.cos(angle) * Math.SQRT2,
      y + radius * Math.sin(angle) * Math.SQRT2,
    );
    this.graphics.lineTo(x + radius * Math.cos(start), y + radius * Math.sin(start));
    this.graphics.strokePath();
  }

  drawSegmentTree(segment, alphaMultiplier = 1) {
    const depthAlpha = Phaser.Math.Clamp(1 - this.distanceFromHead(segment) / 580, 0.28, 0.95);

    this.graphics.lineStyle(1, 0xf3f5ee, depthAlpha * alphaMultiplier);
    this.graphics.lineBetween(segment.parent.x, segment.parent.y, segment.x, segment.y);

    segment.children.forEach((child) => this.drawSegmentTree(child, alphaMultiplier));
  }

  distanceFromHead(segment) {
    return Math.hypot(segment.x - this.x, segment.y - this.y);
  }

  animateFrozenHeadAndNeck(targetX, targetY) {
    const base = this.getNeckBase();

    if (!base) {
      return;
    }

    const targetAngle = Math.atan2(targetY - base.y, targetX - base.x);
    const desiredOffset = Phaser.Math.Clamp(normalizeRelativeAngle(targetAngle - this.absAngle), -1.45, 1.45);
    const breathingOffset = Math.sin(this.time * 0.0042) * 0.08 + Math.sin(this.time * 0.0071 + 1.6) * 0.04;

    this.headLookOffset += (desiredOffset + breathingOffset - this.headLookOffset) * 0.09;
    this.frozenNeckAngle = Phaser.Math.Angle.RotateTo(
      this.frozenNeckAngle,
      this.absAngle + this.headLookOffset,
      0.032,
    );
  }

  initializeFrozenNeckPose() {
    const base = this.getNeckBase();

    this.frozenNeckAngle = base ? Math.atan2(this.y - base.y, this.x - base.x) : this.absAngle;
    this.headLookOffset = normalizeRelativeAngle(this.frozenNeckAngle - this.absAngle);
    this.visualHead.x = this.x;
    this.visualHead.y = this.y;
    this.visualHead.angle = this.absAngle;
  }

  getNeckBase() {
    return this.neckSegments[this.neckSegments.length - 1] || null;
  }

  drawFrozenBodyFromNeckBase() {
    const base = this.getNeckBase();

    if (!base) {
      this.children.forEach((child) => this.drawSegmentTree(child));
      return;
    }

    base.children.forEach((child) => {
      if (!this.neckSegments.includes(child)) {
        this.drawSegmentTree(child, this.neckTransition);
      }
    });
  }

  drawFrozenNeckOverlay() {
    const base = this.getNeckBase();

    if (!base) {
      return;
    }

    let x = base.x;
    let y = base.y;
    const count = this.neckSegments.length;
    const transitionAlpha = smoothStep(this.neckTransition);

    for (let i = count - 1; i >= 0; i -= 1) {
      const localIndex = count - 1 - i;
      const blend = i / Math.max(1, count - 1);
      const curve = Math.sin((localIndex / Math.max(1, count - 1)) * Math.PI) * this.headLookOffset * 0.24;
      const wave = Math.sin(this.time * 0.006 + localIndex * 0.9) * (1 - blend) * 0.055;
      const angle = this.frozenNeckAngle + curve + wave;
      const size = this.neckSegments[i].size;
      const nextX = x + Math.cos(angle) * size;
      const nextY = y + Math.sin(angle) * size;

      this.graphics.lineStyle(1, 0xf3f5ee, (0.55 + (1 - blend) * 0.3) * transitionAlpha);
      this.graphics.lineBetween(x, y, nextX, nextY);

      if (localIndex < count - 2) {
        this.drawFrozenNeckRibs(nextX, nextY, angle, blend, localIndex, transitionAlpha);
      }

      x = nextX;
      y = nextY;
    }

    this.visualHead.x = x;
    this.visualHead.y = y;
    this.visualHead.angle = this.frozenNeckAngle;
    this.graphics.lineStyle(1, 0xf3f5ee, 0.88 * transitionAlpha);
    this.drawHeadShape(this.visualHead.x, this.visualHead.y, this.visualHead.angle, transitionAlpha);
  }

  drawFrozenNeckRibs(x, y, angle, blend, localIndex, transitionAlpha) {
    const alpha = (0.13 + (1 - blend) * 0.22) * transitionAlpha;
    const ribSegmentLength = 7.4 - blend * 1.1;

    for (let side = -1; side <= 1; side += 2) {
      let jointX = x;
      let jointY = y;
      const baseAngle = angle + side * Math.PI / 2;
      const breathing = Math.sin(this.time * 0.006 + localIndex * 0.75 + side) * 0.08;

      this.graphics.lineStyle(1, 0xf3f5ee, alpha);

      for (let joint = 0; joint < 4; joint += 1) {
        const curl = side * (joint * 0.13 + blend * 0.08) + breathing;
        const jointAngle = baseAngle + curl;
        const length = ribSegmentLength * (1 - joint * 0.08);
        const nextX = jointX + Math.cos(jointAngle) * length;
        const nextY = jointY + Math.sin(jointAngle) * length;

        this.graphics.lineBetween(jointX, jointY, nextX, nextY);
        jointX = nextX;
        jointY = nextY;
      }

      if (localIndex % 2 === 0) {
        const fingerAngle = baseAngle + side * 0.65 + breathing;
        this.graphics.lineStyle(1, 0xf3f5ee, alpha * 0.74);
        this.graphics.lineBetween(
          jointX,
          jointY,
          jointX + Math.cos(fingerAngle) * 4.2,
          jointY + Math.sin(fingerAngle) * 4.2,
        );
      }
    }
  }

  drawFrozenTailOverlay() {
    const animatedCount = Math.max(1, Math.floor(this.tailSegments.length * 0.3));
    const startIndex = this.tailSegments.length - animatedCount;

    for (let i = startIndex; i < this.tailSegments.length; i += 1) {
      const segment = this.tailSegments[i];
      const localIndex = i - startIndex;
      const normalized = localIndex / Math.max(1, animatedCount - 1);
      const parent = segment.parent;
      const angle = Math.atan2(segment.y - parent.y, segment.x - parent.x);
      const wave = Math.sin(this.time * 0.0025 + localIndex * 0.55);
      const offset = wave * normalized * 3.2;
      const normalX = Math.cos(angle + Math.PI / 2);
      const normalY = Math.sin(angle + Math.PI / 2);

      this.graphics.lineStyle(1, 0xf3f5ee, 0.18 + normalized * 0.22);
      this.graphics.lineBetween(
        parent.x + normalX * offset * 0.45,
        parent.y + normalY * offset * 0.45,
        segment.x + normalX * offset,
        segment.y + normalY * offset,
      );
    }
  }

  clampToBounds() {
    if (!this.bounds) {
      return;
    }

    const nextX = Phaser.Math.Clamp(this.x, this.bounds.x, this.bounds.x + this.bounds.width);
    const nextY = Phaser.Math.Clamp(this.y, this.bounds.y, this.bounds.y + this.bounds.height);

    if (nextX !== this.x || nextY !== this.y) {
      this.x = nextX;
      this.y = nextY;
      this.fSpeed *= 0.35;
    }
  }
}
