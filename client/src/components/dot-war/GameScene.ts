import Phaser from "phaser";
import { Bullet } from "./Bullet";
import { Player } from "./Player";
import { PowerUpManager } from "./PowerUpManager";
import type { BulletData, PowerUpData } from "./types";

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

function getSafeRandomPos(scene: GameScene, radius: number) {
  let pos;
  let tries = 0;
  do {
    pos = getRandomPos(800, 600);
    tries++;
    if (!scene.isCollidingObstacle(pos.x, pos.y, radius)) {
      return pos;
    }
  } while (tries < 200);
  // Nếu thử 200 lần vẫn không được, trả về giữa map
  return { x: 400, y: 300 };
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

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {}

  create() {
    this.highScore = parseInt(localStorage.getItem('dotWarHighScore') || '0');
    // Tạo danh sách player (player chính + fake player)
    this.players = [
      new Player(this, {
        id: "me",
        ...getSafeRandomPos(this, PLAYER_RADIUS),
        color: PLAYER_COLORS[0],
        isMain: true,
        hp: 3,
        score: 0,
        energy: 0,
        maxEnergy: 5,
      }),
      ...Array.from({ length: NUM_FAKE_PLAYERS }).map((_, i) => new Player(this, {
        id: `bot_${i}`,
        name: `bot_${i}`,
        ...getSafeRandomPos(this, PLAYER_RADIUS),
        color: PLAYER_COLORS[(i + 1) % PLAYER_COLORS.length],
        isMain: false,
        hp: 3,
        score: 0,
        energy: 0,
        maxEnergy: 5,
      })),
    ];
    this.respawnTimers = this.players.map(() => 0);
    this.botMoveTimers = this.players.map((_, i) => (i === 0 ? 0 : Math.random() * 2000 + 1000));
    this.botShootTimers = this.players.map((_, i) => (i === 0 ? 0 : Math.random() * 1500 + 800));
    this.cursors = this.input?.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.wKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W) as Phaser.Input.Keyboard.Key;
    this.aKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A) as Phaser.Input.Keyboard.Key;
    this.sKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S) as Phaser.Input.Keyboard.Key;
    this.dKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D) as Phaser.Input.Keyboard.Key;
    this.pauseKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) as Phaser.Input.Keyboard.Key;
    this.ultimateKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.Q) as Phaser.Input.Keyboard.Key;
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isPaused && this.respawnTimers[0] <= 0) {
        this.shootBullet(pointer.x, pointer.y);
      }
    });
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
    // Sinh ngẫu nhiên vật cản
    this.obstacles = [];
    const numObstacles = 5;
    for (let i = 0; i < numObstacles; i++) {
      const w = 60 + Math.random() * 60;
      const h = 40 + Math.random() * 40;
      const x = 100 + Math.random() * (800 - 200);
      const y = 100 + Math.random() * (600 - 200);
      const rect = this.add.rectangle(x, y, w, h, 0x444444, 1).setStrokeStyle(2, 0xffffff, 0.7);
      rect.setDepth(10);
      this.obstacles.push(rect);
    }
    
    // Khởi tạo PowerUpManager
    this.powerUpManager = new PowerUpManager(this, this.isCollidingObstacle.bind(this));
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

  respawnPlayer(playerIndex: number) {
    const player = this.players[playerIndex];
    const newPos = getSafeRandomPos(this, PLAYER_RADIUS);
    player.data.x = newPos.x;
    player.data.y = newPos.y;
    player.setPosition(newPos.x, newPos.y);
    player.data.hp = 3;
    player.setAlpha(0);
    this.tweens.add({
      targets: [player.sprite, player.gun, player.nameText, player.healthBar],
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
    player.setAlpha(1);
    player.drawHealthBar();
  }

  updateScore(ownerId: string) {
    const player = this.players.find(p => p.data.id === ownerId);
    if (player) {
      player.setScore(player.getScore() + 10);
    }
    // Cập nhật high score cho player chính
    const mainPlayer = this.players[0];
    if (mainPlayer.getScore() > this.highScore) {
      this.highScore = mainPlayer.getScore();
    }
    this.updateLeaderboard();
  }

  updateLeaderboard() {
    // Sắp xếp theo điểm giảm dần
    const sorted = [...this.players].sort((a, b) => b.getScore() - a.getScore());
    const maxNameLen = Math.max(...sorted.map(p => (p.data.isMain ? 'You ★' : p.data.name || p.data.id).length), 8);
    const maxScoreLen = Math.max(...sorted.map(p => p.getScore().toString().length), 2);
    const lines = sorted.map((p, idx) => {
      let name = p.data.isMain ? 'You ★' : (p.data.name || p.data.id);
      let score = p.getScore().toString();
      name = name.padEnd(maxNameLen, ' ');
      score = score.padStart(maxScoreLen, ' ');
      return `${(idx + 1).toString().padEnd(2)}. ${name} : ${score}`;
    });
    this.leaderboardText.setText(['Leaderboard', ...lines].join('\n'));
    // Xoá text object youLineText nếu có
    if (this.youLineText) {
      this.youLineText.destroy();
      this.youLineText = undefined;
    }
  }

  // Helper: kiểm tra va chạm player với obstacle
  isCollidingObstacle(x: number, y: number, radius: number) {
    for (const obs of this.obstacles) {
      const rx = obs.x;
      const ry = obs.y;
      const rw = obs.width!;
      const rh = obs.height!;
      // Kiểm tra va chạm hình tròn (player) với hình chữ nhật (obstacle)
      const dx = Math.abs(x - rx);
      const dy = Math.abs(y - ry);
      if (dx > rw / 2 + radius) continue;
      if (dy > rh / 2 + radius) continue;
      if (dx <= rw / 2) return true;
      if (dy <= rh / 2) return true;
      const cornerDist = (dx - rw / 2) ** 2 + (dy - rh / 2) ** 2;
      if (cornerDist <= radius * radius) return true;
    }
    return false;
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
      const baseAngle = Math.atan2(pointer.worldY - mainPlayer.data.x, pointer.worldX - mainPlayer.data.y);
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
      this.createUltimateEffect(mainPlayer.data.x, mainPlayer.data.y);
    }
    // Bot hướng mũi súng về phía player chính
    for (let i = 1; i < this.players.length; i++) {
      const bot = this.players[i];
      if (this.respawnTimers[i] > 0) continue;
      bot.updateGunDirection(mainPlayer.data.x, mainPlayer.data.y);
    }
    // Player chính chỉ di chuyển nếu không respawn
    if (this.respawnTimers[0] <= 0) {
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
        const newX = Math.max(PLAYER_RADIUS, Math.min(800 - PLAYER_RADIUS, this.players[0].data.x + dx * PLAYER_SPEED * (delta / 1000)));
        const newY = Math.max(PLAYER_RADIUS, Math.min(600 - PLAYER_RADIUS, this.players[0].data.y + dy * PLAYER_SPEED * (delta / 1000)));
        // Chỉ di chuyển nếu không va chạm obstacle
        if (!this.isCollidingObstacle(newX, newY, PLAYER_RADIUS)) {
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
        const distance = Math.sqrt(
          Math.pow(bullet.data.x - player.data.x, 2) + 
          Math.pow(bullet.data.y - player.data.y, 2)
        );
        if (distance < PLAYER_RADIUS + BULLET_RADIUS) {
          this.createHitEffect(player.data.x, player.data.y);
          
          // Sử dụng method handlePlayerHit mới
          const wasDamaged = player.takeDamage();
          
          if (wasDamaged && player.data.hp <= 0) {
            player.setVisible(false);
            // Reset energy về 0 khi chết
            player.data.energy = 0;
            player.drawHealthBar();
            // Tăng energy cho người bắn nếu không tự bắn mình
            if (bullet.data.ownerId !== player.data.id) {
              const shooter = this.players.find(p => p.data.id === bullet.data.ownerId);
              if (shooter && typeof shooter.data.energy === 'number' && typeof shooter.data.maxEnergy === 'number') {
                shooter.data.energy = Math.min(shooter.data.energy + 1, shooter.data.maxEnergy);
                shooter.drawHealthBar();
              }
            }
            this.updateScore(bullet.data.ownerId);
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
      // Nếu đạn va chạm obstacle thì xóa đạn
      if (this.isCollidingObstacle(bullet.data.x, bullet.data.y, BULLET_RADIUS)) {
        bullet.destroy();
        this.bullets.splice(i, 1);
        continue;
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
        const newX = Math.max(PLAYER_RADIUS, Math.min(800 - PLAYER_RADIUS, bot.data.x + bot.data._moveDir.x * speed * (delta / 1000)));
        const newY = Math.max(PLAYER_RADIUS, Math.min(600 - PLAYER_RADIUS, bot.data.y + bot.data._moveDir.y * speed * (delta / 1000)));
        if (!this.isCollidingObstacle(newX, newY, PLAYER_RADIUS)) {
          bot.setPosition(newX, newY);
        }
      }
      // Bắn về phía player chính
      this.botShootTimers[i] -= delta;
      if (this.botShootTimers[i] <= 0) {
        const player = this.players[0];
        this.shootBotBullet(bot, player);
        this.botShootTimers[i] = Math.random() * 1500 + 800;
      }
    }
    this.updateLeaderboard();
    
    // Update PowerUpManager
    this.powerUpManager.update(time, delta);
    
    // Kiểm tra va chạm player với power-up
    if (this.respawnTimers[0] <= 0) { // Chỉ kiểm tra khi player còn sống
      const collectedPowerUp = this.powerUpManager.checkPlayerCollision(
        mainPlayer.data.x, 
        mainPlayer.data.y, 
        PLAYER_RADIUS
      );
      
      if (collectedPowerUp) {
        this.applyPowerUpEffect(collectedPowerUp);
      }
      
      // Update shield position khi player di chuyển
      mainPlayer.updateShieldPosition();
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

  shootBotBullet(bot: Player, target: Player) {
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
      const bullet = new Bullet(this, bulletData);
      this.bullets.push(bullet);
    }
  }

  createUltimateEffect(x: number, y: number) {
    // Hiệu ứng visual thay thế âm thanh
    const ultimateRing = this.add.circle(x, y, 50, 0x00cfff, 0.6);
    this.tweens.add({
      targets: ultimateRing,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        ultimateRing.destroy();
      }
    });
    // Flash effect
    const flash = this.add.circle(x, y, 30, 0xffffff, 0.8);
    this.tweens.add({
      targets: flash,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        flash.destroy();
      }
    });
  }

  applyPowerUpEffect(powerUpData: PowerUpData) {
    const mainPlayer = this.players[0];
    
    switch (powerUpData.type) {
      case 'health':
        // Health Pack: Hồi 1 máu (tối đa 3 máu)
        if (mainPlayer.data.hp < 3) {
          mainPlayer.data.hp = Math.min(mainPlayer.data.hp + 1, 3);
          mainPlayer.drawHealthBar();
          console.log('Health Pack collected: +1 HP');
        }
        break;
        
      case 'energy':
        // Energy Orb: +2 energy
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
          this.tweens.add({
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
            }
          });
          this.time.delayedCall(10000, () => {
            if (mainPlayer.data.speedBoostActive) {
              mainPlayer.data.speed = mainPlayer.data.originalSpeed;
              mainPlayer.data.speedBoostActive = false;
              mainPlayer.sprite.setFillStyle(originalColor);
            }
          });
        }
        break;
        
      case 'rapid':
        if (!mainPlayer.data.rapidFireActive) {
          mainPlayer.data.rapidFireActive = true;
          mainPlayer.data.originalFireRate = mainPlayer.data.fireRate || 500;
          mainPlayer.data.fireRate = mainPlayer.data.originalFireRate * 0.4;
          // Hiệu ứng nháy màu
          const originalColor = Phaser.Display.Color.HexStringToColor(mainPlayer.data.color).color;
          mainPlayer.sprite.setFillStyle(0xffa502);
          this.tweens.add({
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
            }
          });
          this.time.delayedCall(8000, () => {
            if (mainPlayer.data.rapidFireActive) {
              mainPlayer.data.fireRate = mainPlayer.data.originalFireRate;
              mainPlayer.data.rapidFireActive = false;
              mainPlayer.sprite.setFillStyle(originalColor);
            }
          });
        }
        break;
        
      case 'shield':
        // Shield: Bảo vệ khỏi 1 hit trong 12 giây
        if (!mainPlayer.data.shieldActive) {
          mainPlayer.data.shieldActive = true;
          mainPlayer.data.shieldHits = 1;
          
          // Hiệu ứng visual - tạo shield circle
          const shieldCircle = this.add.circle(
            mainPlayer.data.x, 
            mainPlayer.data.y, 
            PLAYER_RADIUS + 8, 
            0x70a1ff, 
            0.3
          );
          shieldCircle.setStrokeStyle(2, 0x5352ed);
          mainPlayer.data.shieldVisual = shieldCircle;
          
          // Timer để reset
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
          // Hiệu ứng nháy màu
          const originalColor = Phaser.Display.Color.HexStringToColor(mainPlayer.data.color).color;
          mainPlayer.sprite.setFillStyle(0xff4757);
          this.tweens.add({
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
            }
          });
          this.time.delayedCall(15000, () => {
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

  // Cập nhật logic khi player bị hit bởi bullet
  handlePlayerHit(playerIndex: number) {
    const player = this.players[playerIndex];
    const wasDamaged = player.takeDamage();
    
    if (wasDamaged) {
      // Chỉ respawn nếu thực sự bị mất máu (không có shield)
      if (player.data.hp <= 0) {
        this.respawnTimers[playerIndex] = 3000;
        player.setVisible(false);
        player.setAlpha(0.5);
      }
    }
  }
} 