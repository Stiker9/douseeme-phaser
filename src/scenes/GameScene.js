import Phaser from 'phaser';
import { Monster } from '../entities/Monster.js';
import { worldBounds, WORLD_HEIGHT, WORLD_WIDTH } from '../data/worldConfig.js';
import { Minimap } from '../ui/Minimap.js';
import { SpaceSample } from '../audio/SpaceSample.js';
import { ShiftSample } from '../audio/ShiftSample.js';
import { AmbientSound } from '../audio/AmbientSound.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.audio('ambient-sound', '/Sample/ambient.wav');
    this.load.audio('space-sample', '/Sample/space.wav');
    this.load.audio('shift-sample', '/Sample/shift.wav');
  }

  create() {
    this.cameras.main.setBackgroundColor('#020308');
    this.cameras.main.setBounds(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height);

    this.createMapBackground();

    this.monster = new Monster(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2, worldBounds);
    this.minimap = new Minimap(this, worldBounds);
    this.ambientSound = new AmbientSound(this);
    this.spaceSample = new SpaceSample(this);
    this.shiftSample = new ShiftSample(this);
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cameras.main.startFollow(this.monster.followTarget, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);
    this.ambientSound.play();
  }

  update(_time, delta) {
    const pointer = this.input.activePointer;
    const target = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.spaceSample.play();
    }

    if (Phaser.Input.Keyboard.JustUp(this.spaceKey)) {
      this.spaceSample.fadeOutAndStop();
    }

    this.monster.setFrozen(this.spaceKey.isDown);
    this.monster.setSprinting(this.shiftKey.isDown);
    this.shiftSample.setActive(this.shiftKey.isDown && !this.spaceKey.isDown);
    this.monster.update(delta / 16.6667, target.x, target.y);
    this.minimap.update(this.monster);
  }

  createMapBackground() {
    const background = this.add.graphics();
    background.setDepth(-20);
    background.fillStyle(0x020308, 1);
    background.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    background.lineStyle(1, 0x16202c, 0.18);
    for (let x = 0; x <= WORLD_WIDTH; x += 160) {
      background.lineBetween(x, 0, x, WORLD_HEIGHT);
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += 160) {
      background.lineBetween(0, y, WORLD_WIDTH, y);
    }

    background.lineStyle(2, 0x56606b, 0.28);
    background.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  }
}
