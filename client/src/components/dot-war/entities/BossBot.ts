import type Phaser from 'phaser';
import type { PlayerData } from '../types/types';
import { Player } from './Player';

export class BossBot extends Player {
  private aiTimer: number = 0;
  private shootTimer: number = 0;
  private ultimateTimer: number = 0;
  private energyGainTimer: number = 0;
  private outline?: Phaser.GameObjects.Arc;
  private particleEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, data: PlayerData) {
    super(scene, {
      ...data,
      hp: data.hp ?? 20, // Boss máu cao
      name: data.name ?? 'BOSS',
      color: data.color ?? '#ff2222',
    });
    // Scale sprite lớn hơn
    this.sprite.setScale(1.7);
    this.gun.setScale(1.5, 1.3);
    this.nameText.setFontSize(22);
    this.nameText.setColor('#ff2222');
    // Hiệu ứng đặc biệt cho boss
    this.createBossEffects();
  }

  private createBossEffects() {
    // Glow đỏ
    const glow = this.scene.add.circle(this.data.x, this.data.y, 36, 0xff2222, 0.25);
    glow.setDepth(9);
    this.scene.tweens.add({
      targets: glow,
      alpha: 0.08,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
    this.sprite.on('destroy', () => glow.destroy());
    this.sprite.on('changedata', () => glow.setPosition(this.data.x, this.data.y));
    this.glowCircle = glow;

    // Outline đỏ
    this.outline = this.scene.add.circle(this.data.x, this.data.y, 24, 0xff0000, 0);
    this.outline.setStrokeStyle(3, 0xff0000);
    this.outline.setDepth(8);
    this.sprite.on('destroy', () => this.outline?.destroy());
    this.sprite.on('changedata', () => this.outline?.setPosition(this.data.x, this.data.y));

    // Particle effect
    const particles = this.scene.add.particles(0, 0, 'particle', {
      x: this.data.x,
      y: this.data.y,
      quantity: 1,
      frequency: 100,
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.5, end: 0 },
      speed: { min: 10, max: 20 },
      angle: { min: 0, max: 360 },
      tint: 0xff2222,
      lifespan: 1000,
    });
    this.particleEmitter = particles;
    this.sprite.on('destroy', () => particles.destroy());
    this.sprite.on('changedata', () => particles.setPosition(this.data.x, this.data.y));
  }

  /**
   * Gọi trong PlayerManager: boss.updateAI(mainPlayer, delta, bulletManager)
   */
  public updateAI(targetPlayer: Player, delta: number, bulletManager: any) {
    // Tự động tăng energy cho boss
    this.energyGainTimer -= delta;
    if (this.energyGainTimer <= 0) {
      const currentEnergy = this.data.energy ?? 0;
      const maxEnergy = this.data.maxEnergy ?? 5;
      if (currentEnergy < maxEnergy) {
        this.data.energy = currentEnergy + 1;
      }
      this.energyGainTimer = 2000; // Tăng 1 energy mỗi 2 giây
    }

    // Di chuyển hướng về player chính
    this.aiTimer -= delta;
    if (this.aiTimer <= 0) {
      const dx = targetPlayer.data.x - this.data.x;
      const dy = targetPlayer.data.y - this.data.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 40) {
        // Boss tiến về phía player
        const speed = 120 + Math.random() * 40;
        this.data._moveDir = { x: dx / dist, y: dy / dist };
        this.setPosition(
          this.data.x + this.data._moveDir.x * speed * (delta / 1000),
          this.data.y + this.data._moveDir.y * speed * (delta / 1000)
        );
      }
      this.aiTimer = 100 + Math.random() * 100; // update hướng mỗi 0.1-0.2s
    }

    // Ultimate skill
    this.ultimateTimer -= delta;
    const currentEnergy = this.data.energy ?? 0;
    const maxEnergy = this.data.maxEnergy ?? 5;
    if (this.ultimateTimer <= 0 && currentEnergy >= maxEnergy) {
      this.activateUltimate(targetPlayer, bulletManager);
      this.ultimateTimer = 5000 + Math.random() * 3000; // Dùng ultimate mỗi 5-8 giây
    }

    // Bắn thường về phía player chính
    this.shootTimer -= delta;
    if (this.shootTimer <= 0) {
      bulletManager.shootBotBullet(this, targetPlayer);
      this.shootTimer = 400 + Math.random() * 200; // Boss bắn nhanh hơn bot thường
    }
    // Hướng súng về phía player
    this.updateGunDirection(targetPlayer.data.x, targetPlayer.data.y);
  }

  private activateUltimate(targetPlayer: Player, bulletManager: any) {
    // Boss dùng ultimate: bắn spread shot
    this.data.energy = 0;
    this.flashGunEffect();

    // Hiệu ứng ultimate
    this.createUltimateEffect();

    const dx = targetPlayer.data.x - this.data.x;
    const dy = targetPlayer.data.y - this.data.y;
    const baseAngle = Math.atan2(dy, dx);
    const spread = Math.PI / 3; // ±60 độ
    const numBullets = 8;

    for (let i = 0; i < numBullets; i++) {
      const t = i / (numBullets - 1);
      const angle = baseAngle - spread / 2 + t * spread;
      const bulletX = this.data.x + Math.cos(angle) * 34; // PLAYER_RADIUS * 1.7
      const bulletY = this.data.y + Math.sin(angle) * 34;

      // Tạo bullet đặc biệt cho boss
      const bulletData = {
        x: bulletX,
        y: bulletY,
        dx: Math.cos(angle) * 500, // BULLET_SPEED * 1.25
        dy: Math.sin(angle) * 500,
        life: 4000, // Sống lâu hơn
        ownerId: this.data.id,
        isBossBullet: true,
      };

      // Tạo bullet với màu đặc biệt
      if (bulletManager?.createBullet) {
        const bullet = bulletManager.createBullet(bulletData);
        if (bullet?.sprite) {
          bullet.sprite.setFillStyle(0xff2222); // Màu đỏ boss
          bullet.sprite.setScale(1.5); // Bullet lớn hơn
        }
      }
    }
  }

  private createUltimateEffect() {
    // Hiệu ứng rung màn hình nhẹ
    this.scene.cameras.main.shake(200, 0.01);

    // Hiệu ứng flash
    const flash = this.scene.add.circle(this.data.x, this.data.y, 50, 0xff2222, 0.8);
    flash.setDepth(15);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      onComplete: () => flash.destroy(),
    });

    // Hiệu ứng outline nhấp nháy
    if (this.outline) {
      this.scene.tweens.add({
        targets: this.outline,
        alpha: 1,
        duration: 100,
        yoyo: true,
        repeat: 3,
      });
    }
  }

  public destroy() {
    super.destroy();
    if (this.outline) this.outline.destroy();
    if (this.particleEmitter) this.particleEmitter.destroy();
  }
}
