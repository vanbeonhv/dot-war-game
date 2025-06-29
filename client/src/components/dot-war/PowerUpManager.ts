import Phaser from 'phaser';
import { PowerUp } from './PowerUp';
import type { PowerUpData, PowerUpType } from './types';

export class PowerUpManager {
  private scene: Phaser.Scene;
  private powerUps: PowerUp[] = [];
  private spawnTimer: number = 0;
  private maxPowerUps: number = 8;
  private spawnInterval: number = 3000; // 3 giây
  private autoDestroyTime: number = 10000; // 10 giây
  private isCollidingObstacle?: (x: number, y: number, radius: number) => boolean;

  constructor(scene: Phaser.Scene, isCollidingObstacle?: (x: number, y: number, radius: number) => boolean) {
    this.scene = scene;
    this.isCollidingObstacle = isCollidingObstacle;
  }

  update(time: number, delta: number) {
    // Spawn power-up mới
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval && this.powerUps.length < this.maxPowerUps) {
      this.spawnRandomPowerUp();
      this.spawnTimer = 0;
    }

    // Auto destroy power-up cũ
    this.cleanupExpiredPowerUps(time);
  }

  private spawnRandomPowerUp() {
    const types: PowerUpType[] = ['health', 'energy', 'speed', 'rapid', 'shield', 'damage'];
    const randomType = types[Math.floor(Math.random() * types.length)];

    // Tìm vị trí spawn an toàn (không trên obstacle)
    const position = this.getSafeSpawnPosition();
    if (!position) return; // Không tìm được vị trí an toàn

    const powerUp = new PowerUp(this.scene, position.x, position.y, randomType);
    this.powerUps.push(powerUp);
  }

  private getSafeSpawnPosition() {
    const maxTries = 50;
    for (let i = 0; i < maxTries; i++) {
      const x = 50 + Math.random() * 700; // Tránh viền map
      const y = 50 + Math.random() * 500;

      // Kiểm tra không va chạm obstacle (nếu có method này)
      if (!this.isCollidingObstacle || !this.isCollidingObstacle(x, y, 8)) {
        return { x, y };
      }
    }
    return null;
  }

  private cleanupExpiredPowerUps(currentTime: number) {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      const timeSinceSpawn = currentTime - powerUp.data.spawnTime;

      if (timeSinceSpawn >= this.autoDestroyTime) {
        powerUp.destroy();
        this.powerUps.splice(i, 1);
      }
    }
  }

  // Kiểm tra va chạm với player và xử lý collection
  checkPlayerCollision(playerX: number, playerY: number, playerRadius: number = 20) {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];

      if (powerUp.isCollidingWithPlayer(playerX, playerY, playerRadius)) {
        // Tạo hiệu ứng khi nhặt
        this.createCollectionEffect(powerUp.data.x, powerUp.data.y, powerUp.data.type);

        // Xử lý effect theo type
        this.applyPowerUpEffect(powerUp.data);

        // Xóa power-up
        powerUp.destroy();
        this.powerUps.splice(i, 1);

        return powerUp.data; // Trả về data để scene xử lý thêm
      }
    }
    return null;
  }

  private createCollectionEffect(x: number, y: number, type: PowerUpType) {
    // Particle effect khi nhặt power-up
    const { color } = this.getPowerUpConfig(type);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = this.scene.add.circle(x + Math.cos(angle) * 10, y + Math.sin(angle) * 10, 3, color, 1);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 30,
        y: y + Math.sin(angle) * 30,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  private getPowerUpConfig(type: PowerUpType) {
    const configs = {
      health: { color: 0xff0000 },
      energy: { color: 0xffe066 },
      speed: { color: 0x00cfff },
      rapid: { color: 0xff6600 },
      shield: { color: 0x00ff00 },
      damage: { color: 0xff0066 }
    };
    return configs[type];
  }

  private applyPowerUpEffect(powerUpData: PowerUpData) {
    // Logic này sẽ được xử lý trong GameScene để áp dụng effect cho player
    // PowerUpManager chỉ quản lý spawn và collection
    console.log(`Power-up collected: ${powerUpData.type}`);
  }

  destroy() {
    this.powerUps.forEach((powerUp) => powerUp.destroy());
    this.powerUps = [];
  }
}
