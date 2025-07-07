import type Phaser from 'phaser';
import type { Player } from '../entities/Player';
import { updateLeaderboard } from '../utils/playerUtils';

export class GameUI {
  private scene: Phaser.Scene;
  private leaderboardText!: Phaser.GameObjects.Text;
  private survivalTimer!: Phaser.GameObjects.Text;
  private pauseMenu!: Phaser.GameObjects.Container;
  private youLineText?: Phaser.GameObjects.Text;
  private highScore: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.highScore = parseInt(localStorage.getItem('dotWarHighScore') || '0');
    this.initializeUI();
  }

  private initializeUI() {
    this.createLeaderboard();
    this.createSurvivalTimer();
    this.createPauseMenu();
  }

  private createLeaderboard() {
    this.leaderboardText = this.scene.add.text(600, 20, '', {
      font: '20px Arial',
      color: '#fff',
      align: 'right',
      wordWrap: { width: 200 },
      fontStyle: 'normal',
      // @ts-ignore
      rich: true,
    });
    this.leaderboardText.setDepth(100);
  }

  private createSurvivalTimer() {
    this.survivalTimer = this.scene.add.text(20, 20, 'Survival Time: 00:00', {
      font: '24px Arial',
      color: '#00ff00',
      fontStyle: 'bold',
    });
    this.survivalTimer.setDepth(100);
  }

  private createPauseMenu() {
    const overlay = this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    this.pauseMenu = this.scene.add.container(400, 300);
    const title = this.scene.add
      .text(0, -50, 'GAME PAUSED', {
        font: '48px Arial',
        color: '#fff',
      })
      .setOrigin(0.5);
    const instructions = this.scene.add
      .text(0, 0, 'Press ESC to resume\nClick to shoot\nWASD to move', {
        font: '24px Arial',
        color: '#ccc',
        align: 'center',
      })
      .setOrigin(0.5);
    this.pauseMenu.add([overlay, title, instructions]);
    this.pauseMenu.setVisible(false);
  }

  public updateSurvivalTimer(survivalTime: number, survivalTarget: number) {
    const minutes = Math.floor(survivalTime / 60000);
    const seconds = Math.floor((survivalTime % 60000) / 1000);
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Change color based on time remaining
    const timeRemaining = survivalTarget - survivalTime;
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

  public updateLeaderboard(players: Player[]) {
    updateLeaderboard(players, this.leaderboardText, this.youLineText, (t) => {
      this.youLineText = t;
    });
  }

  public showPauseMenu() {
    this.pauseMenu.setVisible(true);
  }

  public hidePauseMenu() {
    this.pauseMenu.setVisible(false);
  }

  public showVictoryScreen(survivalTime: number) {
    const victoryText = this.scene.add.text(400, 250, 'SURVIVAL VICTORY!', {
      font: '48px Arial',
      color: '#00ff00',
      fontStyle: 'bold',
    });
    victoryText.setOrigin(0.5);
    victoryText.setDepth(200);

    const timeText = this.scene.add.text(
      400,
      320,
      `You survived for ${Math.floor(survivalTime / 60000)}:${Math.floor((survivalTime % 60000) / 1000)
        .toString()
        .padStart(2, '0')}`,
      {
        font: '24px Arial',
        color: '#ffffff',
      }
    );
    timeText.setOrigin(0.5);
    timeText.setDepth(200);

    const restartText = this.scene.add.text(400, 380, 'Press SPACE to restart', {
      font: '20px Arial',
      color: '#ffff00',
    });
    restartText.setOrigin(0.5);
    restartText.setDepth(200);
  }

  public showGameOverScreen(survivalTime: number) {
    const gameOverText = this.scene.add.text(400, 250, 'GAME OVER', {
      font: '48px Arial',
      color: '#ff0000',
      fontStyle: 'bold',
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(200);

    const timeText = this.scene.add.text(
      400,
      320,
      `You survived for ${Math.floor(survivalTime / 60000)}:${Math.floor((survivalTime % 60000) / 1000)
        .toString()
        .padStart(2, '0')}`,
      {
        font: '24px Arial',
        color: '#ffffff',
      }
    );
    timeText.setOrigin(0.5);
    timeText.setDepth(200);

    const restartText = this.scene.add.text(400, 380, 'Press SPACE to restart', {
      font: '20px Arial',
      color: '#ffff00',
    });
    restartText.setOrigin(0.5);
    restartText.setDepth(200);
  }

  public destroy() {
    // Clean up UI elements
    if (this.leaderboardText) this.leaderboardText.destroy();
    if (this.survivalTimer) this.survivalTimer.destroy();
    if (this.pauseMenu) this.pauseMenu.destroy();
    if (this.youLineText) this.youLineText.destroy();
  }
}
