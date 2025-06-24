import Phaser from "phaser";
import type { PlayerData } from "./types";

export class Player {
  public data: PlayerData;
  public sprite: Phaser.GameObjects.Arc;
  public nameText: Phaser.GameObjects.Text;
  public healthBar: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, data: PlayerData) {
    this.scene = scene;
    this.data = data;
    this.sprite = scene.add.circle(data.x, data.y, 20, Phaser.Display.Color.HexStringToColor(data.color).color);
    this.nameText = scene.add.text(data.x - 18, data.y - 35, data.isMain ? "You" : data.id, {
      font: "16px Arial",
      color: "#fff",
    });
    this.healthBar = scene.add.graphics();
    this.drawHealthBar();
  }

  setPosition(x: number, y: number) {
    this.data.x = x;
    this.data.y = y;
    this.sprite.setPosition(x, y);
    this.nameText.setPosition(x - 18, y - 35);
    this.drawHealthBar();
  }

  setVisible(visible: boolean) {
    this.sprite.setVisible(visible);
    this.nameText.setVisible(visible);
    this.healthBar.setVisible(visible);
  }

  setAlpha(alpha: number) {
    this.sprite.setAlpha(alpha);
    this.nameText.setAlpha(alpha);
    this.healthBar.setAlpha(alpha);
  }

  destroy() {
    this.sprite.destroy();
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
} 