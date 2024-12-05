import { Scene } from "phaser";

interface VirtualJoystickConfig {
  debug?: boolean;
  x?: number;
  y?: number;
  radius?: number;
}

export class VirtualJoystick {
  private joystick: any;
  private joystickKeys: {
    up: { isDown: boolean };
    down: { isDown: boolean };
    left: { isDown: boolean };
    right: { isDown: boolean };
  };
  private debugText?: Phaser.GameObjects.Text;
  private config: VirtualJoystickConfig;
  private isFirstTouch: boolean = true;

  constructor(scene: Scene, config: VirtualJoystickConfig = {}) {
    // Default config
    this.config = {
      debug: false,
      x: (scene.sys.game.config.width as number) - 100,
      y: (scene.sys.game.config.height as number) - 100,
      radius: 40,
      ...config,
    };

    // Initialize virtual key states first
    this.joystickKeys = {
      up: { isDown: false },
      down: { isDown: false },
      left: { isDown: false },
      right: { isDown: false },
    };

    try {
      const plugin = (scene as any).plugins.get("rexVirtualJoystick");
      if (this.config.debug) {
        console.log("Found plugin:", plugin);
      }

      this.joystick = plugin.add(scene, {
        x: this.config.x,
        y: this.config.y,
        radius: this.config.radius,
        base: scene.add.circle(0, 0, 48, 0x888888, 0.8),
        thumb: scene.add.circle(0, 0, 24, 0xcccccc, 0.8),
        dir: "8dir",
        forceMin: 16,
        fixed: true,
        enable: true,
      });

      // Add pointer up listener to reset first touch flag
      this.joystick.on("pointerup", () => {
        this.isFirstTouch = true;
      });

      if (this.config.debug) {
        this.setupDebug(scene);
      }
    } catch (error) {
      console.error("Error creating joystick:", error);
    }
  }

  private setupDebug(scene: Scene): void {
    this.debugText = scene.add.text(10, 150, "", {
      color: "#000000",
      backgroundColor: "#ffffff",
    });

    this.joystick.on("update", () => {
      if (this.debugText) {
        this.debugText.setText([
          `Joystick Position: (${Math.round(this.joystick.x)}, ${Math.round(
            this.joystick.y
          )})`,
          `Force: ${Math.round(this.joystick.force)}`,
          `Angle: ${Math.round(this.joystick.angle)}`,
          `Pointer: ${this.joystick.pointer ? "yes" : "no"}`,
          `Enabled: ${this.joystick.enable}`,
          `First Touch: ${this.isFirstTouch}`,
        ]);
      }
    });
  }

  update(): void {
    if (!this.joystick) {
      return;
    }

    // Reset all states
    this.joystickKeys.up.isDown = false;
    this.joystickKeys.down.isDown = false;
    this.joystickKeys.left.isDown = false;
    this.joystickKeys.right.isDown = false;

    // Only process input if there's actual movement
    if (this.joystick.force > 0) {
      if (this.isFirstTouch) {
        // Ignore the first frame of input to prevent unwanted jumps
        this.isFirstTouch = false;
        return;
      }

      const angle = this.joystick.angle;

      // Convert angle to degrees and normalize to 0-360
      const normalizedAngle = ((angle % 360) + 360) % 360;

      // Define clear angle ranges for each direction
      // Up: 240° to 300° (bottom part of circle)
      if (normalizedAngle > 240 && normalizedAngle <= 300) {
        this.joystickKeys.up.isDown = true;
      }
      // Down: 60° to 120° (top part of circle)
      else if (normalizedAngle > 60 && normalizedAngle <= 120) {
        this.joystickKeys.down.isDown = true;
      }

      // Left: 150° to 210°
      if (normalizedAngle > 150 && normalizedAngle <= 210) {
        this.joystickKeys.left.isDown = true;
      }
      // Right: 330° to 30°
      else if (normalizedAngle <= 30 || normalizedAngle > 330) {
        this.joystickKeys.right.isDown = true;
      }

      // Handle diagonal inputs
      if (normalizedAngle > 300 && normalizedAngle <= 330) {
        this.joystickKeys.up.isDown = true;
        this.joystickKeys.right.isDown = true;
      } else if (normalizedAngle > 210 && normalizedAngle <= 240) {
        this.joystickKeys.up.isDown = true;
        this.joystickKeys.left.isDown = true;
      } else if (normalizedAngle > 120 && normalizedAngle <= 150) {
        this.joystickKeys.down.isDown = true;
        this.joystickKeys.left.isDown = true;
      } else if (normalizedAngle > 30 && normalizedAngle <= 60) {
        this.joystickKeys.down.isDown = true;
        this.joystickKeys.right.isDown = true;
      }
    }
  }

  getKeys(): Phaser.Types.Input.Keyboard.CursorKeys {
    return this.joystickKeys as Phaser.Types.Input.Keyboard.CursorKeys;
  }

  destroy(): void {
    if (this.joystick) {
      this.joystick.destroy();
    }
    if (this.debugText) {
      this.debugText.destroy();
    }
  }
}
