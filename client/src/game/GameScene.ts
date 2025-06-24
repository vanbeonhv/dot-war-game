import Phaser from "phaser";
import type { PlayerData, BulletData, BotData } from "./types";
import { Player } from "./Player";
import { Bullet } from "./Bullet";

const PLAYER_COLORS = ["#e63946", "#457b9d", "#f1faee", "#a8dadc", "#ffbe0b", "#8338ec", "#3a86ff"];
const PLAYER_RADIUS = 20;
const PLAYER_SPEED = 200;
const BULLET_SPEED = 400;
const BULLET_RADIUS = 5;
const RESPAWN_TIME = 3000; // 3 giây
const NUM_FAKE_PLAYERS = 5;

function getRandomPos(width: number, height: number) {
  return {
    x: Math.random() * (width - 2 * PLAYER_RADIUS) + PLAYER_RADIUS,
    y: Math.random() * (height - 2 * PLAYER_RADIUS) + PLAYER_RADIUS,
  };
}

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
  private score: number = 0;
  private highScore: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private isPaused: boolean = false;
  private pauseMenu!: Phaser.GameObjects.Container;
  private pauseKey!: Phaser.Input.Keyboard.Key;
  private wasPauseKeyPressed: boolean = false;

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {}

  create() {
    const width = 800;
    const height = 600;
    this.highScore = parseInt(localStorage.getItem('dotWarHighScore') || '0');
    // Tạo danh sách player (player chính + fake player)
    this.players = [
      new Player(this, {
        id: "me",
        ...getRandomPos(width, height),
        color: PLAYER_COLORS[0],
        isMain: true,
        hp: 3,
      }),
      ...Array.from({ length: NUM_FAKE_PLAYERS }).map((_, i) => new Player(this, {
        id: `fake_${i}`,
        ...getRandomPos(width, height),
        color: PLAYER_COLORS[(i + 1) % PLAYER_COLORS.length],
        isMain: false,
        hp: 3,
      })),
    ];
    this.respawnTimers = this.players.map(() => 0);
    this.scoreText = this.add.text(10, 10, `Score: ${this.score}`, {
      font: "24px Arial",
      color: "#fff",
    });
    this.highScoreText = this.add.text(10, 40, `High Score: ${this.highScore}`, {
      font: "20px Arial",
      color: "#ffff00",
    });
    this.cursors = this.input?.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.wKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W) as Phaser.Input.Keyboard.Key;
    this.aKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A) as Phaser.Input.Keyboard.Key;
    this.sKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S) as Phaser.Input.Keyboard.Key;
    this.dKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D) as Phaser.Input.Keyboard.Key;
    this.pauseKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) as Phaser.Input.Keyboard.Key;
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isPaused) {
        this.shootBullet(pointer.x, pointer.y);
      }
    });
    this.createPauseMenu();
  }

  createPauseMenu() {
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    this.pauseMenu = this.add.container(400, 300);
    const title = this.add.text(0, -50, "GAME PAUSED", {
      font: "48px Arial",
      color: "#fff",
    }).setOrigin(0.5);
    const instructions = this.add.text(0, 0, "Press ESC to resume\nClick to shoot\nWASD to move", {
      font: "24px Arial",
      color: "#ccc",
      align: "center",
    }).setOrigin(0.5);
    this.pauseMenu.add([overlay, title, instructions]);
    this.pauseMenu.setVisible(false);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.pauseMenu.setVisible(this.isPaused);
  }

  shootBullet(targetX: number, targetY: number) {
    const mainPlayer = this.players[0];
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
      };
      const bullet = new Bullet(this, bulletData);
      this.bullets.push(bullet);
    }
  }

  respawnPlayer(playerIndex: number) {
    const player = this.players[playerIndex];
    const newPos = getRandomPos(800, 600);
    player.setPosition(newPos.x, newPos.y);
    player.data.hp = 3;
    player.setAlpha(0);
    this.tweens.add({
      targets: [player.sprite, player.nameText, player.healthBar],
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });
    this.respawnTimers[playerIndex] = 0;
    if (this.respawnTexts[playerIndex]) {
      this.respawnTexts[playerIndex]!.destroy();
      this.respawnTexts[playerIndex] = null;
    }
    player.setVisible(true);
    player.drawHealthBar();
  }

  updateScore() {
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.highScoreText.setText(`High Score: ${this.highScore}`);
      localStorage.setItem('dotWarHighScore', this.highScore.toString());
    }
  }

  update(time: number, delta: number) {
    if (this.pauseKey && this.pauseKey.isDown && !this.wasPauseKeyPressed) {
      this.togglePause();
      this.wasPauseKeyPressed = true;
    } else if (this.pauseKey && !this.pauseKey.isDown) {
      this.wasPauseKeyPressed = false;
    }
    if (this.isPaused) {
      return;
    }
    const mainPlayer = this.players[0];
    let dx = 0, dy = 0;
    if (this.cursors && this.aKey && this.wKey && this.sKey && this.dKey) {
      if (this.cursors.left.isDown || this.aKey.isDown) dx -= 1;
      if (this.cursors.right.isDown || this.dKey.isDown) dx += 1;
      if (this.cursors.up.isDown || this.wKey.isDown) dy -= 1;
      if (this.cursors.down.isDown || this.sKey.isDown) dy += 1;
    }
    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len; dy /= len;
      mainPlayer.setPosition(
        Math.max(PLAYER_RADIUS, Math.min(800 - PLAYER_RADIUS, mainPlayer.data.x + dx * PLAYER_SPEED * (delta / 1000))),
        Math.max(PLAYER_RADIUS, Math.min(600 - PLAYER_RADIUS, mainPlayer.data.y + dy * PLAYER_SPEED * (delta / 1000)))
      );
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
      for (let j = this.players.length - 1; j >= 0; j--) {
        const player = this.players[j];
        if (j === 0) continue;
        if (this.respawnTimers[j] > 0) continue;
        const distance = Math.sqrt(
          Math.pow(bullet.data.x - player.data.x, 2) + 
          Math.pow(bullet.data.y - player.data.y, 2)
        );
        if (distance < PLAYER_RADIUS + BULLET_RADIUS) {
          this.createHitEffect(player.data.x, player.data.y);
          player.data.hp -= 1;
          player.drawHealthBar();
          if (player.data.hp <= 0) {
            player.setVisible(false);
            this.updateScore();
            this.respawnTimers[j] = RESPAWN_TIME;
            const countdownText = this.add.text(player.data.x - 30, player.data.y - 10, "3", {
              font: "24px Arial",
              color: "#ff0000",
            });
            this.respawnTexts[j] = countdownText;
          }
          hitPlayer = true;
          break;
        }
      }
      bullet.data.life -= delta;
      if (hitPlayer || bullet.data.life <= 0 || 
          bullet.data.x < 0 || bullet.data.x > 800 || 
          bullet.data.y < 0 || bullet.data.y > 600) {
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
          this.respawnTexts[i]!.setText(secondsLeft.toString());
        }
        if (this.respawnTimers[i] <= 0) {
          this.respawnPlayer(i);
        }
      }
    }
  }

  createHitEffect(x: number, y: number) {
    const explosion = this.add.circle(x, y, PLAYER_RADIUS * 1.5, 0xff0000, 0.8);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = this.add.circle(
        x + Math.cos(angle) * PLAYER_RADIUS,
        y + Math.sin(angle) * PLAYER_RADIUS,
        3,
        0xffff00,
        1
      );
      this.tweens.add({
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
        }
      });
    }
    this.tweens.add({
      targets: explosion,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        explosion.destroy();
      }
    });
    const flash = this.add.circle(x, y, PLAYER_RADIUS * 2, 0xffffff, 0.6);
    this.tweens.add({
      targets: flash,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        flash.destroy();
      }
    });
  }
} 