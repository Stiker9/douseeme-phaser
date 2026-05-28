import Phaser from 'phaser';
import { Bot } from '../entities/Bot.js';
import { Door } from '../entities/Door.js';
import { Key } from '../entities/Key.js';
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

  create() {
    this.cameras.main.setBackgroundColor('#020308');
    this.cameras.main.setBounds(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height);

    this.createMapBackground();

    this.monster = new Monster(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2, worldBounds);
    this.bot = new Bot(this, WORLD_WIDTH / 2 + 380, WORLD_HEIGHT / 2 - 260, worldBounds);
    this.createObjectives();
    this.minimap = new Minimap(this, worldBounds);
    this.ambientSound = new AmbientSound();
    this.spaceSample = new SpaceSample();
    this.shiftSample = new ShiftSample();
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cameras.main.startFollow(this.monster.followTarget, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);
    this.ambientSound.play();
  }

  update(_time, delta) {
    try {
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
      this.bot.update(delta / 16.6667);
      this.updateObjectives();
      this.minimap.update(this.monster, this.bot, this.key, this.door);
    } catch (error) {
      this.showRuntimeError(error);
      this.scene.pause();
    }
  }

  showRuntimeError(error) {
    const message = error && error.stack ? error.stack : String(error);

    document.body.innerHTML = `<pre style="margin:0;padding:24px;color:#f3f5ee;background:#020308;white-space:pre-wrap;font:14px/1.5 Consolas,monospace;">Game loop error:\n${message}</pre>`;
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

  createObjectives() {
    const margin = 420;
    const keyX = Phaser.Math.Between(margin, WORLD_WIDTH - margin);
    const keyY = Phaser.Math.Between(margin, WORLD_HEIGHT - margin);
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const distance = Phaser.Math.Between(120, 220);
    const doorX = Phaser.Math.Clamp(keyX + Math.cos(angle) * distance, margin, WORLD_WIDTH - margin);
    const doorY = Phaser.Math.Clamp(keyY + Math.sin(angle) * distance, margin, WORLD_HEIGHT - margin);

    this.key = new Key(this, keyX, keyY);
    this.door = new Door(this, doorX, doorY);
    this.bot.setObjectiveTarget(this.key.x, this.key.y);
  }

  updateObjectives() {
    if (!this.bot.hasKey && !this.key.isCollected && Phaser.Math.Distance.Between(this.bot.x, this.bot.y, this.key.x, this.key.y) < 44) {
      this.key.collect();
      this.bot.hasKey = true;
      this.bot.setObjectiveTarget(this.door.x, this.door.y);
    }

    if (this.bot.hasKey && !this.door.isOpen && Phaser.Math.Distance.Between(this.bot.x, this.bot.y, this.door.x, this.door.y) < 58) {
      this.door.open();
      this.bot.clearObjectiveTarget();
    }
  }
}
