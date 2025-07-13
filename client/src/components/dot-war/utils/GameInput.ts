import Phaser from 'phaser';

export class GameInput {
  public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  public wKey!: Phaser.Input.Keyboard.Key;
  public aKey!: Phaser.Input.Keyboard.Key;
  public sKey!: Phaser.Input.Keyboard.Key;
  public dKey!: Phaser.Input.Keyboard.Key;
  public pauseKey!: Phaser.Input.Keyboard.Key;
  public ultimateKey!: Phaser.Input.Keyboard.Key;
  public spaceKey!: Phaser.Input.Keyboard.Key;
  public wasPauseKeyPressed: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.initializeKeys(scene);
  }

  private initializeKeys(scene: Phaser.Scene) {
    this.cursors = scene.input?.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.wKey = scene.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W) as Phaser.Input.Keyboard.Key;
    this.aKey = scene.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A) as Phaser.Input.Keyboard.Key;
    this.sKey = scene.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S) as Phaser.Input.Keyboard.Key;
    this.dKey = scene.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D) as Phaser.Input.Keyboard.Key;
    this.pauseKey = scene.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) as Phaser.Input.Keyboard.Key;
    this.ultimateKey = scene.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.Q) as Phaser.Input.Keyboard.Key;
    this.spaceKey = scene.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE) as Phaser.Input.Keyboard.Key;
  }

  public getMovementVector(): { dx: number; dy: number } {
    let dx = 0,
      dy = 0;

    if (this.cursors && this.aKey && this.wKey && this.sKey && this.dKey) {
      if (this.cursors.left.isDown || this.aKey.isDown) dx -= 1;
      if (this.cursors.right.isDown || this.dKey.isDown) dx += 1;
      if (this.cursors.up.isDown || this.wKey.isDown) dy -= 1;
      if (this.cursors.down.isDown || this.sKey.isDown) dy += 1;
    }

    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
    }

    return { dx, dy };
  }

  public isPausePressed(): boolean {
    if (this.pauseKey?.isDown && !this.wasPauseKeyPressed) {
      this.wasPauseKeyPressed = true;
      return true;
    } else if (this.pauseKey && !this.pauseKey.isDown) {
      this.wasPauseKeyPressed = false;
    }
    return false;
  }

  public isUltimatePressed(): boolean {
    return this.ultimateKey && Phaser.Input.Keyboard.JustDown(this.ultimateKey);
  }

  public isSpacePressed(): boolean {
    return this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey);
  }

  public destroy() {
    // Clean up if needed
  }
}
