export interface PlayerData {
  id: string;
  name?: string;
  x: number;
  y: number;
  color: string;
  isMain: boolean;
  hp: number;
  score: number;
  _moveDir?: { x: number; y: number };
  energy?: number;
  maxEnergy?: number;
}

export interface BulletData {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  ownerId: string;
  trail?: Phaser.GameObjects.Arc;
  isUltimate?: boolean;
}

export interface BotData extends PlayerData {
  aiType: 'random' | 'chase' | 'shoot';
} 