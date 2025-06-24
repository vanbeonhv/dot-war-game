import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

// Tạo danh sách màu cho các player
const PLAYER_COLORS = ["#e63946", "#457b9d", "#f1faee", "#a8dadc", "#ffbe0b", "#8338ec", "#3a86ff"];
const PLAYER_RADIUS = 20;
const PLAYER_SPEED = 200;
const BULLET_SPEED = 400;
const BULLET_RADIUS = 5;
const RESPAWN_TIME = 3000; // 3 giây
const NUM_FAKE_PLAYERS = 5;

function getRandomPos(width: number, height: number) {
  return {
    x: Math.random() * (width - 2 * PLAYER_RADIUS) + PLAYER_RADIUS,
    y: Math.random() * (height - 2 * PLAYER_RADIUS) + PLAYER_RADIUS,
  };
}

// Tạo MainScene class sử dụng ES6 class thay vì Phaser.Class
class MainScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wKey!: Phaser.Input.Keyboard.Key;
  private aKey!: Phaser.Input.Keyboard.Key;
  private sKey!: Phaser.Input.Keyboard.Key;
  private dKey!: Phaser.Input.Keyboard.Key;
  private playerSprites: Phaser.GameObjects.Arc[] = [];
  private players: any[] = [];
  private bullets: Phaser.GameObjects.Arc[] = [];
  private bulletData: any[] = [];
  private respawnTimers: any[] = [];
  private respawnTexts: (Phaser.GameObjects.Text | null)[] = [];
  private playerNames: Phaser.GameObjects.Text[] = [];
  private score: number = 0;
  private highScore: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private isPaused: boolean = false;
  private pauseMenu!: Phaser.GameObjects.Container;
  private pauseKey!: Phaser.Input.Keyboard.Key;
  private wasPauseKeyPressed: boolean = false;

  constructor() {
    super({ key: "MainScene" });
  }

  preload() {}

  create() {
    const width = 800;
    const height = 600;
    
    // Load high score từ localStorage
    this.highScore = parseInt(localStorage.getItem('dotWarHighScore') || '0');
    
    // Tạo danh sách player (player chính + fake player)
    this.players = [
      {
        id: "me",
        ...getRandomPos(width, height),
        color: PLAYER_COLORS[0],
        isMain: true,
      },
      ...Array.from({ length: NUM_FAKE_PLAYERS }).map((_, i) => ({
        id: `fake_${i}`,
        ...getRandomPos(width, height),
        color: PLAYER_COLORS[(i + 1) % PLAYER_COLORS.length],
        isMain: false,
      })),
    ];

    // Khởi tạo respawn timers
    this.respawnTimers = this.players.map(() => 0);

    // Render các player
    this.playerSprites = this.players.map((p) =>
      this.add.circle(p.x, p.y, PLAYER_RADIUS, Phaser.Display.Color.HexStringToColor(p.color).color)
    );
    
    // Hiển thị tên trên đầu dot
    this.playerNames = this.players.map((p, i) => 
      this.add.text(p.x - 18, p.y - 35, p.isMain ? "You" : p.id, {
        font: "16px Arial",
        color: "#fff",
      })
    );
    
    // Hiển thị score
    this.scoreText = this.add.text(10, 10, `Score: ${this.score}`, {
      font: "24px Arial",
      color: "#fff",
    });
    
    this.highScoreText = this.add.text(10, 40, `High Score: ${this.highScore}`, {
      font: "20px Arial",
      color: "#ffff00",
    });
    
    // Input
    this.cursors = this.input?.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.wKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W) as Phaser.Input.Keyboard.Key;
    this.aKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A) as Phaser.Input.Keyboard.Key;
    this.sKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S) as Phaser.Input.Keyboard.Key;
    this.dKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D) as Phaser.Input.Keyboard.Key;
    this.pauseKey = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) as Phaser.Input.Keyboard.Key;

    // Thêm click event để bắn đạn
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isPaused) {
        this.shootBullet(pointer.x, pointer.y);
      }
    });

    // Tạo pause menu
    this.createPauseMenu();
  }

  createPauseMenu() {
    // Tạo background overlay
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    
    // Tạo container cho pause menu
    this.pauseMenu = this.add.container(400, 300);
    
    // Title
    const title = this.add.text(0, -50, "GAME PAUSED", {
      font: "48px Arial",
      color: "#fff",
    }).setOrigin(0.5);
    
    // Instructions
    const instructions = this.add.text(0, 0, "Press ESC to resume\nClick to shoot\nWASD to move", {
      font: "24px Arial",
      color: "#ccc",
      align: "center",
    }).setOrigin(0.5);
    
    // Add elements to container
    this.pauseMenu.add([overlay, title, instructions]);
    
    // Hide initially
    this.pauseMenu.setVisible(false);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.pauseMenu.setVisible(this.isPaused);
    
    // Không sử dụng scene.pause/resume vì có thể gây conflict
    // Chỉ sử dụng biến isPaused để kiểm soát
  }

  shootBullet(targetX: number, targetY: number) {
    const mainPlayer = this.players[0];
    const dx = targetX - mainPlayer.x;
    const dy = targetY - mainPlayer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      
      // Tạo đạn với hiệu ứng trail
      const bullet = this.add.circle(
        mainPlayer.x + normalizedDx * PLAYER_RADIUS,
        mainPlayer.y + normalizedDy * PLAYER_RADIUS,
        BULLET_RADIUS,
        0xffff00 // Màu vàng
      );
      
      // Thêm trail effect cho đạn
      const trail = this.add.circle(
        bullet.x - normalizedDx * 10,
        bullet.y - normalizedDy * 10,
        BULLET_RADIUS * 0.6,
        0xffaa00,
        0.5
      );
      
      this.bullets.push(bullet);
      this.bulletData.push({
        x: bullet.x,
        y: bullet.y,
        dx: normalizedDx * BULLET_SPEED,
        dy: normalizedDy * BULLET_SPEED,
        life: 3000, // Đạn tồn tại 3 giây
        trail: trail
      });
    }
  }

  respawnPlayer(playerIndex: number) {
    const player = this.players[playerIndex];
    const newPos = getRandomPos(800, 600);
    
    // Cập nhật vị trí player
    player.x = newPos.x;
    player.y = newPos.y;
    
    // Tạo lại sprite với hiệu ứng fade in
    const newSprite = this.add.circle(
      player.x, 
      player.y, 
      PLAYER_RADIUS, 
      Phaser.Display.Color.HexStringToColor(player.color).color
    );
    
    // Hiệu ứng fade in cho sprite
    newSprite.setAlpha(0);
    this.tweens.add({
      targets: newSprite,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });
    
    // Thay thế sprite cũ
    this.playerSprites[playerIndex] = newSprite;
    
    // Tạo lại tên player với hiệu ứng fade in
    const newName = this.add.text(player.x - 18, player.y - 35, player.isMain ? "You" : player.id, {
      font: "16px Arial",
      color: "#fff",
    });
    
    // Hiệu ứng fade in cho tên
    newName.setAlpha(0);
    this.tweens.add({
      targets: newName,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });
    
    // Thay thế tên cũ
    this.playerNames[playerIndex] = newName;
    
    // Reset respawn timer
    this.respawnTimers[playerIndex] = 0;
    
    // Xóa text countdown nếu có
    if (this.respawnTexts[playerIndex]) {
      this.respawnTexts[playerIndex]!.destroy();
      this.respawnTexts[playerIndex] = null;
    }
  }

  updateScore() {
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);
    
    // Cập nhật high score nếu cần
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.highScoreText.setText(`High Score: ${this.highScore}`);
      localStorage.setItem('dotWarHighScore', this.highScore.toString());
    }
  }

  update(time: number, delta: number) {
    // Kiểm tra pause - sử dụng logic để tránh trigger liên tục
    if (this.pauseKey && this.pauseKey.isDown && !this.wasPauseKeyPressed) {
      this.togglePause();
      this.wasPauseKeyPressed = true;
    } else if (this.pauseKey && !this.pauseKey.isDown) {
      this.wasPauseKeyPressed = false;
    }

    // Nếu đang pause thì không cập nhật game
    if (this.isPaused) {
      return;
    }

    // Di chuyển player chính
    const mainPlayer = this.players[0];
    let dx = 0, dy = 0;
    
    // Kiểm tra null trước khi sử dụng
    if (this.cursors && this.aKey && this.wKey && this.sKey && this.dKey) {
      if (this.cursors.left.isDown || this.aKey.isDown) dx -= 1;
      if (this.cursors.right.isDown || this.dKey.isDown) dx += 1;
      if (this.cursors.up.isDown || this.wKey.isDown) dy -= 1;
      if (this.cursors.down.isDown || this.sKey.isDown) dy += 1;
    }
    
    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len; dy /= len;
      mainPlayer.x += dx * PLAYER_SPEED * (delta / 1000);
      mainPlayer.y += dy * PLAYER_SPEED * (delta / 1000);
      // Giới hạn trong màn hình
      mainPlayer.x = Math.max(PLAYER_RADIUS, Math.min(800 - PLAYER_RADIUS, mainPlayer.x));
      mainPlayer.y = Math.max(PLAYER_RADIUS, Math.min(600 - PLAYER_RADIUS, mainPlayer.y));
    }
    // Cập nhật vị trí sprite và tên
    this.playerSprites[0].setPosition(mainPlayer.x, mainPlayer.y);
    this.playerNames[0].setPosition(mainPlayer.x - 18, mainPlayer.y - 35);

    // Cập nhật đạn và kiểm tra va chạm
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      const bulletInfo = this.bulletData[i];
      
      // Cập nhật vị trí đạn
      bulletInfo.x += bulletInfo.dx * (delta / 1000);
      bulletInfo.y += bulletInfo.dy * (delta / 1000);
      bullet.setPosition(bulletInfo.x, bulletInfo.y);
      
      // Cập nhật trail effect
      if (bulletInfo.trail) {
        bulletInfo.trail.setPosition(
          bulletInfo.x - (bulletInfo.dx / BULLET_SPEED) * 10,
          bulletInfo.y - (bulletInfo.dy / BULLET_SPEED) * 10
        );
      }
      
      // Kiểm tra va chạm với các player
      let hitPlayer = false;
      for (let j = this.players.length - 1; j >= 0; j--) {
        const player = this.players[j];
        const playerSprite = this.playerSprites[j];
        
        // Bỏ qua player chính (không tự bắn mình)
        if (j === 0) continue;
        
        // Bỏ qua player đang respawn
        if (this.respawnTimers[j] > 0) continue;
        
        // Tính khoảng cách giữa đạn và player
        const distance = Math.sqrt(
          Math.pow(bulletInfo.x - player.x, 2) + 
          Math.pow(bulletInfo.y - player.y, 2)
        );
        
        // Nếu va chạm (khoảng cách < tổng bán kính)
        if (distance < PLAYER_RADIUS + BULLET_RADIUS) {
          // Hiệu ứng va chạm
          this.createHitEffect(player.x, player.y);
          
          // Ẩn player bị bắn (không xóa)
          playerSprite.setVisible(false);
          
          // Ẩn tên player
          this.playerNames[j].setVisible(false);
          
          // Cộng điểm
          this.updateScore();
          
          // Bắt đầu respawn timer
          this.respawnTimers[j] = RESPAWN_TIME;
          
          // Hiển thị countdown
          const countdownText = this.add.text(player.x - 30, player.y - 10, "3", {
            font: "24px Arial",
            color: "#ff0000",
          });
          this.respawnTexts[j] = countdownText;
          
          hitPlayer = true;
          break;
        }
      }
      
      // Giảm thời gian sống của đạn
      bulletInfo.life -= delta;
      
      // Xóa đạn nếu ra khỏi màn hình, hết thời gian, hoặc trúng player
      if (hitPlayer || bulletInfo.life <= 0 || 
          bulletInfo.x < 0 || bulletInfo.x > 800 || 
          bulletInfo.y < 0 || bulletInfo.y > 600) {
        bullet.destroy();
        if (bulletInfo.trail) {
          bulletInfo.trail.destroy();
        }
        this.bullets.splice(i, 1);
        this.bulletData.splice(i, 1);
      }
    }

    // Cập nhật respawn timers
    for (let i = 0; i < this.respawnTimers.length; i++) {
      if (this.respawnTimers[i] > 0) {
        this.respawnTimers[i] -= delta;
        
        // Cập nhật countdown text
        if (this.respawnTexts[i]) {
          const secondsLeft = Math.ceil(this.respawnTimers[i] / 1000);
          this.respawnTexts[i]!.setText(secondsLeft.toString());
        }
        
        // Respawn khi hết thời gian
        if (this.respawnTimers[i] <= 0) {
          this.respawnPlayer(i);
        }
      }
    }
  }

  createHitEffect(x: number, y: number) {
    // Tạo hiệu ứng va chạm đẹp hơn với particle effects
    
    // 1. Explosion circle chính
    const explosion = this.add.circle(x, y, PLAYER_RADIUS * 1.5, 0xff0000, 0.8);
    
    // 2. Thêm particle effects
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = this.add.circle(
        x + Math.cos(angle) * PLAYER_RADIUS,
        y + Math.sin(angle) * PLAYER_RADIUS,
        3,
        0xffff00,
        1
      );
      
      // Animation particle bay ra ngoài
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * PLAYER_RADIUS * 3,
        y: y + Math.sin(angle) * PLAYER_RADIUS * 3,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
    
    // 3. Animation explosion chính
    this.tweens.add({
      targets: explosion,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        explosion.destroy();
      }
    });
    
    // 4. Thêm flash effect
    const flash = this.add.circle(x, y, PLAYER_RADIUS * 2, 0xffffff, 0.6);
    this.tweens.add({
      targets: flash,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        flash.destroy();
      }
    });
  }
}

const GameCanvas: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current && !gameInstance.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: gameRef.current,
        scene: MainScene,
        backgroundColor: "#22223b",
      };
      gameInstance.current = new Phaser.Game(config);
    }
    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
        gameInstance.current = null;
      }
    };
  }, []);

  return <div ref={gameRef} />;
};

export default GameCanvas; 