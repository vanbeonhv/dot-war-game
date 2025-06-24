import Phaser from "phaser";
import type { PlayerData } from "./types";

export class Player {
  public data: PlayerData;
  public sprite: Phaser.GameObjects.Arc;
  public nameText: Phaser.GameObjects.Text;
  public healthBar: Phaser.GameObjects.Graphics;
  public gun: Phaser.GameObjects.Rectangle;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, data: PlayerData) {
    this.scene = scene;
    this.data = { ...data, score: data.score ?? 0 };
    this.sprite = scene.add.circle(data.x, data.y, 20, Phaser.Display.Color.HexStringToColor(data.color).color);
    this.gun = scene.add.rectangle(data.x, data.y, 24, 6, 0xffffff, 1);
    this.gun.setOrigin(-0.1, 0.5); // Đầu mũi súng nhô ra ngoài
    this.nameText = scene.add.text(data.x - 18, data.y - 35, data.name || (data.isMain ? "You" : data.id), {
      font: "16px Arial",
      color: "#fff",
    });
    this.healthBar = scene.add.graphics();
    this.drawHealthBar();
  }

  getScore() {
    return this.data.score;
  }

  setScore(score: number) {
    this.data.score = score;
  }

  updateGunDirection(targetX: number, targetY: number) {
    const dx = targetX - this.data.x;
    const dy = targetY - this.data.y;
    const angle = Math.atan2(dy, dx);
    this.gun.setRotation(angle);
    this.gun.setPosition(this.data.x, this.data.y);
  }

  setPosition(x: number, y: number) {
    this.data.x = x;
    this.data.y = y;
    this.sprite.setPosition(x, y);
    this.gun.setPosition(x, y);
    this.nameText.setPosition(x - 18, y - 35);
    this.drawHealthBar();
  }

  setVisible(visible: boolean) {
    this.sprite.setVisible(visible);
    this.gun.setVisible(visible);
    this.nameText.setVisible(visible);
    this.healthBar.setVisible(visible);
  }

  setAlpha(alpha: number) {
    this.sprite.setAlpha(alpha);
    this.gun.setAlpha(alpha);
    this.nameText.setAlpha(alpha);
    this.healthBar.setAlpha(alpha);
  }

  destroy() {
    this.sprite.destroy();
    this.gun.destroy();
    this.nameText.destroy();
    this.healthBar.destroy();
  }

  drawHealthBar() {
    this.healthBar.clear();
    const barWidth = 40;
    const barHeight = 6;
    const x = this.data.x - barWidth / 2;
    const y = this.data.y - 50;
    // Background
    this.healthBar.fillStyle(0x333333, 1);
    this.healthBar.fillRect(x, y, barWidth, barHeight);
    // HP
    const hpPercent = Math.max(0, this.data.hp) / 3;
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(x, y, barWidth * hpPercent, barHeight);
    // Border
    this.healthBar.lineStyle(1, 0xffffff, 1);
    this.healthBar.strokeRect(x, y, barWidth, barHeight);
  }

  flashGunEffect() {
    const angle = this.gun.rotation;
    const fx = this.data.x + Math.cos(angle) * 20;
    const fy = this.data.y + Math.sin(angle) * 20;
    const flash = this.scene.add.circle(fx, fy, 7, 0xffffcc, 0.9);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 120,
      onComplete: () => flash.destroy(),
    });
  }
} 