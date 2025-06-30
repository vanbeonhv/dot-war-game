import { PLAYER_RADIUS } from '../constants';

export function createHitEffect(
  add: Phaser.GameObjects.GameObjectFactory,
  tweens: Phaser.Tweens.TweenManager,
  x: number,
  y: number
) {
  const explosion = add.circle(x, y, PLAYER_RADIUS * 1.5, 0xff0000, 0.8);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const particle = add.circle(
      x + Math.cos(angle) * PLAYER_RADIUS,
      y + Math.sin(angle) * PLAYER_RADIUS,
      3,
      0xffff00,
      1
    );
    tweens.add({
      targets: particle,
      x: x + Math.cos(angle) * PLAYER_RADIUS * 3,
      y: y + Math.sin(angle) * PLAYER_RADIUS * 3,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        particle.destroy();
      },
    });
  }
  tweens.add({
    targets: explosion,
    scaleX: 2,
    scaleY: 2,
    alpha: 0,
    duration: 600,
    ease: 'Power2',
    onComplete: () => {
      explosion.destroy();
    },
  });
  const flash = add.circle(x, y, PLAYER_RADIUS * 2, 0xffffff, 0.6);
  tweens.add({
    targets: flash,
    scaleX: 0,
    scaleY: 0,
    alpha: 0,
    duration: 300,
    onComplete: () => {
      flash.destroy();
    },
  });
}

export function createUltimateEffect(
  add: Phaser.GameObjects.GameObjectFactory,
  tweens: Phaser.Tweens.TweenManager,
  x: number,
  y: number
) {
  const ultimateRing = add.circle(x, y, 50, 0x00cfff, 0.6);
  tweens.add({
    targets: ultimateRing,
    scaleX: 3,
    scaleY: 3,
    alpha: 0,
    duration: 800,
    ease: 'Power2',
    onComplete: () => {
      ultimateRing.destroy();
    },
  });
  const flash = add.circle(x, y, 30, 0xffffff, 0.8);
  tweens.add({
    targets: flash,
    scaleX: 2,
    scaleY: 2,
    alpha: 0,
    duration: 300,
    onComplete: () => {
      flash.destroy();
    },
  });
}
