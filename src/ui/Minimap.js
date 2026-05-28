const MINIMAP_SIZE = 144;
const MINIMAP_MARGIN = 24;

export class Minimap {
  constructor(scene, bounds) {
    this.scene = scene;
    this.bounds = bounds;
    this.size = MINIMAP_SIZE;
    this.margin = MINIMAP_MARGIN;

    this.graphics = scene.add.graphics();
    this.graphics.setScrollFactor(0);
    this.graphics.setDepth(1000);

    scene.scale.on('resize', () => this.drawFrame());
    this.drawFrame();
  }

  update(monster, bot = null, key = null, door = null) {
    this.drawFrame();
    if (door) {
      this.drawDoor(door);
    }
    if (key && !key.isCollected) {
      this.drawKey(key);
    }
    if (bot) {
      this.drawBot(bot);
    }
    this.drawMonster(monster);
  }

  drawFrame() {
    const { x, y } = this.getPosition();

    this.graphics.clear();
    this.graphics.fillStyle(0x03060b, 0.78);
    this.graphics.fillRect(x, y, this.size, this.size);

    this.graphics.lineStyle(1, 0xd8dedc, 0.7);
    this.graphics.strokeRect(x, y, this.size, this.size);
    this.graphics.lineStyle(1, 0x707982, 0.45);
    this.graphics.strokeRect(x + 5, y + 5, this.size - 10, this.size - 10);
  }

  drawMonster(monster) {
    const { dotX, dotY } = this.getWorldDot(monster);

    this.graphics.fillStyle(0xf3f5ee, 1);
    this.graphics.fillCircle(dotX, dotY, 3);
  }

  drawBot(bot) {
    const { dotX, dotY } = this.getWorldDot(bot);

    this.graphics.fillStyle(0x9dd6c4, 1);
    this.graphics.fillCircle(dotX, dotY, 2.5);
  }

  drawKey(key) {
    const { dotX, dotY } = this.getWorldDot(key);

    this.graphics.fillStyle(0xd8c36d, 1);
    this.graphics.fillCircle(dotX, dotY, 2);
  }

  drawDoor(door) {
    const { dotX, dotY } = this.getWorldDot(door);

    this.graphics.fillStyle(door.isOpen ? 0x73d9a6 : 0x8f9aa0, 1);
    this.graphics.fillRect(dotX - 2, dotY - 2, 4, 4);
  }

  getWorldDot(entity) {
    const { x, y } = this.getPosition();
    const normalizedX = (entity.x - this.bounds.x) / this.bounds.width;
    const normalizedY = (entity.y - this.bounds.y) / this.bounds.height;
    const dotX = x + normalizedX * this.size;
    const dotY = y + normalizedY * this.size;

    return { dotX, dotY };
  }

  getPosition() {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    return {
      x: width - this.size - this.margin,
      y: height - this.size - this.margin,
    };
  }
}
