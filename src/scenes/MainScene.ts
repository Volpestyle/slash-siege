import { Player } from "../sprites/Player";
import { DebugMode } from "../types/spriteDebug";

export class MainScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private platform!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: "MainScene" });
  }

  preload(): void {
    // Add this method
    // Load the player sprite sheet
    this.load.atlas(
      "player",
      "assets/animations/player.png",
      "assets/animations/player.json"
    );
  }

  create(): void {
    // Add a colored background
    this.cameras.main.setBackgroundColor("#ffffff");

    // Create player
    this.player = new Player(this, 400, 300, { debugMode: DebugMode.Basic });

    // Create platform
    this.platform = this.add.rectangle(100, 800, 800, 100, 0x00ff00);
    this.physics.add.existing(this.platform, true);
    // Add collision detection between the player and the platform
    this.physics.add.collider(this.player, this.platform);

    // Safe keyboard initialization
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    } else {
      console.warn("Keyboard input not available");
      this.cursors = {
        up: { isDown: false },
        down: { isDown: false },
        left: { isDown: false },
        right: { isDown: false },
        space: { isDown: false },
        shift: { isDown: false },
      } as Phaser.Types.Input.Keyboard.CursorKeys;
    }
  }

  update(time: number, delta: number): void {
    this.player.update(this.cursors, delta);
  }
}
