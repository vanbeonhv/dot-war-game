import type Phaser from 'phaser';
import { BULLET_RADIUS, BULLET_SPEED, PLAYER_RADIUS, RESPAWN_TIME } from '../constants/constants';
import { Bullet } from '../entities/Bullet';
import { createHitEffect } from '../utils/effects';
import type { GameWorld } from './GameWorld';
import type { PlayerManager } from './PlayerManager';

export class BulletManager {
  private scene: Phaser.Scene;
  private bullets: Bullet[] = [];
  private gameWorld: GameWorld;
  private playerManager: PlayerManager;

  constructor(scene: Phaser.Scene, gameWorld: GameWorld, playerManager: PlayerManager) {
    this.scene = scene;
    this.gameWorld = gameWorld;
    this.playerManager = playerManager;
  }

  public shootBullet(targetX: number, targetY: number) {
    const mainPlayer = this.playerManager.getMainPlayer();
    mainPlayer.flashGunEffect();

    const dx = targetX - mainPlayer.data.x;
    const dy = targetY - mainPlayer.data.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;

      const bulletData = {
        x: mainPlayer.data.x + normalizedDx * PLAYER_RADIUS,
        y: mainPlayer.data.y + normalizedDy * PLAYER_RADIUS,
        dx: normalizedDx * BULLET_SPEED,
        dy: normalizedDy * BULLET_SPEED,
        life: 3000,
        ownerId: mainPlayer.data.id,
        isUltimate: true,
      };

      const bullet = new Bullet(this.scene, bulletData);
      this.bullets.push(bullet);
    }
  }

  public shootUltimateBullet(targetX: number, targetY: number) {
    const mainPlayer = this.playerManager.getMainPlayer();

    // Bắn 10 viên đạn spread ±45 độ quanh hướng chuột
    const baseAngle = Math.atan2(targetY - mainPlayer.data.y, targetX - mainPlayer.data.x);
    const spread = Math.PI / 4; // ±45 độ
    const numBullets = 10;

    for (let i = 0; i < numBullets; i++) {
      const t = i / (numBullets - 1);
      const angle = baseAngle - spread / 2 + t * spread;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);

      const bulletData = {
        x: mainPlayer.data.x + dx * PLAYER_RADIUS,
        y: mainPlayer.data.y + dy * PLAYER_RADIUS,
        dx: dx * BULLET_SPEED,
        dy: dy * BULLET_SPEED,
        life: 3000,
        ownerId: mainPlayer.data.id,
        isUltimate: true,
      };

      const bullet = new Bullet(this.scene, bulletData);
      this.bullets.push(bullet);
    }
  }

  public updateBullets(
    delta: number,
    updateScore: (players: any, playerIndex: number, bulletOwnerId: string, updateLeaderboardFn: () => void) => void,
    updateLeaderboard: () => void,
    _respawnTimers: number[],
    respawnTexts: (Phaser.GameObjects.Text | null)[]
  ) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];

      // Update bullet position
      bullet.setPosition(
        bullet.data.x + bullet.data.dx * (delta / 1000),
        bullet.data.y + bullet.data.dy * (delta / 1000)
      );
      bullet.data.x = bullet.sprite.x;
      bullet.data.y = bullet.sprite.y;

      let hitPlayer = false;
      const players = this.playerManager.getPlayers();
      const respawnTimers = this.playerManager.getRespawnTimers();

      // Check collision with players
      for (let j = 0; j < players.length; j++) {
        const player = players[j];
        if (player.data.id === bullet.data.ownerId) continue; // không tự bắn mình
        if (respawnTimers[j] > 0) continue;

        const distance = Math.sqrt((bullet.data.x - player.data.x) ** 2 + (bullet.data.y - player.data.y) ** 2);
        if (distance < PLAYER_RADIUS + BULLET_RADIUS) {
          createHitEffect(this.scene.add, this.scene.tweens, player.data.x, player.data.y);

          // Sử dụng method handlePlayerHit mới
          const wasDamaged = player.takeDamage();

          if (wasDamaged && player.data.hp <= 0) {
            updateScore(players, j, bullet.data.ownerId, updateLeaderboard);

            // Phần thưởng đặc biệt khi tiêu diệt boss
            if (player.data.name === 'BOSS') {
              // Nhiều điểm hơn
              const shooter = players.find((p) => p.data.id === bullet.data.ownerId);
              if (shooter) {
                shooter.setScore(shooter.getScore() + 100); // +100 điểm thay vì +10
              }

              // Hồi máu cho player chính
              const mainPlayer = players[0];
              if (mainPlayer.data.hp < 5) {
                mainPlayer.data.hp = Math.min(5, mainPlayer.data.hp + 1);
                mainPlayer.drawHealthBar();
              }

              // Hồi energy cho player chính
              const currentEnergy = mainPlayer.data.energy ?? 0;
              const maxEnergy = mainPlayer.data.maxEnergy ?? 5;
              if (currentEnergy < maxEnergy) {
                mainPlayer.data.energy = Math.min(maxEnergy, currentEnergy + 2);
                mainPlayer.drawHealthBar();
              }

              // Hiệu ứng đặc biệt khi boss chết
              this.scene.cameras.main.shake(500, 0.02);
              const explosion = this.scene.add.circle(player.data.x, player.data.y, 60, 0xff2222, 0.8);
              explosion.setDepth(15);
              this.scene.tweens.add({
                targets: explosion,
                alpha: 0,
                scaleX: 3,
                scaleY: 3,
                duration: 800,
                onComplete: () => explosion.destroy(),
              });
            }

            // Handle player death
            player.setVisible(false);
            player.data.energy = 0;
            player.drawHealthBar();

            // Tăng energy cho người bắn nếu không tự bắn mình
            if (bullet.data.ownerId !== player.data.id) {
              const shooter = players.find((p) => p.data.id === bullet.data.ownerId);
              if (shooter && typeof shooter.data.energy === 'number' && typeof shooter.data.maxEnergy === 'number') {
                shooter.data.energy = Math.min(shooter.data.energy + 1, shooter.data.maxEnergy);
                shooter.drawHealthBar();
              }
            }

            // Set respawn timer
            respawnTimers[j] = RESPAWN_TIME;

            // Chỉ tạo respawn text cho player chính
            if (player.data.id === 'me') {
              const countdownText = this.scene.add.text(player.data.x - 30, player.data.y - 10, '3', {
                font: '24px Arial',
                color: '#ff0000',
              });
              respawnTexts[j] = countdownText;
            } else {
              // Bot và Boss - không tạo respawn text
              respawnTexts[j] = null;
            }

            // Handle main player death in survival mode
            if (player.data.id === 'me') {
              // Trigger game over event
              this.scene.events.emit('mainPlayerDeath');
            }
          }

          hitPlayer = true;
          break;
        }
      }

      // Check collision with obstacles
      if (this.gameWorld.isCollidingWithObstacle(bullet.data.x, bullet.data.y, BULLET_RADIUS)) {
        bullet.destroy();
        this.bullets.splice(i, 1);
        continue;
      }

      // Update bullet life and check boundaries
      bullet.data.life -= delta;
      if (
        hitPlayer ||
        bullet.data.life <= 0 ||
        bullet.data.x < 0 ||
        bullet.data.x > 800 ||
        bullet.data.y < 0 ||
        bullet.data.y > 600
      ) {
        bullet.destroy();
        this.bullets.splice(i, 1);
      }
    }
  }

  public shootBotBullet(bot: any, target: any) {
    bot.flashGunEffect();
    const dx = target.data.x - bot.data.x;
    const dy = target.data.y - bot.data.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      const bulletData = {
        x: bot.data.x + normalizedDx * 20, // PLAYER_RADIUS
        y: bot.data.y + normalizedDy * 20, // PLAYER_RADIUS
        dx: normalizedDx * BULLET_SPEED,
        dy: normalizedDy * BULLET_SPEED,
        life: 3000,
        ownerId: bot.data.id,
      };
      const bullet = new Bullet(this.scene, bulletData);
      this.bullets.push(bullet);
    }
  }

  public getBullets(): Bullet[] {
    return this.bullets;
  }

  public destroy() {
    this.bullets.forEach((bullet) => bullet.destroy());
    this.bullets = [];
  }
}
