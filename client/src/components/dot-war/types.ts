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
  // Power-up related properties
  speed?: number;
  fireRate?: number;
  damage?: number;
  speedBoostActive?: boolean;
  rapidFireActive?: boolean;
  shieldActive?: boolean;
  doubleDamageActive?: boolean;
  originalSpeed?: number;
  originalFireRate?: number;
  originalDamage?: number;
  shieldHits?: number;
  shieldVisual?: Phaser.GameObjects.Arc;
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

export type PowerUpType = 'health' | 'energy' | 'speed' | 'rapid' | 'shield' | 'damage';

export interface PowerUpData {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  duration?: number; // thời gian hiệu lực (giây)
  value?: number; // giá trị (damage, speed boost, etc.)
  spawnTime: number; // thời điểm spawn (để tính auto destroy)
} 