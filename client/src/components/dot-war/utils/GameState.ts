import { WAVE_BREAK_TIME } from '../constants/constants';

export class GameState {
  private survivalTime: number = 0;
  private survivalTarget: number = 5 * 60 * 1000; // 5 minutes target
  private isSurvivalMode: boolean = true;
  private gameOver: boolean = false;
  private isPaused: boolean = false;
  private highScore: number = 0;

  // Wave System
  private currentWave: number = 1;
  private waveStartTime: number = 0;
  private waveBreakTimer: number = 0;
  private isWaveBreak: boolean = false;
  private onWaveStartCallback?: (wave: number) => void;

  constructor() {
    this.highScore = parseInt(localStorage.getItem('dotWarHighScore') || '0');
  }

  public updateSurvivalTime(delta: number) {
    if (this.isSurvivalMode && !this.gameOver && !this.isPaused) {
      this.survivalTime += delta;
      this.updateWave(delta);
    }
  }

  private updateWave(delta: number) {
    if (this.isWaveBreak) {
      this.waveBreakTimer -= delta;
      if (this.waveBreakTimer <= 0) {
        this.startNewWave();
      }
    }
    // Không tự động kết thúc wave theo thời gian - chỉ kết thúc khi tất cả bot chết
  }

  private startNewWave() {
    this.currentWave++;
    this.waveStartTime = this.survivalTime;
    this.isWaveBreak = false;
    this.waveBreakTimer = 0;

    // Call callback if set
    if (this.onWaveStartCallback) {
      this.onWaveStartCallback(this.currentWave);
    }
  }

  private endWave() {
    this.isWaveBreak = true;
    this.waveBreakTimer = WAVE_BREAK_TIME;
  }

  public endCurrentWave() {
    this.endWave();
  }

  public getCurrentWave(): number {
    return this.currentWave;
  }

  public isWaveBreakActive(): boolean {
    return this.isWaveBreak;
  }

  public getWaveBreakTimeLeft(): number {
    return Math.max(0, this.waveBreakTimer);
  }

  public getWaveTimeLeft(): number {
    // Không còn dùng thời gian wave
    return 0;
  }

  public getWaveProgress(): number {
    // Không còn dùng progress theo thời gian
    return 0;
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
    this.currentWave = 1;
    this.waveStartTime = 0;
    this.waveBreakTimer = 0;
    this.isWaveBreak = false;
  }

  public startFirstWave() {
    this.currentWave = 1;
    this.waveStartTime = 0;
    this.isWaveBreak = false;
    this.waveBreakTimer = 0;
  }

  public setOnWaveStartCallback(callback: (wave: number) => void) {
    this.onWaveStartCallback = callback;
  }
}
