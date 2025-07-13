import { PLAYER_RADIUS } from '../constants/constants';
import type { Player } from '../entities/Player';
import { createScoreMilestoneEffect } from './effects';

export function respawnPlayer(
  players: Player[],
  respawnTimers: any[],
  respawnTexts: (Phaser.GameObjects.Text | null)[],
  tweens: Phaser.Tweens.TweenManager,
  playerIndex: number,
  getSafeRandomPos: (radius: number) => { x: number; y: number }
) {
  const player = players[playerIndex];
  const newPos = getSafeRandomPos(PLAYER_RADIUS);
  player.data.x = newPos.x;
  player.data.y = newPos.y;
  player.setPosition(newPos.x, newPos.y);
  player.data.hp = player.data.isMain ? 5 : 3;
  player.data.maxHp = player.data.isMain ? 5 : 3;
  player.setAlpha(0);
  tweens.add({
    targets: [player.sprite, player.gun, player.nameText, player.healthBar],
    alpha: 1,
    duration: 500,
    ease: 'Power2',
  });
  respawnTimers[playerIndex] = 0;
  if (respawnTexts[playerIndex]) {
    respawnTexts[playerIndex]?.destroy();
    respawnTexts[playerIndex] = null;
  }
  player.setVisible(true);
  player.setAlpha(1);
  player.drawHealthBar();
}

export function updateScore(
  players: Player[],
  highScore: number,
  setHighScore: (score: number) => void,
  ownerId: string,
  updateLeaderboard: () => void
) {
  const player = players.find((p) => p.data.id === ownerId);
  if (player) {
    player.setScore(player.getScore() + 10);
  }
  // Cập nhật high score cho player chính
  const mainPlayer = players[0];
  if (mainPlayer.getScore() > highScore) {
    setHighScore(mainPlayer.getScore());
  }
  updateLeaderboard();
}

export function updateLeaderboard(
  players: Player[],
  leaderboardText: Phaser.GameObjects.Text,
  youLineText: Phaser.GameObjects.Text | undefined,
  setYouLineText: (t?: Phaser.GameObjects.Text) => void,
  add?: Phaser.GameObjects.GameObjectFactory,
  tweens?: Phaser.Tweens.TweenManager,
  lastMilestone?: { value: number },
  setLastMilestone?: (milestone: { value: number }) => void
) {
  // Chỉ lấy điểm của người chơi chính
  const mainPlayer = players.find((p) => p.data.isMain);
  if (mainPlayer) {
    const score = mainPlayer.getScore();
    const scoreText = score.toString().padStart(4, '0'); // Thêm leading zeros
    leaderboardText.setText(`🎯 Score: ${scoreText}`);

    // Kiểm tra và tạo hiệu ứng cho mức điểm mới
    if (add && tweens && lastMilestone && setLastMilestone) {
      const milestones = [100, 250, 500, 750, 1000, 1500, 2000, 3000, 5000];
      const currentMilestone = milestones.find((m) => score >= m && lastMilestone.value < m);

      if (currentMilestone) {
        // Tạo hiệu ứng tại vị trí của leaderboard
        createScoreMilestoneEffect(
          add,
          tweens,
          leaderboardText.x + leaderboardText.width / 2,
          leaderboardText.y - 30,
          currentMilestone
        );

        // Cập nhật milestone cuối cùng
        setLastMilestone({ value: currentMilestone });
      }
    }

    // Thay đổi màu sắc dựa trên điểm số
    if (score >= 1000) {
      leaderboardText.setColor('#FFD700'); // Vàng cho điểm cao
    } else if (score >= 500) {
      leaderboardText.setColor('#FF6B6B'); // Đỏ cam cho điểm trung bình
    } else if (score >= 100) {
      leaderboardText.setColor('#4ECDC4'); // Xanh lá cho điểm thấp
    } else {
      leaderboardText.setColor('#FFFFFF'); // Trắng cho điểm thấp
    }
  }
  // Xoá text object youLineText nếu có
  if (youLineText) {
    youLineText.destroy();
    setYouLineText(undefined);
  }
}

export function isCollidingObstacle(obstacles: Phaser.GameObjects.Rectangle[], x: number, y: number, radius: number) {
  // Kiểm tra biên map với margin nhỏ hơn
  const mapMargin = radius * 1.2;
  if (
    x - radius < mapMargin ||
    x + radius > 800 - mapMargin ||
    y - radius < mapMargin ||
    y + radius > 600 - mapMargin
  ) {
    return true;
  }

  // Kiểm tra va chạm với từng obstacle
  for (const obstacle of obstacles) {
    const rectX = obstacle.x;
    const rectY = obstacle.y;
    const rectW = obstacle.width;
    const rectH = obstacle.height;

    // Tìm điểm gần nhất trên obstacle với điểm cần kiểm tra
    const closestX = Math.max(rectX - rectW / 2, Math.min(x, rectX + rectW / 2));
    const closestY = Math.max(rectY - rectH / 2, Math.min(y, rectY + rectH / 2));

    // Tính khoảng cách từ điểm gần nhất đến điểm cần kiểm tra
    const distX = x - closestX;
    const distY = y - closestY;

    // Kiểm tra va chạm với khoảng cách thực tế
    if (distX * distX + distY * distY < radius * radius) {
      return true;
    }
  }

  return false;
}

export function handlePlayerHit(player: Player, respawnTimers: any[], playerIndex: number) {
  const wasDamaged = player.takeDamage();
  if (wasDamaged) {
    // Chỉ respawn nếu thực sự bị mất máu (không có shield)
    if (player.data.hp <= 0) {
      respawnTimers[playerIndex] = 3000;
      player.setVisible(false);
      player.setAlpha(0.5);
    }
  }
  return wasDamaged;
}
