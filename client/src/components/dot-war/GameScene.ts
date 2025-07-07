import Phaser from 'phaser';
import { Bullet } from './Bullet';
import {
  BULLET_RADIUS,
  BULLET_SPEED,
  NUM_FAKE_PLAYERS,
  PLAYER_COLORS,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  RESPAWN_TIME,
} from './constants';
import { Player } from './Player';
import { PowerUpManager } from './PowerUpManager';
import type { BulletData } from './types';
import { shootBotBullet } from './ulti/botUtils';
import { createHitEffect, createUltimateEffect } from './ulti/effects';
import { isCollidingObstacle, respawnPlayer, updateLeaderboard, updateScore } from './ulti/playerUtils';
import { applyPowerUpEffect } from './ulti/powerUpEffects';

export default class GameScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wKey!: Phaser.Input.Keyboard.Key;
  private aKey!: Phaser.Input.Keyboard.Key;
  private sKey!: Phaser.Input.Keyboard.Key;
  private dKey!: Phaser.Input.Keyboard.Key;
  private players: Player[] = [];
  private bullets: Bullet[] = [];
  private respawnTimers: any[] = [];
  private respawnTexts: (Phaser.GameObjects.Text | null)[] = [];
  private highScore: number = 0;
  private isPaused: boolean = false;
  private pauseMenu!: Phaser.GameObjects.Container;
  private pauseKey!: Phaser.Input.Keyboard.Key;
  private wasPauseKeyPressed: boolean = false;
  private botMoveTimers: number[] = [];
  private botShootTimers: number[] = [];
  private leaderboardText!: Phaser.GameObjects.Text;
  private obstacles: Phaser.GameObjects.Rectangle[] = [];
  private youLineText?: Phaser.GameObjects.Text;
  private ultimateKey!: Phaser.Input.Keyboard.Key;
  private powerUpManager!: PowerUpManager;

  // Survival Mode properties
  private survivalTimer!: Phaser.GameObjects.Text;
  private survivalTime: number = 0; // Time survived in milliseconds
  private survivalTarget: number = 5 * 60 * 1000; // 5 minutes target
  private isSurvivalMode: boolean = true;
  private gameOver: boolean = false;
  private getRandomSpawnPoint() {
    const margin = PLAYER_RADIUS * 2; // Giảm margin để tăng phạm vi di chuyển
    let maxTries = 50;

    while (maxTries > 0) {
      const x = margin + Math.random() * (800 - margin * 2);
      const y = margin + Math.random() * (600 - margin * 2);

      if (!isCollidingObstacle(this.obstacles, x, y, PLAYER_RADIUS * 2)) {
        return { x, y };
      }
      maxTries--;
    }

    // Fallback: tìm điểm xa obstacles nhất
    let bestPos = { x: 400, y: 300 };
    let maxMinDistance = 0;

    for (let i = 0; i < 20; i++) {
      const x = margin + Math.random() * (800 - margin * 2);
      const y = margin + Math.random() * (600 - margin * 2);

      let minDistance = Number.MAX_VALUE;
      for (const obstacle of this.obstacles) {
        const dx = x - obstacle.x;
        const dy = y - obstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        minDistance = Math.min(minDistance, distance);
      }

      if (minDistance > maxMinDistance) {
        maxMinDistance = minDistance;
        bestPos = { x, y };
      }
    }

    return bestPos;
  }

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {}

  create() {
    // Reset survival mode state on restart
    this.survivalTime = 0;
    this.gameOver = false;
    this.isPaused = false;

    this.highScore = parseInt(localStorage.getItem('dotWarHighScore') || '0');

    // Khởi tạo các thông số khác trước
    this.cursors = this.input?.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.wKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W) as Phaser.Input.Keyboard.Key;
    this.aKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A) as Phaser.Input.Keyboard.Key;
    this.sKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S) as Phaser.Input.Keyboard.Key;
    this.dKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D) as Phaser.Input.Keyboard.Key;
    this.pauseKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) as Phaser.Input.Keyboard.Key;
    this.ultimateKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.Q) as Phaser.Input.Keyboard.Key;

    this.createPauseMenu();
    this.leaderboardText = this.add.text(600, 20, '', {
      font: '20px Arial',
      color: '#fff',
      align: 'right',
      wordWrap: { width: 200 },
      fontStyle: 'normal',
      // rich text bật ở đây
      // @ts-ignore
      rich: true,
    });
    this.leaderboardText.setDepth(100);

    // Create survival timer
    this.survivalTimer = this.add.text(20, 20, 'Survival Time: 00:00', {
      font: '24px Arial',
      color: '#00ff00',
      fontStyle: 'bold',
    });
    this.survivalTimer.setDepth(100);

    // Tạo obstacles với kích thước vừa phải và đảm bảo ít nhất 4 cái
    this.obstacles = [];
    const minSize = 60;
    const maxSize = 100;

    // Chia map thành các vùng nhỏ hơn để đảm bảo đủ chỗ
    const zones = [
      { x1: 100, y1: 100, x2: 250, y2: 250 },
      { x1: 550, y1: 100, x2: 700, y2: 250 },
      { x1: 100, y1: 350, x2: 250, y2: 500 },
      { x1: 550, y1: 350, x2: 700, y2: 500 },
      { x1: 300, y1: 200, x2: 500, y2: 400 },
    ];

    // Đầu tiên đặt 4 obstacles ở 4 vùng đầu tiên
    for (let i = 0; i < 4; i++) {
      const zone = zones[i];
      const w = minSize + Math.random() * (maxSize - minSize);
      const h = minSize + Math.random() * (maxSize - minSize);

      const x = zone.x1 + (zone.x2 - zone.x1 - w) / 2;
      const y = zone.y1 + (zone.y2 - zone.y1 - h) / 2;

      const rect = this.add.rectangle(x, y, w, h, 0x444444, 1).setStrokeStyle(2, 0xffffff, 0.7).setDepth(10);
      this.obstacles.push(rect);
    }

    // Thêm 1-2 obstacles nữa nếu còn chỗ
    const extraObstacles = Math.floor(Math.random() * 2);
    if (extraObstacles > 0 && zones.length > 4) {
      const zone = zones[4];
      const w = minSize + Math.random() * (maxSize - minSize);
      const h = minSize + Math.random() * (maxSize - minSize);

      const x = zone.x1 + (zone.x2 - zone.x1 - w) / 2;
      const y = zone.y1 + (zone.y2 - zone.y1 - h) / 2;

      const rect = this.add.rectangle(x, y, w, h, 0x444444, 1).setStrokeStyle(2, 0xffffff, 0.7).setDepth(10);
      this.obstacles.push(rect);
    }

    // Tạo vị trí spawn ngẫu nhiên cho player chính
    const mainSpawnPoint = this.getRandomSpawnPoint();

    // Tạo players với vị trí spawn đã định sẵn
    this.players = [
      new Player(this, {
        id: 'me',
        x: mainSpawnPoint.x,
        y: mainSpawnPoint.y,
        color: PLAYER_COLORS[0],
        isMain: true,
        hp: 3,
        score: 0,
        energy: 0,
        maxEnergy: 5,
      }),
      ...Array.from({ length: NUM_FAKE_PLAYERS }).map((_, i) => {
        // Tạo vị trí spawn ngẫu nhiên cho mỗi bot
        const botSpawnPoint = this.getRandomSpawnPoint();
        return new Player(this, {
          id: `bot_${i}`,
          name: `bot_${i}`,
          x: botSpawnPoint.x,
          y: botSpawnPoint.y,
          color: PLAYER_COLORS[(i + 1) % PLAYER_COLORS.length],
          isMain: false,
          hp: 3,
          score: 0,
          energy: 0,
          maxEnergy: 5,
        });
      }),
    ];
    this.respawnTimers = this.players.map(() => 0);
    this.botMoveTimers = this.players.map((_, i) => (i === 0 ? 0 : Math.random() * 2000 + 1000));
    this.botShootTimers = this.players.map((_, i) => (i === 0 ? 0 : Math.random() * 1500 + 800));

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isPaused && this.respawnTimers[0] <= 0) {
        this.shootBullet(pointer.x, pointer.y);
      }
    });

    // Khởi tạo PowerUpManager
    this.powerUpManager = new PowerUpManager(this, (x, y, radius) => isCollidingObstacle(this.obstacles, x, y, radius));
  }

  createPauseMenu() {
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    this.pauseMenu = this.add.container(400, 300);
    const title = this.add
      .text(0, -50, 'GAME PAUSED', {
        font: '48px Arial',
        color: '#fff',
      })
      .setOrigin(0.5);
    const instructions = this.add
      .text(0, 0, 'Press ESC to resume\nClick to shoot\nWASD to move', {
        font: '24px Arial',
        color: '#ccc',
        align: 'center',
      })
      .setOrigin(0.5);
    this.pauseMenu.add([overlay, title, instructions]);
    this.pauseMenu.setVisible(false);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.pauseMenu.setVisible(this.isPaused);
  }

  shootBullet(targetX: number, targetY: number) {
    const mainPlayer = this.players[0];
    mainPlayer.flashGunEffect();
    const dx = targetX - mainPlayer.data.x;
    const dy = targetY - mainPlayer.data.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      const bulletData: BulletData = {
        x: mainPlayer.data.x + normalizedDx * PLAYER_RADIUS,
        y: mainPlayer.data.y + normalizedDy * PLAYER_RADIUS,
        dx: normalizedDx * BULLET_SPEED,
        dy: normalizedDy * BULLET_SPEED,
        life: 3000,
        ownerId: mainPlayer.data.id,
        isUltimate: true,
      };
      const bullet = new Bullet(this, bulletData);
      this.bullets.push(bullet);
    }
  }

  update(time: number, delta: number) {
    if (this.pauseKey?.isDown && !this.wasPauseKeyPressed) {
      this.togglePause();
      this.wasPauseKeyPressed = true;
    } else if (this.pauseKey && !this.pauseKey.isDown) {
      this.wasPauseKeyPressed = false;
    }
    if (this.isPaused) {
      return;
    }

    // Update survival timer
    if (this.isSurvivalMode && !this.gameOver && this.respawnTimers[0] <= 0) {
      this.survivalTime += delta;
      this.updateSurvivalTimer();

      // Check if target reached
      if (this.survivalTime >= this.survivalTarget) {
        this.handleSurvivalVictory();
      }
    }
    const pointer = this.input.activePointer;
    const mainPlayer = this.players[0];
    mainPlayer.updateGunDirection(pointer.worldX, pointer.worldY);
    // Ultimate: nhấn Q khi đủ energy và không respawn
    if (
      this.ultimateKey &&
      Phaser.Input.Keyboard.JustDown(this.ultimateKey) &&
      (mainPlayer.data.energy ?? 0) >= (mainPlayer.data.maxEnergy ?? 5) &&
      this.respawnTimers[0] <= 0
    ) {
      // Bắn 10 viên đạn spread ±45 độ quanh hướng chuột
      const baseAngle = Math.atan2(pointer.worldY - mainPlayer.data.y, pointer.worldX - mainPlayer.data.x);
      const spread = Math.PI / 4; // ±45 độ
      const numBullets = 10;
      for (let i = 0; i < numBullets; i++) {
        const t = i / (numBullets - 1);
        const angle = baseAngle - spread / 2 + t * spread;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        const bulletData: BulletData = {
          x: mainPlayer.data.x + dx * PLAYER_RADIUS,
          y: mainPlayer.data.y + dy * PLAYER_RADIUS,
          dx: dx * BULLET_SPEED,
          dy: dy * BULLET_SPEED,
          life: 3000,
          ownerId: mainPlayer.data.id,
          isUltimate: true,
        };
        const bullet = new Bullet(this, bulletData);
        this.bullets.push(bullet);
      }
      mainPlayer.data.energy = 0;
      mainPlayer.drawHealthBar();
      // Hiệu ứng âm thanh/visual khi kích hoạt ultimate
      createUltimateEffect(this.add, this.tweens, mainPlayer.data.x, mainPlayer.data.y);
    }
    // Bot hướng mũi súng về phía player chính
    for (let i = 1; i < this.players.length; i++) {
      const bot = this.players[i];
      if (this.respawnTimers[i] > 0) continue;
      bot.updateGunDirection(mainPlayer.data.x, mainPlayer.data.y);
    }
    // Player chính chỉ di chuyển nếu không respawn
    if (this.respawnTimers[0] <= 0) {
      let dx = 0,
        dy = 0;
      if (this.cursors && this.aKey && this.wKey && this.sKey && this.dKey) {
        if (this.cursors.left.isDown || this.aKey.isDown) dx -= 1;
        if (this.cursors.right.isDown || this.dKey.isDown) dx += 1;
        if (this.cursors.up.isDown || this.wKey.isDown) dy -= 1;
        if (this.cursors.down.isDown || this.sKey.isDown) dy += 1;
      }
      if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;
        const newX = Math.max(
          PLAYER_RADIUS,
          Math.min(800 - PLAYER_RADIUS, this.players[0].data.x + dx * PLAYER_SPEED * (delta / 1000))
        );
        const newY = Math.max(
          PLAYER_RADIUS,
          Math.min(600 - PLAYER_RADIUS, this.players[0].data.y + dy * PLAYER_SPEED * (delta / 1000))
        );
        // Chỉ di chuyển nếu không va chạm obstacle
        if (!isCollidingObstacle(this.obstacles, newX, newY, PLAYER_RADIUS)) {
          this.players[0].setPosition(newX, newY);
        }
      }
    }
    // Cập nhật đạn và kiểm tra va chạm
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.setPosition(
        bullet.data.x + bullet.data.dx * (delta / 1000),
        bullet.data.y + bullet.data.dy * (delta / 1000)
      );
      bullet.data.x = bullet.sprite.x;
      bullet.data.y = bullet.sprite.y;
      let hitPlayer = false;
      for (let j = 0; j < this.players.length; j++) {
        const player = this.players[j];
        if (player.data.id === bullet.data.ownerId) continue; // không tự bắn mình
        if (this.respawnTimers[j] > 0) continue;
        const distance = Math.sqrt((bullet.data.x - player.data.x) ** 2 + (bullet.data.y - player.data.y) ** 2);
        if (distance < PLAYER_RADIUS + BULLET_RADIUS) {
          createHitEffect(this.add, this.tweens, player.data.x, player.data.y);

          // Sử dụng method handlePlayerHit mới
          const wasDamaged = player.takeDamage();

          if (wasDamaged && player.data.hp <= 0) {
            player.setVisible(false);
            // Reset energy về 0 khi chết
            player.data.energy = 0;
            player.drawHealthBar();

            // Handle main player death in survival mode
            if (player.data.id === 'me' && this.isSurvivalMode) {
              this.handleSurvivalGameOver();
            }

            // Tăng energy cho người bắn nếu không tự bắn mình
            if (bullet.data.ownerId !== player.data.id) {
              const shooter = this.players.find((p) => p.data.id === bullet.data.ownerId);
              if (shooter && typeof shooter.data.energy === 'number' && typeof shooter.data.maxEnergy === 'number') {
                shooter.data.energy = Math.min(shooter.data.energy + 1, shooter.data.maxEnergy);
                shooter.drawHealthBar();
              }
            }
            updateScore(
              this.players,
              this.highScore,
              (score) => {
                this.highScore = score;
              },
              bullet.data.ownerId,
              () =>
                updateLeaderboard(this.players, this.leaderboardText, this.youLineText, (t) => {
                  this.youLineText = t;
                })
            );
            this.respawnTimers[j] = RESPAWN_TIME;
            const countdownText = this.add.text(player.data.x - 30, player.data.y - 10, '3', {
              font: '24px Arial',
              color: '#ff0000',
            });
            this.respawnTexts[j] = countdownText;
          }
          hitPlayer = true;
          break;
        }
      }
      // Nếu đạn va chạm obstacle thì xóa đạn
      if (isCollidingObstacle(this.obstacles, bullet.data.x, bullet.data.y, BULLET_RADIUS)) {
        bullet.destroy();
        this.bullets.splice(i, 1);
        continue;
      }
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
    // Cập nhật respawn timers
    for (let i = 0; i < this.respawnTimers.length; i++) {
      if (this.respawnTimers[i] > 0) {
        this.respawnTimers[i] -= delta;
        if (this.respawnTexts[i]) {
          const secondsLeft = Math.ceil(this.respawnTimers[i] / 1000);
          this.respawnTexts[i]?.setText(secondsLeft.toString());
        }
        if (this.respawnTimers[i] <= 0) {
          // Tạo vị trí spawn ngẫu nhiên khi respawn
          const spawnPoint = this.getRandomSpawnPoint();
          respawnPlayer(this.players, this.respawnTimers, this.respawnTexts, this.tweens, i, () => spawnPoint);
        }
      }
    }
    // Bot di chuyển và bắn
    for (let i = 1; i < this.players.length; i++) {
      const bot = this.players[i];
      if (this.respawnTimers[i] > 0) continue;
      // Di chuyển ngẫu nhiên
      this.botMoveTimers[i] -= delta;
      if (this.botMoveTimers[i] <= 0) {
        // Chọn hướng mới
        const angle = Math.random() * Math.PI * 2;
        bot.data._moveDir = { x: Math.cos(angle), y: Math.sin(angle) };
        this.botMoveTimers[i] = Math.random() * 2000 + 1000;
      }
      // Di chuyển bot
      if (bot.data._moveDir) {
        const speed = PLAYER_SPEED * 0.6;
        const newX = Math.max(
          PLAYER_RADIUS,
          Math.min(800 - PLAYER_RADIUS, bot.data.x + bot.data._moveDir.x * speed * (delta / 1000))
        );
        const newY = Math.max(
          PLAYER_RADIUS,
          Math.min(600 - PLAYER_RADIUS, bot.data.y + bot.data._moveDir.y * speed * (delta / 1000))
        );
        if (!isCollidingObstacle(this.obstacles, newX, newY, PLAYER_RADIUS)) {
          bot.setPosition(newX, newY);
        }
      }
      // Bắn về phía player chính
      this.botShootTimers[i] -= delta;
      if (this.botShootTimers[i] <= 0) {
        const player = this.players[0];
        shootBotBullet(this.bullets, bot, player, this);
        this.botShootTimers[i] = Math.random() * 1500 + 800;
      }
    }

    // Update PowerUpManager
    this.powerUpManager.update(time, delta);

    // Kiểm tra va chạm player với power-up
    if (this.respawnTimers[0] <= 0) {
      // Chỉ kiểm tra khi player còn sống
      const collectedPowerUp = this.powerUpManager.checkPlayerCollision(
        mainPlayer.data.x,
        mainPlayer.data.y,
        PLAYER_RADIUS
      );

      if (collectedPowerUp) {
        applyPowerUpEffect(
          mainPlayer,
          collectedPowerUp,
          this.add,
          this.tweens,
          this.time,
          this.cursors,
          this.aKey,
          this.dKey,
          this.wKey,
          this.sKey
        );
      }

      // Update shield position khi player di chuyển
      mainPlayer.updateShieldPosition();
    }
  }

  private updateSurvivalTimer() {
    const minutes = Math.floor(this.survivalTime / 60000);
    const seconds = Math.floor((this.survivalTime % 60000) / 1000);
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Change color based on time remaining
    const timeRemaining = this.survivalTarget - this.survivalTime;
    let color = '#00ff00'; // Green
    if (timeRemaining < 60000) {
      // Less than 1 minute
      color = '#ff0000'; // Red
    } else if (timeRemaining < 180000) {
      // Less than 3 minutes
      color = '#ffff00'; // Yellow
    }

    this.survivalTimer.setText(`Survival Time: ${timeString}`);
    this.survivalTimer.setColor(color);
  }

  private handleSurvivalVictory() {
    this.gameOver = true;

    // Create victory screen
    const victoryText = this.add.text(400, 250, 'SURVIVAL VICTORY!', {
      font: '48px Arial',
      color: '#00ff00',
      fontStyle: 'bold',
    });
    victoryText.setOrigin(0.5);
    victoryText.setDepth(200);

    const timeText = this.add.text(
      400,
      320,
      `You survived for ${Math.floor(this.survivalTime / 60000)}:${Math.floor((this.survivalTime % 60000) / 1000)
        .toString()
        .padStart(2, '0')}`,
      {
        font: '24px Arial',
        color: '#ffffff',
      }
    );
    timeText.setOrigin(0.5);
    timeText.setDepth(200);

    const restartText = this.add.text(400, 380, 'Press SPACE to restart', {
      font: '20px Arial',
      color: '#ffff00',
    });
    restartText.setOrigin(0.5);
    restartText.setDepth(200);

    // Add restart functionality
    const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    if (spaceKey) {
      spaceKey.on('down', () => {
        this.resetGame();
      });
    }

    // Pause the game
    this.isPaused = true;
  }

  private handleSurvivalGameOver() {
    this.gameOver = true;

    // Create game over screen
    const gameOverText = this.add.text(400, 250, 'GAME OVER', {
      font: '48px Arial',
      color: '#ff0000',
      fontStyle: 'bold',
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(200);

    const timeText = this.add.text(
      400,
      320,
      `You survived for ${Math.floor(this.survivalTime / 60000)}:${Math.floor((this.survivalTime % 60000) / 1000)
        .toString()
        .padStart(2, '0')}`,
      {
        font: '24px Arial',
        color: '#ffffff',
      }
    );
    timeText.setOrigin(0.5);
    timeText.setDepth(200);

    const restartText = this.add.text(400, 380, 'Press SPACE to restart', {
      font: '20px Arial',
      color: '#ffff00',
    });
    restartText.setOrigin(0.5);
    restartText.setDepth(200);

    // Add restart functionality
    const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    if (spaceKey) {
      spaceKey.on('down', () => {
        this.resetGame();
      });
    }

    // Pause the game
    this.isPaused = true;
  }

  shutdown() {
    // Clean up event listeners and reset state
    this.input.keyboard?.removeAllListeners();
    this.input.removeAllListeners();

    // Reset survival mode state
    this.survivalTime = 0;
    this.gameOver = false;
    this.isPaused = false;

    // Clear all game objects
    this.players = [];
    this.bullets = [];
    this.respawnTimers = [];
    this.respawnTexts = [];
    this.botMoveTimers = [];
    this.botShootTimers = [];
    this.obstacles = [];

    // Reset PowerUpManager
    if (this.powerUpManager) {
      this.powerUpManager.destroy();
    }

    // Destroy all game objects
    this.children.removeAll(true);
  }

  private resetGame() {
    // Reset all game state
    this.survivalTime = 0;
    this.gameOver = false;
    this.isPaused = false;

    // Clear all arrays
    this.players = [];
    this.bullets = [];
    this.respawnTimers = [];
    this.respawnTexts = [];
    this.botMoveTimers = [];
    this.botShootTimers = [];
    this.obstacles = [];

    // Reset PowerUpManager
    if (this.powerUpManager) {
      this.powerUpManager.destroy();
    }

    // Remove all game objects
    this.children.removeAll(true);

    // Restart the scene
    this.scene.restart();
  }
}
