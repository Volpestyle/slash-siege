import { PlayerAdapter } from "../adapters/PlayerAdapter";
import { DebugMode } from "../constants/debug-enums";
import { MAIN_SCENE_CONFIG } from "../constants/main-scene-consants";
import { MainSceneConfig } from "../types/main-scene-types";
import { DebugHUD } from "../utils/debug-utils";
import { VirtualJoystick } from "../utils/VirtualJoystick";

export class MainScene extends Phaser.Scene {
  private debugHUD?: DebugHUD;
  private player!: PlayerAdapter;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private platform!: Phaser.GameObjects.Rectangle;
  private virtualJoystick!: VirtualJoystick;
  private config: MainSceneConfig = MAIN_SCENE_CONFIG;

  constructor() {
    super({ key: "MainScene" });
  }

  init(data: any): void {
    // Override default config with any passed data
    this.config = {
      ...this.config,
      ...data,
    };
  }

  preload(): void {
    this.load.atlas(
      "player",
      "assets/animations/player_assets.png",
      "assets/animations/player_assets.json"
    );
  }

  create(): void {
    // Add FPS display only if enabled
    if (this.config.showFPS) {
      this.debugHUD = new DebugHUD(this);
    }

    // Add a colored background
    this.cameras.main.setBackgroundColor("#ffffff");

    // Create player with optional debug mode
    this.player = new PlayerAdapter(this, 400, 300, {
      debugMode: this.config.playerDebug ? DebugMode.Basic : DebugMode.None,
    });

    // Create platform
    this.platform = this.add.rectangle(100, 800, 800, 100, 0x00ff00);
    this.physics.add.existing(this.platform, true);
    this.physics.add.collider(this.player, this.platform);

    // Initialize controls
    this.initializeControls();
  }

  private initializeControls(): void {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    } else {
      this.cursors = {
        up: { isDown: false },
        down: { isDown: false },
        left: { isDown: false },
        right: { isDown: false },
        space: { isDown: false },
        shift: { isDown: false },
      } as Phaser.Types.Input.Keyboard.CursorKeys;
    }

    // Only create virtual joystick on touch devices
    if (this.sys.game.device.input.touch) {
      try {
        this.virtualJoystick = new VirtualJoystick(this, {
          debug: this.config.joyStickDebug,
        });
      } catch (error) {
        console.error("Failed to create VirtualJoystick:", error);
      }
    }
  }

  update(time: number, delta: number): void {
    if (this.debugHUD) {
      this.debugHUD.update();
    }

    if (this.virtualJoystick) {
      this.virtualJoystick.update();
      const joystickKeys = this.virtualJoystick.getKeys();
      const combinedKeys = {
        up: { isDown: this.cursors.up.isDown || joystickKeys.up.isDown },
        down: { isDown: this.cursors.down.isDown || joystickKeys.down.isDown },
        left: { isDown: this.cursors.left.isDown || joystickKeys.left.isDown },
        right: {
          isDown: this.cursors.right.isDown || joystickKeys.right.isDown,
        },
        space: this.cursors.space,
        shift: this.cursors.shift,
      } as Phaser.Types.Input.Keyboard.CursorKeys;

      this.player.update(combinedKeys, delta);
    } else {
      this.player.update(this.cursors, delta);
    }
  }

  destroy(): void {
    if (this.virtualJoystick) {
      this.virtualJoystick.destroy();
    }
    if (this.debugHUD) {
      this.debugHUD.destroy();
    }
  }
}
