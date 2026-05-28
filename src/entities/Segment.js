const TAU = Math.PI * 2;

export function normalizeRelativeAngle(angle, center = 0) {
  return angle - TAU * Math.floor((angle - center) / TAU + 0.5);
}

export class Segment {
  constructor(parent, size, angle, range, stiffness) {
    this.isSegment = true;
    this.parent = parent;
    this.children = [];
    this.size = size;
    this.relAngle = angle;
    this.defAngle = angle;
    this.absAngle = parent.absAngle + angle;
    this.range = range;
    this.stiffness = stiffness;

    if (Array.isArray(parent.children)) {
      parent.children.push(this);
    }

    this.updateRelative(false, true);
  }

  updateRelative(iterate = false, flex = true) {
    this.relAngle = normalizeRelativeAngle(this.relAngle, this.defAngle);

    if (flex) {
      const min = this.defAngle - this.range / 2;
      const max = this.defAngle + this.range / 2;
      const relaxed = (this.relAngle - this.defAngle) / this.stiffness + this.defAngle;
      this.relAngle = Math.min(max, Math.max(min, relaxed));
    }

    this.absAngle = this.parent.absAngle + this.relAngle;
    this.x = this.parent.x + Math.cos(this.absAngle) * this.size;
    this.y = this.parent.y + Math.sin(this.absAngle) * this.size;

    if (iterate) {
      this.children.forEach((child) => child.updateRelative(true, flex));
    }
  }

  follow(iterate = false) {
    const dx = this.x - this.parent.x;
    const dy = this.y - this.parent.y;
    const dist = Math.max(0.0001, Math.hypot(dx, dy));

    this.x = this.parent.x + (this.size * dx) / dist;
    this.y = this.parent.y + (this.size * dy) / dist;
    this.absAngle = Math.atan2(this.y - this.parent.y, this.x - this.parent.x);
    this.relAngle = this.absAngle - this.parent.absAngle;
    this.updateRelative(false, true);

    if (iterate) {
      this.children.forEach((child) => child.follow(true));
    }
  }
}
