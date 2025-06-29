import Phaser from "phaser";
import type { PowerUpData, PowerUpType } from "./types";

export class PowerUp {
  public data: PowerUpData;
  private scene: Phaser.Scene;
  private glowEffect?: Phaser.GameObjects.Arc;
  private circle!: Phaser.GameObjects.Arc;
  private icon!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    this.scene = scene;
    this.data = { 
      id: Math.random().toString(36).substr(2, 9),
      x, 
      y, 
      type,
      spawnTime: Date.now()
    };
    
    // Tạo visual cho power-up
    this.createVisual();
  }

  private createVisual() {
    // Màu sắc và kích thước cho từng loại power-up
    const config = this.getPowerUpConfig();
    
    // Tạo circle chính
    this.circle = this.scene.add.circle(this.data.x, this.data.y, 12, config.color);
    this.circle.setStrokeStyle(2, config.borderColor);
    
    // Tạo icon hoặc text cho power-up
    this.icon = this.scene.add.text(this.data.x, this.data.y, config.icon, {
      fontSize: '16px',
      color: config.textColor,
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Thêm hiệu ứng glow (nếu có pipeline)
    if (this.circle.preFX) {
      this.circle.preFX.addGlow(config.glowColor, 4);
    }
    
    // Animation floating
    this.scene.tweens.add({
      targets: [this.circle, this.icon],
      y: '+=5',
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private getPowerUpConfig() {
    switch (this.data.type) {
      case 'health':
        return {
          color: 0xff6b6b,
          borderColor: 0xff4757,
          textColor: '#ffffff',
          glowColor: 0xff6b6b,
          icon: '❤️'
        };
      case 'energy':
        return {
          color: 0x5352ed,
          borderColor: 0x3742fa,
          textColor: '#ffffff',
          glowColor: 0x5352ed,
          icon: '⚡'
        };
      case 'speed':
        return {
          color: 0x2ed573,
          borderColor: 0x1e90ff,
          textColor: '#ffffff',
          glowColor: 0x2ed573,
          icon: '💨'
        };
      case 'rapid':
        return {
          color: 0xffa502,
          borderColor: 0xff6348,
          textColor: '#ffffff',
          glowColor: 0xffa502,
          icon: '🔥'
        };
      case 'shield':
        return {
          color: 0x70a1ff,
          borderColor: 0x5352ed,
          textColor: '#ffffff',
          glowColor: 0x70a1ff,
          icon: '🛡️'
        };
      case 'damage':
        return {
          color: 0xff4757,
          borderColor: 0xff3838,
          textColor: '#ffffff',
          glowColor: 0xff4757,
          icon: '⚔️'
        };
      default:
        return {
          color: 0xffffff,
          borderColor: 0xcccccc,
          textColor: '#000000',
          glowColor: 0xffffff,
          icon: '❓'
        };
    }
  }

  setPosition(x: number, y: number) {
    this.data.x = x;
    this.data.y = y;
    this.circle.setPosition(x, y);
    this.icon.setPosition(x, y);
    if (this.glowEffect) {
      this.glowEffect.setPosition(x, y);
    }
  }

  setVisible(visible: boolean) {
    this.circle.setVisible(visible);
    this.icon.setVisible(visible);
    if (this.glowEffect) {
      this.glowEffect.setVisible(visible);
    }
  }

  destroy() {
    this.circle.destroy();
    this.icon.destroy();
    if (this.glowEffect) {
      this.glowEffect.destroy();
    }
  }

  // Kiểm tra va chạm với player
  isCollidingWithPlayer(playerX: number, playerY: number, playerRadius: number = 20): boolean {
    const distance = Math.sqrt(
      Math.pow(this.data.x - playerX, 2) + 
      Math.pow(this.data.y - playerY, 2)
    );
    return distance < (8 + playerRadius); // 8 là radius của power-up
  }
} 