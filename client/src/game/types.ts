export interface PlayerData {
  id: string;
  x: number;
  y: number;
  color: string;
  isMain: boolean;
  hp: number;
}

export interface BulletData {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  trail?: Phaser.GameObjects.Arc;
}

export interface BotData extends PlayerData {
  aiType: 'random' | 'chase' | 'shoot';
} 