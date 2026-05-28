export class LimbSystem {
  constructor(end, length, speed, creature) {
    this.end = end;
    this.length = Math.max(1, length);
    this.creature = creature;
    this.speed = speed;
    this.nodes = [];

    creature.systems.push(this);

    let node = end;
    for (let i = 0; i < length; i += 1) {
      this.nodes.unshift(node);
      node = node.parent;

      if (!node.isSegment) {
        this.length = i + 1;
        break;
      }
    }

    this.hip = this.nodes[0].parent;
  }

  moveTo(x, y, stepScale = 1) {
    this.nodes[0].updateRelative(true, true);

    const dist = Math.hypot(x - this.end.x, y - this.end.y);
    let len = Math.max(0, dist - this.speed * stepScale);

    for (let i = this.nodes.length - 1; i >= 0; i -= 1) {
      const node = this.nodes[i];
      const angle = Math.atan2(node.y - y, node.x - x);

      node.x = x + len * Math.cos(angle);
      node.y = y + len * Math.sin(angle);
      x = node.x;
      y = node.y;
      len = node.size;
    }

    this.nodes.forEach((node) => {
      node.absAngle = Math.atan2(node.y - node.parent.y, node.x - node.parent.x);
      node.relAngle = node.absAngle - node.parent.absAngle;

      node.children.forEach((child) => {
        if (!this.nodes.includes(child)) {
          child.updateRelative(true, false);
        }
      });
    });
  }
}

export class LegSystem extends LimbSystem {
  constructor(end, length, speed, creature) {
    super(end, length, speed, creature);

    this.goalX = end.x;
    this.goalY = end.y;
    this.step = 0;
    this.forwardness = 0;
    this.seed = Math.random() * Math.PI * 2;

    this.reach = Math.max(1, Math.hypot(this.end.x - this.hip.x, this.end.y - this.hip.y) * 0.9);

    let relAngle = this.creature.absAngle - Math.atan2(this.end.y - this.hip.y, this.end.x - this.hip.x);
    relAngle -= Math.PI * 2 * Math.floor(relAngle / (Math.PI * 2) + 0.5);

    this.swing = -relAngle + (2 * (relAngle < 0) - 1) * Math.PI / 2;
    this.swingOffset = this.creature.absAngle - this.hip.absAngle;
  }

  update(stepScale = 1) {
    this.moveTo(this.goalX, this.goalY, stepScale);

    if (this.step === 0) {
      const dist = Math.hypot(this.end.x - this.goalX, this.end.y - this.goalY);

      if (dist > 1) {
        const jitter = Math.sin(this.creature.time * 0.004 + this.seed) * this.reach * 0.25;

        this.step = 1;
        this.goalX =
          this.hip.x +
          this.reach * Math.cos(this.swing + this.hip.absAngle + this.swingOffset) +
          jitter;
        this.goalY =
          this.hip.y +
          this.reach * Math.sin(this.swing + this.hip.absAngle + this.swingOffset) -
          jitter * 0.45;
      }

      return;
    }

    const theta = Math.atan2(this.end.y - this.hip.y, this.end.x - this.hip.x) - this.hip.absAngle;
    const dist = Math.hypot(this.end.x - this.hip.x, this.end.y - this.hip.y);
    const nextForwardness = dist * Math.cos(theta);
    const deltaForwardness = this.forwardness - nextForwardness;

    this.forwardness = nextForwardness;

    if (deltaForwardness * deltaForwardness < 1) {
      this.step = 0;
      this.goalX = this.end.x;
      this.goalY = this.end.y;
    }
  }
}
