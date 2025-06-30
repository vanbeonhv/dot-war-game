import type Phaser from 'phaser';
import { Bullet } from '../Bullet';
import { BULLET_SPEED, PLAYER_RADIUS } from '../constants';
import type { Player } from '../Player';
import type { BulletData } from '../types';

export function shootBotBullet(bullets: any[], bot: Player, target: Player, scene: Phaser.Scene) {
  bot.flashGunEffect();
  const dx = target.data.x - bot.data.x;
  const dy = target.data.y - bot.data.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > 0) {
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;
    const bulletData: BulletData = {
      x: bot.data.x + normalizedDx * PLAYER_RADIUS,
      y: bot.data.y + normalizedDy * PLAYER_RADIUS,
      dx: normalizedDx * BULLET_SPEED,
      dy: normalizedDy * BULLET_SPEED,
      life: 3000,
      ownerId: bot.data.id,
    };
    const bullet = new Bullet(scene, bulletData);
    bullets.push(bullet);
  }
}
