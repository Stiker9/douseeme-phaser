export class Door {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.isOpen = false;

    this.graphics = scene.add.graphics();
    this.graphics.setDepth(3);
    this.draw();
  }

  open() {
    this.isOpen = true;
    this.draw();
  }

  draw() {
    this.graphics.clear();

    const color = this.isOpen ? 0x73d9a6 : 0x8f9aa0;
    const alpha = this.isOpen ? 0.72 : 0.9;
    const x = this.x - 26;
    const y = this.y - 36;

    this.graphics.lineStyle(2, color, alpha);
    this.graphics.strokeRect(x, y, 52, 72);
    this.graphics.lineStyle(1, color, alpha * 0.55);
    this.graphics.strokeRect(x + 5, y + 5, 42, 62);

    if (this.isOpen) {
      this.graphics.lineStyle(2, 0x73d9a6, 0.55);
      this.graphics.lineBetween(this.x - 16, this.y, this.x + 16, this.y);
      return;
    }

    this.graphics.lineStyle(1, 0xbd5b5b, 0.82);
    this.graphics.strokeCircle(this.x, this.y, 5);
    this.graphics.lineBetween(this.x - 12, this.y, this.x + 12, this.y);
  }
}
