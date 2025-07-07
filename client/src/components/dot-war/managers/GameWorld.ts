import type Phaser from 'phaser';
import { PLAYER_RADIUS } from '../constants/constants';
import { isCollidingObstacle } from '../utils/playerUtils';

export class GameWorld {
  private scene: Phaser.Scene;
  private obstacles: Phaser.GameObjects.Rectangle[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createObstacles();
  }

  private createObstacles() {
    const minSize = 60;
    const maxSize = 100;

    // Chia map thành các vùng nhỏ hơn để đảm bảo đủ chỗ
    const zones = [
      { x1: 100, y1: 100, x2: 250, y2: 250 },
      { x1: 550, y1: 100, x2: 700, y2: 250 },
      { x1: 100, y1: 350, x2: 250, y2: 500 },
      { x1: 550, y1: 350, x2: 700, y2: 500 },
      { x1: 300, y1: 200, x2: 500, y2: 400 },
    ];

    // Đầu tiên đặt 4 obstacles ở 4 vùng đầu tiên
    for (let i = 0; i < 4; i++) {
      const zone = zones[i];
      const w = minSize + Math.random() * (maxSize - minSize);
      const h = minSize + Math.random() * (maxSize - minSize);

      const x = zone.x1 + (zone.x2 - zone.x1 - w) / 2;
      const y = zone.y1 + (zone.y2 - zone.y1 - h) / 2;

      const rect = this.scene.add.rectangle(x, y, w, h, 0x444444, 1).setStrokeStyle(2, 0xffffff, 0.7).setDepth(10);
      this.obstacles.push(rect);
    }

    // Thêm 1-2 obstacles nữa nếu còn chỗ
    const extraObstacles = Math.floor(Math.random() * 2);
    if (extraObstacles > 0 && zones.length > 4) {
      const zone = zones[4];
      const w = minSize + Math.random() * (maxSize - minSize);
      const h = minSize + Math.random() * (maxSize - minSize);

      const x = zone.x1 + (zone.x2 - zone.x1 - w) / 2;
      const y = zone.y1 + (zone.y2 - zone.y1 - h) / 2;

      const rect = this.scene.add.rectangle(x, y, w, h, 0x444444, 1).setStrokeStyle(2, 0xffffff, 0.7).setDepth(10);
      this.obstacles.push(rect);
    }
  }

  public getRandomSpawnPoint() {
    const margin = PLAYER_RADIUS * 2; // Giảm margin để tăng phạm vi di chuyển
    let maxTries = 50;

    while (maxTries > 0) {
      const x = margin + Math.random() * (800 - margin * 2);
      const y = margin + Math.random() * (600 - margin * 2);

      if (!isCollidingObstacle(this.obstacles, x, y, PLAYER_RADIUS * 2)) {
        return { x, y };
      }
      maxTries--;
    }

    // Fallback: tìm điểm xa obstacles nhất
    let bestPos = { x: 400, y: 300 };
    let maxMinDistance = 0;

    for (let i = 0; i < 20; i++) {
      const x = margin + Math.random() * (800 - margin * 2);
      const y = margin + Math.random() * (600 - margin * 2);

      let minDistance = Number.MAX_VALUE;
      for (const obstacle of this.obstacles) {
        const dx = x - obstacle.x;
        const dy = y - obstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        minDistance = Math.min(minDistance, distance);
      }

      if (minDistance > maxMinDistance) {
        maxMinDistance = minDistance;
        bestPos = { x, y };
      }
    }

    return bestPos;
  }

  public isCollidingWithObstacle(x: number, y: number, radius: number): boolean {
    return isCollidingObstacle(this.obstacles, x, y, radius);
  }

  public getObstacles(): Phaser.GameObjects.Rectangle[] {
    return this.obstacles;
  }

  public destroy() {
    this.obstacles.forEach((obstacle) => obstacle.destroy());
    this.obstacles = [];
  }
}
