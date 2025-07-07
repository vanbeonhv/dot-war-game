import type Phaser from 'phaser';
import type { BulletData } from '../types/types';

export class Bullet {
  public data: BulletData;
  public sprite: Phaser.GameObjects.Arc;
  public trail?: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, data: BulletData) {
    this.data = data;
    // Đạn ultimate màu xanh dương, đạn thường màu vàng
    const color = data.isUltimate ? 0x00cfff : 0xffe066;
    this.sprite = scene.add.circle(data.x, data.y, 6, color, 1);
    this.sprite.setDepth(15);
    if (data.trail) {
      this.trail = scene.add.circle(data.x - (data.dx / 400) * 10, data.y - (data.dy / 400) * 10, 3, 0xffaa00, 0.5);
    }
  }

  setPosition(x: number, y: number) {
    this.data.x = x;
    this.data.y = y;
    this.sprite.setPosition(x, y);
    if (this.trail) {
      this.trail.setPosition(x - (this.data.dx / 400) * 10, y - (this.data.dy / 400) * 10);
    }
  }

  destroy() {
    this.sprite.destroy();
    if (this.trail) this.trail.destroy();
  }
}
