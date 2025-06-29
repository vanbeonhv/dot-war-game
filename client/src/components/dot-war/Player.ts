import Phaser from "phaser";
import type { PlayerData } from "./types";

export class Player {
  public data: PlayerData;
  public sprite: Phaser.GameObjects.Arc;
  public nameText: Phaser.GameObjects.Text;
  public healthBar: Phaser.GameObjects.Graphics;
  public gun: Phaser.GameObjects.Rectangle;
  private scene: Phaser.Scene;
  private glowCircle?: Phaser.GameObjects.Arc;
  private ultimateText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, data: PlayerData) {
    this.scene = scene;
    this.data = { 
      ...data, 
      score: data.score ?? 0, 
      energy: data.energy ?? 0, 
      maxEnergy: data.maxEnergy ?? 5,
      // Khởi tạo power-up properties
      speed: data.speed ?? 200,
      fireRate: data.fireRate ?? 500,
      damage: data.damage ?? 1,
      speedBoostActive: false,
      rapidFireActive: false,
      shieldActive: false,
      doubleDamageActive: false,
      shieldHits: 0
    };
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
    this.drawHealthBar();
    if (this.glowCircle) this.glowCircle.setVisible(visible && (this.data.isMain && (this.data.energy ?? 0) >= (this.data.maxEnergy ?? 5)));
    if (this.ultimateText) this.ultimateText.setVisible(visible && (this.data.isMain && (this.data.energy ?? 0) >= (this.data.maxEnergy ?? 5)));
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
    if (this.glowCircle) this.glowCircle.destroy();
    if (this.ultimateText) this.ultimateText.destroy();
  }

  drawHealthBar() {
    this.healthBar.clear();
    const barWidth = 40;
    const barHeight = 6;
    const x = this.data.x - barWidth / 2;
    const y = this.data.y - 50;
    // Background máu
    this.healthBar.fillStyle(0x333333, 1);
    this.healthBar.fillRect(x, y, barWidth, barHeight);
    // HP
    const hpPercent = Math.max(0, this.data.hp) / 3;
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(x, y, barWidth * hpPercent, barHeight);
    // Border máu
    this.healthBar.lineStyle(1, 0xffffff, 1);
    this.healthBar.strokeRect(x, y, barWidth, barHeight);
    // Energy bar (vẽ dưới thanh máu)
    const energyBarY = y + barHeight + 3;
    this.healthBar.fillStyle(0x222299, 1); // nền energy
    this.healthBar.fillRect(x, energyBarY, barWidth, barHeight - 2);
    const energyPercent = Math.max(0, this.data.energy ?? 0) / (this.data.maxEnergy ?? 5);
    this.healthBar.fillStyle(0x00cfff, 1); // màu energy
    this.healthBar.fillRect(x, energyBarY, barWidth * energyPercent, barHeight - 2);
    this.healthBar.lineStyle(1, 0xffffff, 0.7);
    this.healthBar.strokeRect(x, energyBarY, barWidth, barHeight - 2);

    // Nếu player không visible (chết/respawn) thì ẩn hiệu ứng
    if (!this.sprite.visible) {
      if (this.glowCircle) this.glowCircle.setVisible(false);
      if (this.ultimateText) this.ultimateText.setVisible(false);
      return;
    }
    // Hiệu ứng glow và popup khi đủ energy
    if (this.data.isMain && (this.data.energy ?? 0) >= (this.data.maxEnergy ?? 5)) {
      // Glow
      if (!this.glowCircle) {
        this.glowCircle = this.scene.add.circle(this.data.x, this.data.y, 28, 0xffe066, 0.4);
        this.glowCircle.setDepth(10);
        this.scene.tweens.add({
          targets: this.glowCircle,
          alpha: 0.1,
          duration: 500,
          yoyo: true,
          repeat: -1
        });
      }
      this.glowCircle.setPosition(this.data.x, this.data.y);
      this.glowCircle.setVisible(true);
      // Popup
      if (!this.ultimateText) {
        this.ultimateText = this.scene.add.text(this.data.x, this.data.y - 60, 'Ultimate Ready!', {
          font: 'bold 16px Arial',
          color: '#ffe066',
          stroke: '#000',
          strokeThickness: 3,
        }).setOrigin(0.5);
        this.ultimateText.setDepth(20);
      }
      this.ultimateText.setPosition(this.data.x, this.data.y - 60);
      this.ultimateText.setVisible(true);
    } else {
      if (this.glowCircle) this.glowCircle.setVisible(false);
      if (this.ultimateText) this.ultimateText.setVisible(false);
    }
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

  // Method để xử lý khi player bị hit (có shield)
  takeDamage(): boolean {
    // Nếu có shield active, sử dụng shield thay vì máu
    if (this.data.shieldActive && this.data.shieldHits && this.data.shieldHits > 0) {
      this.data.shieldHits--;
      console.log(`Shield absorbed damage! ${this.data.shieldHits} hits remaining`);
      
      // Hiệu ứng shield hit
      (this.sprite as any).setTint(0x70a1ff);
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          (this.sprite as any).clearTint();
        }
      });
      
      // Nếu hết shield hits, tắt shield
      if (this.data.shieldHits <= 0) {
        this.data.shieldActive = false;
        if (this.data.shieldVisual) {
          this.data.shieldVisual.destroy();
          this.data.shieldVisual = undefined;
        }
        console.log('Shield broken!');
      }
      
      return false; // Không bị mất máu
    }
    
    // Bình thường, giảm máu
    this.data.hp = Math.max(0, this.data.hp - 1);
    this.drawHealthBar();
    return true; // Bị mất máu
  }

  // Method để update shield visual position
  updateShieldPosition() {
    if (this.data.shieldVisual) {
      this.data.shieldVisual.setPosition(this.data.x, this.data.y);
    }
  }
} 