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

  update(monster) {
    this.drawFrame();
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
    const { x, y } = this.getPosition();
    const normalizedX = (monster.x - this.bounds.x) / this.bounds.width;
    const normalizedY = (monster.y - this.bounds.y) / this.bounds.height;
    const dotX = x + normalizedX * this.size;
    const dotY = y + normalizedY * this.size;

    this.graphics.fillStyle(0xf3f5ee, 1);
    this.graphics.fillCircle(dotX, dotY, 3);
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
