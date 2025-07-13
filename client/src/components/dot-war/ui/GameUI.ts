import type Phaser from 'phaser';
import type { Player } from '../entities/Player';
import { updateLeaderboard } from '../utils/playerUtils';

export class GameUI {
  private scene: Phaser.Scene;
  private leaderboardText!: Phaser.GameObjects.Text;
  private survivalTimer!: Phaser.GameObjects.Text;
  private waveInfoText!: Phaser.GameObjects.Text;
  private waveProgressBar!: Phaser.GameObjects.Graphics;
  private bossHealthBar!: Phaser.GameObjects.Graphics;
  private bossHealthText!: Phaser.GameObjects.Text;
  private pauseMenu!: Phaser.GameObjects.Container;
  private youLineText?: Phaser.GameObjects.Text;
  private ultimateHintText?: Phaser.GameObjects.Text;
  private highScore: number = 0;
  private isBossActive: boolean = false;
  private lastMilestone: { value: number } = { value: 0 };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.highScore = parseInt(localStorage.getItem('dotWarHighScore') || '0');
    this.initializeUI();
  }

  private initializeUI() {
    this.createLeaderboard();
    this.createSurvivalTimer();
    this.createWaveInfo();
    this.createBossHealthBar();
    this.createPauseMenu();
    this.createUltimateHint();
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

  private createWaveInfo() {
    this.waveInfoText = this.scene.add.text(20, 60, 'Wave: 1', {
      font: '20px Arial',
      color: '#ffff00',
      fontStyle: 'bold',
    });
    this.waveInfoText.setDepth(100);

    // Create wave progress bar
    this.waveProgressBar = this.scene.add.graphics();
    this.waveProgressBar.setDepth(100);
  }

  private createBossHealthBar() {
    this.bossHealthBar = this.scene.add.graphics();
    this.bossHealthBar.setDepth(100);

    this.bossHealthText = this.scene.add.text(400, 15, '', {
      font: 'bold 20px Arial',
      color: '#ff2222',
      stroke: '#000',
      strokeThickness: 3,
    });
    this.bossHealthText.setOrigin(0.5);
    this.bossHealthText.setDepth(100);

    this.hideBossHealthBar();
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
      .text(0, 0, 'Press ESC to resume\nClick to shoot\nWASD to move\nQ or SPACE for Ultimate', {
        font: '24px Arial',
        color: '#ccc',
        align: 'center',
      })
      .setOrigin(0.5);
    this.pauseMenu.add([overlay, title, instructions]);
    this.pauseMenu.setVisible(false);
  }

  private createUltimateHint() {
    this.ultimateHintText = this.scene.add.text(20, 550, 'Press Q or SPACE for Ultimate Skill', {
      font: '16px Arial',
      color: '#ffe066',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2,
    });
    this.ultimateHintText.setDepth(100);
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

  public updateWaveInfo(
    currentWave: number,
    _waveProgress: number,
    isWaveBreak: boolean,
    waveBreakTimeLeft: number,
    aliveBots: number,
    targetBotCount: number
  ) {
    // Update wave text
    if (isWaveBreak) {
      const breakSeconds = Math.ceil(waveBreakTimeLeft / 1000);
      this.waveInfoText.setText(`Wave ${currentWave} Complete! Next wave in ${breakSeconds}s`);
      this.waveInfoText.setColor('#00ffff');
    } else {
      this.waveInfoText.setText(`Wave: ${currentWave} - Bots: ${aliveBots}`);
      this.waveInfoText.setColor('#ffff00');
    }

    // Update progress bar - hiển thị số bot còn lại
    this.waveProgressBar.clear();

    if (!isWaveBreak) {
      // Draw progress bar background
      this.waveProgressBar.fillStyle(0x333333, 0.8);
      this.waveProgressBar.fillRect(20, 85, 200, 10);

      // Draw progress bar fill based on bots remaining
      const progress = aliveBots / targetBotCount;
      const progressColor = progress < 0.3 ? 0xff0000 : progress < 0.6 ? 0xffff00 : 0x00ff00;
      this.waveProgressBar.fillStyle(progressColor, 1);
      this.waveProgressBar.fillRect(20, 85, 200 * (1 - progress), 10);

      // Draw progress bar border
      this.waveProgressBar.lineStyle(2, 0xffffff, 1);
      this.waveProgressBar.strokeRect(20, 85, 200, 10);
    }
  }

  public updateLeaderboard(players: Player[]) {
    updateLeaderboard(
      players,
      this.leaderboardText,
      this.youLineText,
      (t) => {
        this.youLineText = t;
      },
      this.scene.add,
      this.scene.tweens,
      this.lastMilestone,
      (milestone) => {
        this.lastMilestone = milestone;
      }
    );
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

  public showBossHealthBar(bossHP: number, maxHP: number) {
    this.isBossActive = true;
    this.bossHealthBar.setVisible(true);
    this.bossHealthText.setVisible(true);
    this.updateBossHealthBar(bossHP, maxHP);
  }

  public hideBossHealthBar() {
    this.isBossActive = false;
    this.bossHealthBar.setVisible(false);
    this.bossHealthText.setVisible(false);
  }

  public updateBossHealthBar(bossHP: number, maxHP: number) {
    if (!this.isBossActive) return;

    const barWidth = 300;
    const barHeight = 20;
    const x = 400 - barWidth / 2;
    const y = 10;

    // Clear previous bar
    this.bossHealthBar.clear();

    // Background
    this.bossHealthBar.fillStyle(0x333333, 0.8);
    this.bossHealthBar.fillRect(x, y, barWidth, barHeight);

    // Health bar
    const hpPercent = Math.max(0, bossHP) / maxHP;
    let healthColor = 0x00ff00; // Green
    if (hpPercent < 0.3) {
      healthColor = 0xff0000; // Red
    } else if (hpPercent < 0.6) {
      healthColor = 0xffff00; // Yellow
    }

    this.bossHealthBar.fillStyle(healthColor, 1);
    this.bossHealthBar.fillRect(x, y, barWidth * hpPercent, barHeight);

    // Border
    this.bossHealthBar.lineStyle(3, 0xff2222, 1);
    this.bossHealthBar.strokeRect(x, y, barWidth, barHeight);

    // Text
    this.bossHealthText.setText(`BOSS HP: ${bossHP}/${maxHP}`);
  }

  public updateUltimateHint(hasEnoughEnergy: boolean) {
    if (this.ultimateHintText) {
      this.ultimateHintText.setVisible(hasEnoughEnergy);
      if (hasEnoughEnergy) {
        this.ultimateHintText.setColor('#ffe066');
        this.ultimateHintText.setText('Press Q or SPACE for Ultimate Skill');
      } else {
        this.ultimateHintText.setColor('#666666');
        this.ultimateHintText.setText('Ultimate Skill: Collect energy orbs');
      }
    }
  }

  public resetMilestone() {
    this.lastMilestone = { value: 0 };
  }

  public destroy() {
    // Clean up UI elements
    if (this.leaderboardText) this.leaderboardText.destroy();
    if (this.survivalTimer) this.survivalTimer.destroy();
    if (this.waveInfoText) this.waveInfoText.destroy();
    if (this.waveProgressBar) this.waveProgressBar.destroy();
    if (this.bossHealthBar) this.bossHealthBar.destroy();
    if (this.bossHealthText) this.bossHealthText.destroy();
    if (this.pauseMenu) this.pauseMenu.destroy();
    if (this.youLineText) this.youLineText.destroy();
    if (this.ultimateHintText) this.ultimateHintText.destroy();
  }
}
