export class Key {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.isCollected = false;

    this.graphics = scene.add.graphics();
    this.graphics.setDepth(4);
    this.draw();
  }

  collect() {
    this.isCollected = true;
    this.graphics.clear();
  }

  draw() {
    if (this.isCollected) {
      return;
    }

    this.graphics.clear();
    this.graphics.lineStyle(2, 0xd8c36d, 0.95);
    this.graphics.strokeCircle(this.x, this.y, 7);
    this.graphics.lineBetween(this.x + 6, this.y, this.x + 24, this.y);
    this.graphics.lineBetween(this.x + 17, this.y, this.x + 17, this.y + 6);
    this.graphics.lineBetween(this.x + 23, this.y, this.x + 23, this.y + 5);
    this.graphics.lineStyle(1, 0xfff0a8, 0.55);
    this.graphics.strokeCircle(this.x, this.y, 3);
  }
}
