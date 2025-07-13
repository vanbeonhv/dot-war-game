import type Phaser from 'phaser';
import {
  BASE_BOT_SHOOT_INTERVAL,
  BASE_BOT_SPEED,
  BOT_INCREASE_PER_WAVE,
  BOT_SHOOT_RATE_INCREASE_PER_WAVE,
  BOT_SPEED_INCREASE_PER_WAVE,
  BOTS_KILLED_FOR_HEAL,
  HEAL_AMOUNT,
  INITIAL_BOT_COUNT,
  MAX_BOTS_ON_SCREEN,
  PLAYER_COLORS,
  PLAYER_RADIUS,
  PLAYER_SPEED,
} from '../constants/constants';
import { BossBot } from '../entities/BossBot';
import { Player } from '../entities/Player';
import { createHealEffect } from '../utils/effects';
import type { GameState } from '../utils/GameState';
import { respawnPlayer } from '../utils/playerUtils';
import type { GameWorld } from './GameWorld';

export class PlayerManager {
  private scene: Phaser.Scene;
  private players: Player[] = [];
  private respawnTimers: number[] = [];
  private respawnTexts: (Phaser.GameObjects.Text | null)[] = [];
  private botMoveTimers: number[] = [];
  private botShootTimers: number[] = [];
  private gameWorld: GameWorld;
  private gameState: GameState;
  private currentBotCount: number = 0;
  private botIdCounter: number = 0;
  private botsKilledThisWave: number = 0; // Số bot đã giết trong wave hiện tại

  constructor(scene: Phaser.Scene, gameWorld: GameWorld, gameState: GameState) {
    this.scene = scene;
    this.gameWorld = gameWorld;
    this.gameState = gameState;
    this.initializePlayers();
  }

  private initializePlayers() {
    // Tạo vị trí spawn ngẫu nhiên cho player chính
    const mainSpawnPoint = this.gameWorld.getRandomSpawnPoint();

    // Tạo player chính
    this.players = [
      new Player(this.scene, {
        id: 'me',
        x: mainSpawnPoint.x,
        y: mainSpawnPoint.y,
        color: PLAYER_COLORS[0],
        isMain: true,
        hp: 5,
        maxHp: 5,
        score: 0,
        energy: 0,
        maxEnergy: 5,
      }),
    ];

    this.respawnTimers = [0];
    this.botMoveTimers = [0];
    this.botShootTimers = [0];
  }

  private spawnWaveBots() {
    const currentWave = this.gameState.getCurrentWave();
    // Xóa tất cả bot cũ (trừ player chính)
    for (let i = this.players.length - 1; i > 0; i--) {
      this.players[i].destroy();
      this.players.splice(i, 1);
      this.respawnTimers.splice(i, 1);
      this.botMoveTimers.splice(i, 1);
      this.botShootTimers.splice(i, 1);
      this.respawnTexts[i]?.destroy();
      this.respawnTexts.splice(i, 1);
    }

    if (currentWave % 5 === 0) {
      // Boss wave: chỉ spawn 1 BossBot
      this.spawnBossBot();
      this.currentBotCount = 1;
    } else {
      // Wave thường: spawn bot thường
      const targetBotCount = Math.min(
        MAX_BOTS_ON_SCREEN,
        INITIAL_BOT_COUNT + (currentWave - 1) * BOT_INCREASE_PER_WAVE
      );
      for (let i = 0; i < targetBotCount; i++) {
        this.spawnBot();
      }
      this.currentBotCount = targetBotCount;
    }
  }

  private spawnBossBot() {
    const bossSpawnPoint = this.gameWorld.getRandomSpawnPoint();
    const boss = new BossBot(this.scene, {
      id: `boss_${this.botIdCounter++}`,
      name: 'BOSS',
      x: bossSpawnPoint.x,
      y: bossSpawnPoint.y,
      color: '#ff2222',
      isMain: false,
      hp: 20 + Math.floor(this.gameState.getCurrentWave() / 5) * 10, // Boss mạnh dần
      score: 0,
      energy: 0,
      maxEnergy: 5,
    });
    this.players.push(boss);
    this.respawnTimers.push(0);
    this.botMoveTimers.push(Math.random() * 2000 + 1000);
    this.botShootTimers.push(Math.random() * 1500 + 800);
    this.respawnTexts.push(null);
  }

  private spawnBot() {
    const botSpawnPoint = this.gameWorld.getRandomSpawnPoint();
    const botIndex = this.players.length;
    const colorIndex = botIndex % PLAYER_COLORS.length;

    const bot = new Player(this.scene, {
      id: `bot_${this.botIdCounter++}`,
      name: `bot_${this.botIdCounter}`,
      x: botSpawnPoint.x,
      y: botSpawnPoint.y,
      color: PLAYER_COLORS[colorIndex],
      isMain: false,
      hp: 3,
      maxHp: 3,
      score: 0,
      energy: 0,
      maxEnergy: 5,
    });

    this.players.push(bot);
    this.respawnTimers.push(0);
    this.botMoveTimers.push(Math.random() * 2000 + 1000);
    this.botShootTimers.push(Math.random() * 1500 + 800);
    this.respawnTexts.push(null);
  }

  public updateWaveSystem() {
    if (this.gameState.isWaveBreakActive()) {
      // Trong wave break, không spawn bot mới
      return;
    }

    // Kiểm tra nếu đã giết hết bot trong wave hiện tại
    const aliveBots = this.players.filter((_p, i) => i > 0 && this.respawnTimers[i] <= 0).length;

    if (aliveBots === 0) {
      // Tất cả bot đã chết - kết thúc wave
      this.gameState.endCurrentWave();
    }
  }

  public onWaveStart() {
    // Reset bot kill counter cho wave mới
    this.botsKilledThisWave = 0;

    // Heal and increase max HP for main player after each wave
    const mainPlayer = this.getMainPlayer();
    if (mainPlayer.data.maxHp == null) mainPlayer.data.maxHp = 5;
    mainPlayer.data.maxHp += 1;
    mainPlayer.data.hp = Math.min(mainPlayer.data.hp + 1, mainPlayer.data.maxHp);
    mainPlayer.drawHealthBar();
    // Spawn bots cho wave mới
    this.spawnWaveBots();
  }

  private healMainPlayer() {
    const mainPlayer = this.getMainPlayer();
    if (mainPlayer.data.maxHp != null && mainPlayer.data.hp < mainPlayer.data.maxHp) {
      mainPlayer.data.hp = Math.min(mainPlayer.data.hp + HEAL_AMOUNT, mainPlayer.data.maxHp);
      mainPlayer.drawHealthBar();

      // Tạo hiệu ứng heal đẹp
      createHealEffect(this.scene.add, this.scene.tweens, mainPlayer.data.x, mainPlayer.data.y);
    }
  }

  public onBotKilled() {
    this.botsKilledThisWave++;

    // Kiểm tra nếu đã giết đủ số bot để được heal
    if (this.botsKilledThisWave >= BOTS_KILLED_FOR_HEAL) {
      this.healMainPlayer();
      this.botsKilledThisWave = 0; // Reset counter sau khi heal
    }
  }

  public getPlayers(): Player[] {
    return this.players;
  }

  public getMainPlayer(): Player {
    return this.players[0];
  }

  public getRespawnTimers(): number[] {
    return this.respawnTimers;
  }

  public getRespawnTexts(): (Phaser.GameObjects.Text | null)[] {
    return this.respawnTexts;
  }

  public updatePlayerMovement(delta: number, movementVector: { dx: number; dy: number }) {
    const mainPlayer = this.players[0];

    if (this.respawnTimers[0] <= 0) {
      const { dx, dy } = movementVector;
      if (dx !== 0 || dy !== 0) {
        const newX = Math.max(
          PLAYER_RADIUS,
          Math.min(800 - PLAYER_RADIUS, mainPlayer.data.x + dx * PLAYER_SPEED * (delta / 1000))
        );
        const newY = Math.max(
          PLAYER_RADIUS,
          Math.min(600 - PLAYER_RADIUS, mainPlayer.data.y + dy * PLAYER_SPEED * (delta / 1000))
        );

        // Chỉ di chuyển nếu không va chạm obstacle
        if (!this.gameWorld.isCollidingWithObstacle(newX, newY, PLAYER_RADIUS)) {
          mainPlayer.setPosition(newX, newY);
        }
      }
    }
  }

  public updateBotMovement(delta: number) {
    const currentWave = this.gameState.getCurrentWave();
    const speedMultiplier = BASE_BOT_SPEED + (currentWave - 1) * BOT_SPEED_INCREASE_PER_WAVE;
    const mainPlayer = this.players[0];
    for (let i = 1; i < this.players.length; i++) {
      const bot = this.players[i];
      if (this.respawnTimers[i] > 0) continue;
      if (bot instanceof BossBot) {
        // BossBot dùng AI riêng
        bot.updateAI(mainPlayer, delta, null); // bulletManager sẽ truyền ở updateBotShooting
        continue;
      }
      // Bot thường
      this.botMoveTimers[i] -= delta;
      if (this.botMoveTimers[i] <= 0) {
        const angle = Math.random() * Math.PI * 2;
        bot.data._moveDir = { x: Math.cos(angle), y: Math.sin(angle) };
        this.botMoveTimers[i] = Math.random() * 2000 + 1000;
      }
      if (bot.data._moveDir) {
        const speed = PLAYER_SPEED * speedMultiplier;
        const newX = Math.max(
          PLAYER_RADIUS,
          Math.min(800 - PLAYER_RADIUS, bot.data.x + bot.data._moveDir.x * speed * (delta / 1000))
        );
        const newY = Math.max(
          PLAYER_RADIUS,
          Math.min(600 - PLAYER_RADIUS, bot.data.y + bot.data._moveDir.y * speed * (delta / 1000))
        );
        if (!this.gameWorld.isCollidingWithObstacle(newX, newY, PLAYER_RADIUS)) {
          bot.setPosition(newX, newY);
        }
      }
    }
  }

  public updateBotShooting(delta: number, bulletManager: any) {
    const currentWave = this.gameState.getCurrentWave();
    const shootRateMultiplier = 1 - (currentWave - 1) * BOT_SHOOT_RATE_INCREASE_PER_WAVE;
    const baseInterval = BASE_BOT_SHOOT_INTERVAL * shootRateMultiplier;
    const mainPlayer = this.players[0];
    for (let i = 1; i < this.players.length; i++) {
      const bot = this.players[i];
      if (this.respawnTimers[i] > 0) continue;
      if (bot instanceof BossBot) {
        // BossBot dùng AI riêng (truyền bulletManager)
        bot.updateAI(mainPlayer, delta, bulletManager);
        continue;
      }
      // Bot thường
      this.botShootTimers[i] -= delta;
      if (this.botShootTimers[i] <= 0) {
        bulletManager.shootBotBullet(bot, mainPlayer);
        this.botShootTimers[i] = Math.random() * baseInterval * 0.5 + baseInterval * 0.5;
      }
    }
  }

  public updateRespawnTimers(delta: number) {
    for (let i = 0; i < this.respawnTimers.length; i++) {
      if (this.respawnTimers[i] > 0) {
        this.respawnTimers[i] -= delta;
        if (this.respawnTexts[i]) {
          const secondsLeft = Math.ceil(this.respawnTimers[i] / 1000);
          this.respawnTexts[i]?.setText(secondsLeft.toString());
        }
        if (this.respawnTimers[i] <= 0) {
          if (i === 0) {
            // Player chính respawn bình thường
            const spawnPoint = this.gameWorld.getRandomSpawnPoint();
            respawnPlayer(this.players, this.respawnTimers, this.respawnTexts, this.scene.tweens, i, () => spawnPoint);
          } else {
            // Bot chết - xóa bot và không respawn
            this.removeDeadBot(i);
          }
        }
      }
    }
  }

  private removeDeadBot(botIndex: number) {
    // onBotKilled đã được gọi từ BulletManager khi bot bị giết

    // Xóa bot chết
    this.players[botIndex].destroy();
    this.players.splice(botIndex, 1);
    this.respawnTimers.splice(botIndex, 1);
    this.botMoveTimers.splice(botIndex, 1);
    this.botShootTimers.splice(botIndex, 1);
    this.respawnTexts[botIndex]?.destroy();
    this.respawnTexts.splice(botIndex, 1);

    // Không spawn bot mới - để wave system kiểm tra
  }

  public updateGunDirections(pointer: Phaser.Input.Pointer) {
    const mainPlayer = this.players[0];
    mainPlayer.updateGunDirection(pointer.worldX, pointer.worldY);

    // Bot hướng mũi súng về phía player chính
    for (let i = 1; i < this.players.length; i++) {
      const bot = this.players[i];
      if (this.respawnTimers[i] > 0) continue;
      bot.updateGunDirection(mainPlayer.data.x, mainPlayer.data.y);
    }
  }

  public destroy() {
    this.players.forEach((player) => player.destroy());
    this.respawnTexts.forEach((text) => text?.destroy());
    this.players = [];
    this.respawnTimers = [];
    this.respawnTexts = [];
    this.botMoveTimers = [];
    this.botShootTimers = [];
    this.currentBotCount = 0;
    this.botIdCounter = 0;
  }

  public getCurrentBotCount(): number {
    return this.currentBotCount;
  }

  public getCurrentWave(): number {
    return this.gameState.getCurrentWave();
  }

  public getHealProgress(): { current: number; required: number } {
    return {
      current: this.botsKilledThisWave,
      required: BOTS_KILLED_FOR_HEAL,
    };
  }
}
