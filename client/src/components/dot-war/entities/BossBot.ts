import type Phaser from 'phaser';
import type { PlayerData } from '../types/types';
import { Bullet } from './Bullet';
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
    if (
      this.ultimateTimer <= 0 &&
      currentEnergy >= maxEnergy &&
      bulletManager &&
      typeof bulletManager.getBullets === 'function'
    ) {
      this.activateUltimate(targetPlayer, bulletManager);
      this.ultimateTimer = 5000 + Math.random() * 3000; // Dùng ultimate mỗi 5-8 giây
    }

    // Bắn thường về phía player chính
    this.shootTimer -= delta;
    if (this.shootTimer <= 0 && bulletManager && typeof bulletManager.shootBotBullet === 'function') {
      // Lấy current wave từ bulletManager (nếu có)
      const currentWave = bulletManager.playerManager?.getCurrentWave?.() || 1;

      // Chỉ áp dụng pattern mới từ wave 5 trở đi
      if (currentWave >= 5) {
        // Boss có nhiều pattern bắn đạn khác nhau
        const pattern = Math.floor(Math.random() * 5); // 0-4: 5 pattern khác nhau

        switch (pattern) {
          case 0: // Pattern 1: Bắn thẳng với độ lệch lớn
            this.shootBossStraight(targetPlayer, bulletManager, Math.PI / 3); // ±30 độ
            break;
          case 1: // Pattern 2: Bắn 4 viên spread
            this.shootBossSpread(targetPlayer, bulletManager, 4, Math.PI / 2); // 4 viên ±45 độ
            break;
          case 2: // Pattern 3: Bắn 3 viên song song
            this.shootBossParallel(targetPlayer, bulletManager, 3);
            break;
          case 3: // Pattern 4: Bắn với độ lệch ngẫu nhiên
            this.shootBossRandom(targetPlayer, bulletManager);
            break;
          case 4: // Pattern 5: Bắn 2 viên với tốc độ khác nhau
            this.shootBossDualSpeed(targetPlayer, bulletManager);
            break;
        }
      } else {
        // Wave 1-4: Boss bắn đơn giản với độ lệch nhỏ
        const dx = targetPlayer.data.x - this.data.x;
        const dy = targetPlayer.data.y - this.data.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
          const normalizedDx = dx / distance;
          const normalizedDy = dy / distance;

          const baseAngle = Math.atan2(normalizedDy, normalizedDx);
          const randomSpread = ((Math.random() - 0.5) * Math.PI) / 8; // ±11 độ (nhỏ hơn)
          const finalAngle = baseAngle + randomSpread;

          const finalDx = Math.cos(finalAngle);
          const finalDy = Math.sin(finalAngle);

          const bulletData = {
            x: this.data.x + finalDx * 34,
            y: this.data.y + finalDy * 34,
            dx: finalDx * 400,
            dy: finalDy * 400,
            life: 3000,
            ownerId: this.data.id,
            isBossBullet: true,
          };

          const bullet = new Bullet(this.scene, bulletData);
          if (bullet?.sprite) {
            bullet.sprite.setFillStyle(0xff2222);
            bullet.sprite.setScale(1.3);
          }

          // Kiểm tra bulletManager trước khi gọi getBullets
          if (bulletManager && typeof bulletManager.getBullets === 'function') {
            bulletManager.getBullets().push(bullet);
          }
        }
      }

      this.shootTimer = 400 + Math.random() * 200; // Boss bắn nhanh hơn bot thường
    }
    // Hướng súng về phía player
    this.updateGunDirection(targetPlayer.data.x, targetPlayer.data.y);
  }

  private activateUltimate(targetPlayer: Player, bulletManager: any) {
    // Boss dùng ultimate: bắn spread shot với độ lệch ngẫu nhiên
    this.data.energy = 0;
    this.flashGunEffect();

    // Hiệu ứng ultimate
    this.createUltimateEffect();

    const dx = targetPlayer.data.x - this.data.x;
    const dy = targetPlayer.data.y - this.data.y;
    const baseAngle = Math.atan2(dy, dx);
    const spread = Math.PI / 2; // ±90 độ (tăng spread)
    const numBullets = 10; // Tăng số đạn

    for (let i = 0; i < numBullets; i++) {
      const t = i / (numBullets - 1);
      const angle = baseAngle - spread / 2 + t * spread;

      // Thêm độ lệch ngẫu nhiên cho từng đạn
      const randomSpread = ((Math.random() - 0.5) * Math.PI) / 6; // ±15 độ
      const finalAngle = angle + randomSpread;

      const bulletX = this.data.x + Math.cos(finalAngle) * 34; // PLAYER_RADIUS * 1.7
      const bulletY = this.data.y + Math.sin(finalAngle) * 34;

      // Tạo bullet đặc biệt cho boss
      const bulletData = {
        x: bulletX,
        y: bulletY,
        dx: Math.cos(finalAngle) * 500, // BULLET_SPEED * 1.25
        dy: Math.sin(finalAngle) * 500,
        life: 4000, // Sống lâu hơn
        ownerId: this.data.id,
        isBossBullet: true,
      };

      // Tạo bullet trực tiếp
      const bullet = new Bullet(this.scene, bulletData);
      if (bullet?.sprite) {
        bullet.sprite.setFillStyle(0xff2222); // Màu đỏ boss
        bullet.sprite.setScale(1.5); // Bullet lớn hơn
      }

      // Thêm vào bulletManager
      bulletManager.getBullets().push(bullet);
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

  // Các method bắn đạn cho boss
  private shootBossStraight(targetPlayer: Player, bulletManager: any, spread: number) {
    const dx = targetPlayer.data.x - this.data.x;
    const dy = targetPlayer.data.y - this.data.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;

      const baseAngle = Math.atan2(normalizedDy, normalizedDx);
      const randomSpread = (Math.random() - 0.5) * spread;
      const finalAngle = baseAngle + randomSpread;

      const finalDx = Math.cos(finalAngle);
      const finalDy = Math.sin(finalAngle);

      const bulletData = {
        x: this.data.x + finalDx * 34,
        y: this.data.y + finalDy * 34,
        dx: finalDx * 400,
        dy: finalDy * 400,
        life: 3000,
        ownerId: this.data.id,
        isBossBullet: true,
      };

      const bullet = new Bullet(this.scene, bulletData);
      if (bullet?.sprite) {
        bullet.sprite.setFillStyle(0xff2222);
        bullet.sprite.setScale(1.3);
      }
      // Kiểm tra bulletManager trước khi gọi getBullets
      if (bulletManager && typeof bulletManager.getBullets === 'function') {
        bulletManager.getBullets().push(bullet);
      }
    }
  }

  private shootBossSpread(targetPlayer: Player, bulletManager: any, numBullets: number, spread: number) {
    const dx = targetPlayer.data.x - this.data.x;
    const dy = targetPlayer.data.y - this.data.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      const baseAngle = Math.atan2(normalizedDy, normalizedDx);

      for (let i = 0; i < numBullets; i++) {
        const t = i / (numBullets - 1);
        const angle = baseAngle - spread / 2 + t * spread;

        const bulletData = {
          x: this.data.x + Math.cos(angle) * 34,
          y: this.data.y + Math.sin(angle) * 34,
          dx: Math.cos(angle) * 400,
          dy: Math.sin(angle) * 400,
          life: 3000,
          ownerId: this.data.id,
          isBossBullet: true,
        };

        const bullet = new Bullet(this.scene, bulletData);
        if (bullet?.sprite) {
          bullet.sprite.setFillStyle(0xff2222);
          bullet.sprite.setScale(1.3);
        }
        // Kiểm tra bulletManager trước khi gọi getBullets
        if (bulletManager && typeof bulletManager.getBullets === 'function') {
          bulletManager.getBullets().push(bullet);
        }
      }
    }
  }

  private shootBossParallel(targetPlayer: Player, bulletManager: any, numBullets: number) {
    const dx = targetPlayer.data.x - this.data.x;
    const dy = targetPlayer.data.y - this.data.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      const baseAngle = Math.atan2(normalizedDy, normalizedDx);
      const offset = Math.PI / 8; // 22.5 độ

      for (let i = 0; i < numBullets; i++) {
        const angle = baseAngle - offset + (i * offset * 2) / (numBullets - 1);

        const bulletData = {
          x: this.data.x + Math.cos(angle) * 34,
          y: this.data.y + Math.sin(angle) * 34,
          dx: Math.cos(angle) * 400,
          dy: Math.sin(angle) * 400,
          life: 3000,
          ownerId: this.data.id,
          isBossBullet: true,
        };

        const bullet = new Bullet(this.scene, bulletData);
        if (bullet?.sprite) {
          bullet.sprite.setFillStyle(0xff2222);
          bullet.sprite.setScale(1.3);
        }
        // Kiểm tra bulletManager trước khi gọi getBullets
        if (bulletManager && typeof bulletManager.getBullets === 'function') {
          bulletManager.getBullets().push(bullet);
        }
      }
    }
  }

  private shootBossRandom(_targetPlayer: Player, bulletManager: any) {
    // Bắn 2 viên với hướng hoàn toàn ngẫu nhiên
    for (let i = 0; i < 2; i++) {
      const randomAngle = Math.random() * Math.PI * 2;

      const bulletData = {
        x: this.data.x + Math.cos(randomAngle) * 34,
        y: this.data.y + Math.sin(randomAngle) * 34,
        dx: Math.cos(randomAngle) * 400,
        dy: Math.sin(randomAngle) * 400,
        life: 3000,
        ownerId: this.data.id,
        isBossBullet: true,
      };

      const bullet = new Bullet(this.scene, bulletData);
      if (bullet?.sprite) {
        bullet.sprite.setFillStyle(0xff2222);
        bullet.sprite.setScale(1.3);
      }
      // Kiểm tra bulletManager trước khi gọi getBullets
      if (bulletManager && typeof bulletManager.getBullets === 'function') {
        bulletManager.getBullets().push(bullet);
      }
    }
  }

  private shootBossDualSpeed(targetPlayer: Player, bulletManager: any) {
    const dx = targetPlayer.data.x - this.data.x;
    const dy = targetPlayer.data.y - this.data.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      const _baseAngle = Math.atan2(normalizedDy, normalizedDx);

      // Bắn 2 viên với tốc độ khác nhau
      const speeds = [300, 500]; // Chậm và nhanh

      speeds.forEach((speed) => {
        const bulletData = {
          x: this.data.x + normalizedDx * 34,
          y: this.data.y + normalizedDy * 34,
          dx: normalizedDx * speed,
          dy: normalizedDy * speed,
          life: 3000,
          ownerId: this.data.id,
          isBossBullet: true,
        };

        const bullet = new Bullet(this.scene, bulletData);
        if (bullet?.sprite) {
          bullet.sprite.setFillStyle(0xff2222);
          bullet.sprite.setScale(1.3);
        }
        // Kiểm tra bulletManager trước khi gọi getBullets
        if (bulletManager && typeof bulletManager.getBullets === 'function') {
          bulletManager.getBullets().push(bullet);
        }
      });
    }
  }

  public destroy() {
    super.destroy();
    if (this.outline) this.outline.destroy();
    if (this.particleEmitter) this.particleEmitter.destroy();
  }

  override drawHealthBar() {
    this.healthBar.clear();
    const barWidth = 50; // Ngắn lại, vừa với boss
    const barHeight = 10;
    const x = this.data.x - barWidth / 2;
    const y = this.data.y - 60;
    // Background máu
    this.healthBar.fillStyle(0x333333, 1);
    this.healthBar.fillRect(x, y, barWidth, barHeight);
    // HP
    const hpPercent = Math.max(0, this.data.hp) / (this.data.maxHp ?? 20);
    this.healthBar.fillStyle(0xff2222, 1);
    this.healthBar.fillRect(x, y, barWidth * hpPercent, barHeight);
    // Border máu
    this.healthBar.lineStyle(2, 0xffffff, 1);
    this.healthBar.strokeRect(x, y, barWidth, barHeight);
    // Đảm bảo thanh máu không bị scale theo boss
    this.healthBar.setScale(1, 1);
  }

  override setPosition(x: number, y: number) {
    super.setPosition(x, y);
    if (this.outline) {
      this.outline.setPosition(x, y);
    }
  }
}
