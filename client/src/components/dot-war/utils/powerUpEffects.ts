import { PLAYER_RADIUS } from '../constants/constants';
import type { Player } from '../entities/Player';
import type { PowerUpData } from '../types/types';

export function applyPowerUpEffect(
  mainPlayer: Player,
  powerUpData: PowerUpData,
  sceneAdd: Phaser.GameObjects.GameObjectFactory,
  tweens: Phaser.Tweens.TweenManager,
  time: Phaser.Time.Clock,
  cursors: any,
  aKey: any,
  dKey: any,
  wKey: any,
  sKey: any
) {
  switch (powerUpData.type) {
    case 'health':
      if (mainPlayer.data.hp < (mainPlayer.data.maxHp ?? 5)) {
        mainPlayer.data.hp = Math.min(mainPlayer.data.hp + 1, mainPlayer.data.maxHp ?? 5);
        mainPlayer.drawHealthBar();
        console.log('Health Pack collected: +1 HP');
      }
      break;
    case 'energy':
      if (typeof mainPlayer.data.energy === 'number' && typeof mainPlayer.data.maxEnergy === 'number') {
        mainPlayer.data.energy = Math.min(mainPlayer.data.energy + 2, mainPlayer.data.maxEnergy);
        mainPlayer.drawHealthBar();
        console.log('Energy Orb collected: +2 Energy');
      }
      break;
    case 'speed':
      if (!mainPlayer.data.speedBoostActive) {
        mainPlayer.data.speedBoostActive = true;
        mainPlayer.data.originalSpeed = mainPlayer.data.speed || 200;
        mainPlayer.data.speed = mainPlayer.data.originalSpeed * 1.5;
        // Hiệu ứng nháy màu
        const originalColor = Phaser.Display.Color.HexStringToColor(mainPlayer.data.color).color;
        mainPlayer.sprite.setFillStyle(0x2ed573);
        tweens.add({
          targets: mainPlayer.sprite,
          alpha: 0.5,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            mainPlayer.sprite.setFillStyle(originalColor);
            mainPlayer.sprite.setAlpha(1);
            mainPlayer.sprite.setScale(1, 1);
          },
        });
        // Hiệu ứng phụ: gió phía sau player
        const windParticles: Phaser.GameObjects.Arc[] = [];
        const windInterval = time.addEvent({
          delay: 80,
          repeat: Math.floor(10000 / 80),
          callback: () => {
            let dx = 0,
              dy = 0;
            if (cursors.left.isDown || aKey.isDown) dx -= 1;
            if (cursors.right.isDown || dKey.isDown) dx += 1;
            if (cursors.up.isDown || wKey.isDown) dy -= 1;
            if (cursors.down.isDown || sKey.isDown) dy += 1;
            if (dx === 0 && dy === 0) {
              const angle = Math.random() * Math.PI * 2;
              dx = Math.cos(angle);
              dy = Math.sin(angle);
            }
            const px = mainPlayer.data.x - dx * 24 + (Math.random() - 0.5) * 10;
            const py = mainPlayer.data.y - dy * 24 + (Math.random() - 0.5) * 10;
            const wind = sceneAdd.circle(px, py, 6 + Math.random() * 4, 0x90e0ef, 0.5);
            wind.setDepth(2);
            windParticles.push(wind);
            tweens.add({
              targets: wind,
              x: px - dx * (20 + Math.random() * 10),
              y: py - dy * (20 + Math.random() * 10),
              alpha: 0,
              scaleX: 1.5,
              scaleY: 1.5,
              duration: 400 + Math.random() * 200,
              onComplete: () => wind.destroy(),
            });
          },
        });
        time.delayedCall(10000, () => {
          if (mainPlayer.data.speedBoostActive) {
            mainPlayer.data.speed = mainPlayer.data.originalSpeed;
            mainPlayer.data.speedBoostActive = false;
            mainPlayer.sprite.setFillStyle(originalColor);
          }
          windInterval.remove(false);
          windParticles.forEach((p) => p.destroy());
        });
      }
      break;
    case 'rapid':
      if (!mainPlayer.data.rapidFireActive) {
        mainPlayer.data.rapidFireActive = true;
        mainPlayer.data.originalFireRate = mainPlayer.data.fireRate || 500;
        mainPlayer.data.fireRate = mainPlayer.data.originalFireRate * 0.4;
        const originalColor = Phaser.Display.Color.HexStringToColor(mainPlayer.data.color).color;
        mainPlayer.sprite.setFillStyle(0xffa502);
        tweens.add({
          targets: mainPlayer.sprite,
          alpha: 0.5,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            mainPlayer.sprite.setFillStyle(originalColor);
            mainPlayer.sprite.setAlpha(1);
            mainPlayer.sprite.setScale(1, 1);
          },
        });
        const fireParticles: Phaser.GameObjects.Arc[] = [];
        const fireInterval = time.addEvent({
          delay: 60,
          repeat: Math.floor(8000 / 60),
          callback: () => {
            const angle = Math.random() * Math.PI * 2;
            const r = 22 + Math.random() * 6;
            const px = mainPlayer.data.x + Math.cos(angle) * r;
            const py = mainPlayer.data.y + Math.sin(angle) * r;
            const color = Math.random() > 0.5 ? 0xffa502 : 0xff6348;
            const fire = sceneAdd.circle(px, py, 6 + Math.random() * 3, color, 0.85);
            fire.setScale(0.6 + Math.random() * 0.3, 1.2 + Math.random() * 0.5);
            fire.setDepth(4);
            fireParticles.push(fire);
            tweens.add({
              targets: fire,
              scaleY: 2.2 + Math.random(),
              scaleX: 0.7 + Math.random() * 0.5,
              alpha: 0,
              duration: 320 + Math.random() * 120,
              onComplete: () => fire.destroy(),
            });
          },
        });
        time.delayedCall(8000, () => {
          if (mainPlayer.data.rapidFireActive) {
            mainPlayer.data.fireRate = mainPlayer.data.originalFireRate;
            mainPlayer.data.rapidFireActive = false;
            mainPlayer.sprite.setFillStyle(originalColor);
          }
          fireInterval.remove(false);
          fireParticles.forEach((p) => p.destroy());
        });
      }
      break;
    case 'shield':
      if (!mainPlayer.data.shieldActive) {
        mainPlayer.data.shieldActive = true;
        mainPlayer.data.shieldHits = 1;
        const shieldCircle = sceneAdd.circle(mainPlayer.data.x, mainPlayer.data.y, PLAYER_RADIUS + 8, 0x70a1ff, 0.3);
        shieldCircle.setStrokeStyle(2, 0x5352ed);
        mainPlayer.data.shieldVisual = shieldCircle;
        setTimeout(() => {
          if (mainPlayer.data.shieldActive) {
            mainPlayer.data.shieldActive = false;
            mainPlayer.data.shieldHits = 0;
            if (mainPlayer.data.shieldVisual) {
              mainPlayer.data.shieldVisual.destroy();
              mainPlayer.data.shieldVisual = undefined;
            }
            console.log('Shield expired');
          }
        }, 12000);
        console.log('Shield activated: 1 hit protection for 12s');
      }
      break;
    case 'damage':
      if (!mainPlayer.data.doubleDamageActive) {
        mainPlayer.data.doubleDamageActive = true;
        mainPlayer.data.originalDamage = mainPlayer.data.damage || 1;
        mainPlayer.data.damage = mainPlayer.data.originalDamage * 2;
        const originalColor = Phaser.Display.Color.HexStringToColor(mainPlayer.data.color).color;
        mainPlayer.sprite.setFillStyle(0xff4757);
        tweens.add({
          targets: mainPlayer.sprite,
          alpha: 0.5,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            mainPlayer.sprite.setFillStyle(originalColor);
            mainPlayer.sprite.setAlpha(1);
            mainPlayer.sprite.setScale(1, 1);
          },
        });
        time.delayedCall(15000, () => {
          if (mainPlayer.data.doubleDamageActive) {
            mainPlayer.data.damage = mainPlayer.data.originalDamage;
            mainPlayer.data.doubleDamageActive = false;
            mainPlayer.sprite.setFillStyle(originalColor);
          }
        });
      }
      break;
  }
}
