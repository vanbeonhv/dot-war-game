import { PLAYER_RADIUS } from '../constants/constants';
import type { Player } from '../entities/Player';

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
  player.data.hp = 3;
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
  setYouLineText: (t?: Phaser.GameObjects.Text) => void
) {
  // Sắp xếp theo điểm giảm dần
  const sorted = [...players].sort((a, b) => b.getScore() - a.getScore());
  const maxNameLen = Math.max(...sorted.map((p) => (p.data.isMain ? 'You ★' : p.data.name || p.data.id).length), 8);
  const maxScoreLen = Math.max(...sorted.map((p) => p.getScore().toString().length), 2);
  const lines = sorted.map((p, idx) => {
    let name = p.data.isMain ? 'You ★' : p.data.name || p.data.id;
    let score = p.getScore().toString();
    name = name.padEnd(maxNameLen, ' ');
    score = score.padStart(maxScoreLen, ' ');
    return `${(idx + 1).toString().padEnd(2)}. ${name} : ${score}`;
  });
  leaderboardText.setText(['Leaderboard', ...lines].join('\n'));
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
