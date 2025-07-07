export class GameState {
  private survivalTime: number = 0;
  private survivalTarget: number = 5 * 60 * 1000; // 5 minutes target
  private isSurvivalMode: boolean = true;
  private gameOver: boolean = false;
  private isPaused: boolean = false;
  private highScore: number = 0;

  constructor() {
    this.highScore = parseInt(localStorage.getItem('dotWarHighScore') || '0');
  }

  public updateSurvivalTime(delta: number) {
    if (this.isSurvivalMode && !this.gameOver) {
      this.survivalTime += delta;
    }
  }

  public isSurvivalTargetReached(): boolean {
    return this.survivalTime >= this.survivalTarget;
  }

  public getSurvivalTime(): number {
    return this.survivalTime;
  }

  public getSurvivalTarget(): number {
    return this.survivalTarget;
  }

  public isGameOver(): boolean {
    return this.gameOver;
  }

  public setGameOver(value: boolean) {
    this.gameOver = value;
  }

  public getPaused(): boolean {
    return this.isPaused;
  }

  public setPaused(value: boolean) {
    this.isPaused = value;
  }

  public getHighScore(): number {
    return this.highScore;
  }

  public setHighScore(score: number) {
    this.highScore = score;
    localStorage.setItem('dotWarHighScore', score.toString());
  }

  public reset() {
    this.survivalTime = 0;
    this.gameOver = false;
    this.isPaused = false;
  }
}
