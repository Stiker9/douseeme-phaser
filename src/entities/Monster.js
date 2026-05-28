import Phaser from 'phaser';
import { LegSystem } from './LimbSystem.js';
import { Segment, normalizeRelativeAngle } from './Segment.js';

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
    this.tailSegments = [];
    this.time = 0;
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
    this.time += this.scene.game.loop.delta;
    this.follow(targetX, targetY, Math.min(stepScale, 2.5));
    this.draw();
    this.followTarget.setPosition(this.x, this.y);
  }

  setSprinting(isSprinting) {
    this.isSprinting = isSprinting;
  }

  setFrozen(isFrozen) {
    this.isFrozen = isFrozen;
  }

  follow(targetX, targetY, stepScale) {
    if (this.isFrozen) {
      this.fSpeed = 0;
      this.rSpeed = 0;
      this.animateFrozenTail();
      return;
    }

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
    this.drawHead();
    this.children.forEach((child) => this.drawSegmentTree(child));
  }

  drawHead() {
    const radius = 5;
    const start = Math.PI / 4 + this.absAngle;
    const end = (Math.PI * 7) / 4 + this.absAngle;

    this.graphics.beginPath();
    this.graphics.arc(this.x, this.y, radius, start, end, false);
    this.graphics.lineTo(
      this.x + radius * Math.cos(this.absAngle) * Math.SQRT2,
      this.y + radius * Math.sin(this.absAngle) * Math.SQRT2,
    );
    this.graphics.lineTo(this.x + radius * Math.cos(start), this.y + radius * Math.sin(start));
    this.graphics.strokePath();
  }

  drawSegmentTree(segment) {
    const depthAlpha = Phaser.Math.Clamp(1 - this.distanceFromHead(segment) / 580, 0.28, 0.95);

    this.graphics.lineStyle(1, 0xf3f5ee, depthAlpha);
    this.graphics.lineBetween(segment.parent.x, segment.parent.y, segment.x, segment.y);

    segment.children.forEach((child) => this.drawSegmentTree(child));
  }

  distanceFromHead(segment) {
    return Math.hypot(segment.x - this.x, segment.y - this.y);
  }

  animateFrozenTail() {
    const animatedCount = Math.max(1, Math.floor(this.tailSegments.length * 0.3));
    const startIndex = this.tailSegments.length - animatedCount;
    const firstAnimated = this.tailSegments[startIndex];

    for (let i = startIndex; i < this.tailSegments.length; i += 1) {
      const segment = this.tailSegments[i];
      const localIndex = i - startIndex;
      const normalized = localIndex / Math.max(1, animatedCount - 1);
      const wave = Math.sin(this.time * 0.0025 + localIndex * 0.55);
      const amplitude = 0.015 + normalized * 0.045;

      segment.relAngle = segment.defAngle + wave * amplitude;
    }

    firstAnimated.updateRelative(true, false);
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
