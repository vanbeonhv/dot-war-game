import { PLAYER_RADIUS } from '../constants/constants';

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

export function createHealEffect(
  add: Phaser.GameObjects.GameObjectFactory,
  tweens: Phaser.Tweens.TweenManager,
  x: number,
  y: number
) {
  // Tạo text +HP với hiệu ứng đẹp
  const healText = add
    .text(x, y - 60, '+1 HP', {
      fontSize: '20px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2,
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: '#000000',
        blur: 2,
        fill: true,
      },
    })
    .setOrigin(0.5);

  // Hiệu ứng text xuất hiện và bay lên
  healText.setScale(0);
  tweens.add({
    targets: healText,
    scaleX: 1.2,
    scaleY: 1.2,
    alpha: 1,
    y: y - 80,
    duration: 400,
    ease: 'Back.easeOut',
    onComplete: () => {
      // Hiệu ứng rung nhẹ
      tweens.add({
        targets: healText,
        x: x + 1,
        duration: 80,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          // Hiệu ứng biến mất
          tweens.add({
            targets: healText,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            y: y - 120,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
              healText.destroy();
            },
          });
        },
      });
    },
  });

  // Tạo hiệu ứng vòng tròn heal màu xanh
  const healRing = add.circle(x, y, PLAYER_RADIUS * 1.2, 0x00ff00, 0.4);
  tweens.add({
    targets: healRing,
    scaleX: 2.5,
    scaleY: 2.5,
    alpha: 0,
    duration: 800,
    ease: 'Power2',
    onComplete: () => {
      healRing.destroy();
    },
  });

  // Tạo particles heal bay lên
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const particle = add.circle(
      x + Math.cos(angle) * PLAYER_RADIUS * 0.8,
      y + Math.sin(angle) * PLAYER_RADIUS * 0.8,
      3,
      0x00ff00,
      0.8
    );

    tweens.add({
      targets: particle,
      x: x + Math.cos(angle) * PLAYER_RADIUS * 2,
      y: y + Math.sin(angle) * PLAYER_RADIUS * 2 - 30,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        particle.destroy();
      },
    });
  }

  // Tạo hiệu ứng flash xanh
  const healFlash = add.circle(x, y, PLAYER_RADIUS * 1.5, 0x00ff00, 0.5);
  tweens.add({
    targets: healFlash,
    scaleX: 0,
    scaleY: 0,
    alpha: 0,
    duration: 400,
    onComplete: () => {
      healFlash.destroy();
    },
  });

  // Tạo hiệu ứng sparkles nhỏ
  for (let i = 0; i < 4; i++) {
    const sparkle = add.circle(
      x + (Math.random() - 0.5) * PLAYER_RADIUS,
      y + (Math.random() - 0.5) * PLAYER_RADIUS,
      2,
      0xffffff,
      1
    );

    tweens.add({
      targets: sparkle,
      x: x + (Math.random() - 0.5) * PLAYER_RADIUS * 1.5,
      y: y + (Math.random() - 0.5) * PLAYER_RADIUS * 1.5,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        sparkle.destroy();
      },
    });
  }
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

export function createScoreMilestoneEffect(
  add: Phaser.GameObjects.GameObjectFactory,
  tweens: Phaser.Tweens.TweenManager,
  x: number,
  y: number,
  score: number
) {
  // Tạo text hiển thị mức điểm mới
  const milestoneText = add
    .text(x, y - 50, `🎉 ${score} POINTS! 🎉`, {
      fontSize: '24px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true,
      },
    })
    .setOrigin(0.5);

  // Hiệu ứng text xuất hiện
  milestoneText.setScale(0);
  tweens.add({
    targets: milestoneText,
    scaleX: 1.2,
    scaleY: 1.2,
    alpha: 1,
    duration: 400,
    ease: 'Back.easeOut',
    onComplete: () => {
      // Hiệu ứng rung nhẹ
      tweens.add({
        targets: milestoneText,
        x: x + 2,
        duration: 100,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          // Hiệu ứng biến mất
          tweens.add({
            targets: milestoneText,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            y: y - 100,
            duration: 600,
            ease: 'Power2',
            onComplete: () => {
              milestoneText.destroy();
            },
          });
        },
      });
    },
  });

  // Tạo hiệu ứng pháo hoa nhỏ
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const particle = add.circle(x + Math.cos(angle) * 20, y + Math.sin(angle) * 20, 4, 0xffd700, 1);

    tweens.add({
      targets: particle,
      x: x + Math.cos(angle) * 60,
      y: y + Math.sin(angle) * 60,
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

  // Tạo hiệu ứng vòng tròn phát sáng
  const glowRing = add.circle(x, y, 30, 0xffd700, 0.3);
  tweens.add({
    targets: glowRing,
    scaleX: 2,
    scaleY: 2,
    alpha: 0,
    duration: 600,
    ease: 'Power2',
    onComplete: () => {
      glowRing.destroy();
    },
  });

  // Tạo hiệu ứng flash trắng
  const flash = add.circle(x, y, 40, 0xffffff, 0.6);
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
