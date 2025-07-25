import Phaser from 'phaser';
import { BulletManager } from '../managers/BulletManager';
import { GameWorld } from '../managers/GameWorld';
import { PlayerManager } from '../managers/PlayerManager';
import { PowerUpManager } from '../managers/PowerUpManager';
import { GameUI } from '../ui/GameUI';
import { createUltimateEffect } from '../utils/effects';
import { GameInput } from '../utils/GameInput';
import { GameState } from '../utils/GameState';
import { updateScore } from '../utils/playerUtils';
import { applyPowerUpEffect } from '../utils/powerUpEffects';

export default class GameScene extends Phaser.Scene {
  private gameInput!: GameInput;
  private gameUI!: GameUI;
  private gameWorld!: GameWorld;
  private gameState!: GameState;
  private playerManager!: PlayerManager;
  private bulletManager!: BulletManager;
  private powerUpManager!: PowerUpManager;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {}

  create() {
    // Initialize all managers
    this.gameState = new GameState();
    this.gameWorld = new GameWorld(this);

    // Setup wave callback before initializing PlayerManager
    this.gameState.setOnWaveStartCallback((_wave: number) => {
      this.playerManager.onWaveStart();
    });

    this.playerManager = new PlayerManager(this, this.gameWorld, this.gameState);
    this.bulletManager = new BulletManager(this, this.gameWorld, this.playerManager);
    this.gameInput = new GameInput(this);
    this.gameUI = new GameUI(this);

    // Initialize PowerUpManager
    this.powerUpManager = new PowerUpManager(this, (x, y, radius) =>
      this.gameWorld.isCollidingWithObstacle(x, y, radius)
    );

    // Setup input handlers
    this.setupInputHandlers();

    // Setup event listeners
    this.events.on('mainPlayerDeath', () => {
      this.handleSurvivalGameOver();
    });

    // Start first wave - đảm bảo wave 1 có bot
    this.gameState.startFirstWave();
    this.playerManager.onWaveStart();
  }

  private setupInputHandlers() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.gameState.getPaused() && this.playerManager.getRespawnTimers()[0] <= 0) {
        this.bulletManager.shootBullet(pointer.x, pointer.y);
      }
    });
  }

  update(time: number, delta: number) {
    // Handle pause input
    if (this.gameInput.isPausePressed()) {
      this.togglePause();
    }

    if (this.gameState.getPaused()) {
      return;
    }

    // Update survival timer and wave system
    if (!this.gameState.isGameOver() && this.playerManager.getRespawnTimers()[0] <= 0) {
      this.gameState.updateSurvivalTime(delta);
      this.gameUI.updateSurvivalTimer(this.gameState.getSurvivalTime(), this.gameState.getSurvivalTarget());

      // Update wave system
      this.playerManager.updateWaveSystem();

      // Update wave UI
      const aliveBots = this.playerManager
        .getPlayers()
        .filter((_p, i) => i > 0 && this.playerManager.getRespawnTimers()[i] <= 0).length;
      this.gameUI.updateWaveInfo(
        this.gameState.getCurrentWave(),
        this.gameState.getWaveProgress(),
        this.gameState.isWaveBreakActive(),
        this.gameState.getWaveBreakTimeLeft(),
        aliveBots,
        this.playerManager.getCurrentBotCount()
      );

      // Update heal progress UI
      const healProgress = this.playerManager.getHealProgress();
      this.gameUI.updateHealProgress(healProgress.current, healProgress.required);

      // Update boss health bar
      const boss = this.playerManager.getPlayers().find((p) => p.data.name === 'BOSS');
      if (boss && this.playerManager.getRespawnTimers()[this.playerManager.getPlayers().indexOf(boss)] <= 0) {
        this.gameUI.showBossHealthBar(boss.data.hp, 20 + Math.floor(this.gameState.getCurrentWave() / 5) * 10);
      } else {
        this.gameUI.hideBossHealthBar();
      }

      // Check if target reached
      if (this.gameState.isSurvivalTargetReached()) {
        this.handleSurvivalVictory();
      }
    }

    // Update gun directions
    const pointer = this.input.activePointer;
    this.playerManager.updateGunDirections(pointer);

    // Update ultimate hint based on energy
    if (this.playerManager.getRespawnTimers()[0] <= 0) {
      const hasEnoughEnergy =
        (this.playerManager.getMainPlayer().data.energy ?? 0) >=
        (this.playerManager.getMainPlayer().data.maxEnergy ?? 5);
      this.gameUI.updateUltimateHint(hasEnoughEnergy);
    }

    // Handle ultimate ability
    if (
      (this.gameInput.isUltimatePressed() || this.gameInput.isSpacePressed()) &&
      (this.playerManager.getMainPlayer().data.energy ?? 0) >=
        (this.playerManager.getMainPlayer().data.maxEnergy ?? 5) &&
      this.playerManager.getRespawnTimers()[0] <= 0
    ) {
      this.bulletManager.shootUltimateBullet(pointer.worldX, pointer.worldY);
      this.playerManager.getMainPlayer().data.energy = 0;
      this.playerManager.getMainPlayer().drawHealthBar();
      createUltimateEffect(
        this.add,
        this.tweens,
        this.playerManager.getMainPlayer().data.x,
        this.playerManager.getMainPlayer().data.y
      );
    }

    // Update player movement
    const movementVector = this.gameInput.getMovementVector();
    this.playerManager.updatePlayerMovement(delta, movementVector);

    // Update bullets and collisions
    this.bulletManager.updateBullets(
      delta,
      (players: any, _playerIndex: number, bulletOwnerId: string, updateLeaderboardFn: () => void) => {
        updateScore(
          players,
          this.gameState.getHighScore(),
          (score: number) => {
            this.gameState.setHighScore(score);
          },
          bulletOwnerId,
          updateLeaderboardFn
        );
      },
      () => this.gameUI.updateLeaderboard(this.playerManager.getPlayers()),
      this.playerManager.getRespawnTimers(),
      this.playerManager.getRespawnTexts()
    );

    // Update respawn timers
    this.playerManager.updateRespawnTimers(delta);

    // Update bot movement and shooting
    this.playerManager.updateBotMovement(delta);
    this.playerManager.updateBotShooting(delta, this.bulletManager);

    // Update PowerUpManager
    this.powerUpManager.update(time, delta);

    // Check power-up collisions
    if (this.playerManager.getRespawnTimers()[0] <= 0) {
      const mainPlayer = this.playerManager.getMainPlayer();
      const collectedPowerUp = this.powerUpManager.checkPlayerCollision(
        mainPlayer.data.x,
        mainPlayer.data.y,
        20 // PLAYER_RADIUS
      );

      if (collectedPowerUp) {
        applyPowerUpEffect(
          mainPlayer,
          collectedPowerUp,
          this.add,
          this.tweens,
          this.time,
          this.gameInput.cursors,
          this.gameInput.aKey,
          this.gameInput.dKey,
          this.gameInput.wKey,
          this.gameInput.sKey
        );
      }

      // Update shield position when player moves
      mainPlayer.updateShieldPosition();
    }
  }

  private togglePause() {
    const newPausedState = !this.gameState.getPaused();
    this.gameState.setPaused(newPausedState);

    if (newPausedState) {
      this.gameUI.showPauseMenu();
    } else {
      this.gameUI.hidePauseMenu();
    }
  }

  private handleSurvivalVictory() {
    this.gameState.setGameOver(true);
    this.gameUI.showVictoryScreen(this.gameState.getSurvivalTime());
    this.setupRestartHandler();
    this.gameState.setPaused(true);
  }

  private handleSurvivalGameOver() {
    this.gameState.setGameOver(true);
    this.gameUI.showGameOverScreen(this.gameState.getSurvivalTime());
    this.setupRestartHandler();
    this.gameState.setPaused(true);
  }

  private setupRestartHandler() {
    if (this.gameInput.spaceKey) {
      this.gameInput.spaceKey.on('down', () => {
        this.resetGame();
      });
    }
  }

  shutdown() {
    // Clean up all managers
    this.gameInput.destroy();
    this.gameUI.destroy();
    this.gameWorld.destroy();
    this.playerManager.destroy();
    this.bulletManager.destroy();
    if (this.powerUpManager) {
      this.powerUpManager.destroy();
    }

    // Reset game state
    this.gameState.reset();

    // Clean up event listeners
    this.input.keyboard?.removeAllListeners();
    this.input.removeAllListeners();

    // Destroy all game objects
    this.children.removeAll(true);
  }

  private resetGame() {
    // Reset all game state
    this.gameState.reset();

    // Reset milestone tracking
    this.gameUI.resetMilestone();

    // Clean up all managers
    this.gameInput.destroy();
    this.gameUI.destroy();
    this.gameWorld.destroy();
    this.playerManager.destroy();
    this.bulletManager.destroy();
    if (this.powerUpManager) {
      this.powerUpManager.destroy();
    }

    // Remove all game objects
    this.children.removeAll(true);

    // Restart the scene
    this.scene.restart();

    // Sau khi restart, sẽ gọi lại create(), cần khởi tạo wave đầu tiên
    // (Có thể cần truyền flag hoặc custom event nếu muốn tinh chỉnh sâu hơn)
    // Nhưng với restart scene, create() sẽ chạy lại từ đầu.
  }
}
