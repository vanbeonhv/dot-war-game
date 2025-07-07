import type Phaser from 'phaser';
import { NUM_FAKE_PLAYERS, PLAYER_COLORS, PLAYER_RADIUS, PLAYER_SPEED } from '../constants/constants';
import { Player } from '../entities/Player';
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

  constructor(scene: Phaser.Scene, gameWorld: GameWorld) {
    this.scene = scene;
    this.gameWorld = gameWorld;
    this.initializePlayers();
  }

  private initializePlayers() {
    // Tạo vị trí spawn ngẫu nhiên cho player chính
    const mainSpawnPoint = this.gameWorld.getRandomSpawnPoint();

    // Tạo players với vị trí spawn đã định sẵn
    this.players = [
      new Player(this.scene, {
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
        const botSpawnPoint = this.gameWorld.getRandomSpawnPoint();
        return new Player(this.scene, {
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

        if (!this.gameWorld.isCollidingWithObstacle(newX, newY, PLAYER_RADIUS)) {
          bot.setPosition(newX, newY);
        }
      }
    }
  }

  public updateBotShooting(delta: number, bulletManager: any) {
    for (let i = 1; i < this.players.length; i++) {
      const bot = this.players[i];
      if (this.respawnTimers[i] > 0) continue;

      // Bắn về phía player chính
      this.botShootTimers[i] -= delta;
      if (this.botShootTimers[i] <= 0) {
        const player = this.players[0];
        bulletManager.shootBotBullet(bot, player);
        this.botShootTimers[i] = Math.random() * 1500 + 800;
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
          // Tạo vị trí spawn ngẫu nhiên khi respawn
          const spawnPoint = this.gameWorld.getRandomSpawnPoint();
          respawnPlayer(this.players, this.respawnTimers, this.respawnTexts, this.scene.tweens, i, () => spawnPoint);
        }
      }
    }
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
  }
}
