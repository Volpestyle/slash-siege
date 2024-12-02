// SpriteDebug.ts
import {
  DebugMode,
  SpriteDebugConfig,
  ToggleableFeature,
  DebugSpriteConfig,
} from "../types/spriteDebug";

class SpriteDebug {
  private debugGraphics: Phaser.GameObjects.Graphics;
  private debugText: Phaser.GameObjects.Text;
  private registrationPoints: Phaser.GameObjects.Graphics;
  private sprite: Phaser.GameObjects.Sprite;
  private scene: Phaser.Scene;
  private config: SpriteDebugConfig;
  private showFrameDebug: boolean;

  constructor(
    sprite: Phaser.GameObjects.Sprite,
    config: Partial<SpriteDebugConfig> = {}
  ) {
    this.sprite = sprite;
    this.scene = sprite.scene;
    this.showFrameDebug = false;

    // Initialize graphics
    this.debugGraphics = this.scene.add.graphics();
    this.registrationPoints = this.scene.add.graphics().setDepth(1000);

    // Initialize config with defaults
    this.config = {
      showOrigin: true,
      showBounds: true,
      showAnimation: true,
      showVelocity: false,
      showName: false,
      textColor: "#fff",
      textBackgroundColor: "#000",
      textOffset: { x: 0, y: -80 },
      originColor: 0xff0000,
      boundsColor: 0x00ff00,
      ...config,
    };

    // Initialize debug text
    this.debugText = this.scene.add
      .text(0, 0, "", {
        fontSize: "12px",
        backgroundColor: this.config.textBackgroundColor,
        color: this.config.textColor,
        padding: { x: 4, y: 4 },
        align: "left",
        fixedWidth: 150,
      })
      .setDepth(1000);

    // Setup event listeners
    this.scene.events.on("update", this.update, this);
    this.sprite.on("destroy", this.destroy, this);
  }

  private update = (): void => {
    this.debugGraphics.clear();
    this.registrationPoints.clear();

    const bounds = this.sprite.getBounds();
    this.drawDebugElements(bounds);
    this.updateDebugText(bounds);
  };

  private drawDebugElements(bounds: Phaser.Geom.Rectangle): void {
    // Draw bounds
    if (this.config.showBounds) {
      this.debugGraphics
        .lineStyle(1, this.config.boundsColor)
        .strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    // Draw origin
    if (this.config.showOrigin) {
      this.debugGraphics
        .lineStyle(1, this.config.originColor)
        .strokeCircle(this.sprite.x, this.sprite.y, 3);
    }

    // Draw frame debug elements
    if (this.showFrameDebug && this.sprite.frame) {
      const frame = this.sprite.frame;
      const centerX = this.sprite.x - frame.centerX * this.sprite.scaleX;
      const centerY = this.sprite.y - frame.centerY * this.sprite.scaleY;

      // Registration point (red)
      this.registrationPoints
        .lineStyle(2, 0xff0000)
        .strokeCircle(this.sprite.x, this.sprite.y, 5)
        // Frame center point (blue)
        .lineStyle(2, 0x0000ff)
        .strokeCircle(centerX, centerY, 5)
        // Offset line (yellow)
        .lineStyle(1, 0xffff00)
        .beginPath()
        .moveTo(this.sprite.x, this.sprite.y)
        .lineTo(centerX, centerY)
        .closePath()
        .strokePath();
    }
  }

  private updateDebugText(bounds: Phaser.Geom.Rectangle): void {
    const textParts: string[] = [];

    // Add animation info
    if (this.config.showAnimation && "anims" in this.sprite) {
      const anim = (this.sprite as Phaser.GameObjects.Sprite).anims.currentAnim;
      if (anim) {
        textParts.push(
          `Anim: ${anim.key}`,
          `Frame: ${
            (this.sprite as Phaser.GameObjects.Sprite).anims.currentFrame?.index
          }`
        );
      }
    }

    // Add velocity info
    if (this.config.showVelocity && "body" in this.sprite) {
      const body = (this.sprite as Phaser.Physics.Arcade.Sprite)
        .body as Phaser.Physics.Arcade.Body;
      if (body) {
        const vx = Math.round(body.velocity.x * 10) / 10;
        const vy = Math.round(body.velocity.y * 10) / 10;
        textParts.push(`Vel X: ${vx}`);
        vy !== 0 && textParts.push(`Vel Y: ${vy}`);
      }
    }

    // Add frame offset info
    if (this.showFrameDebug && this.sprite.frame) {
      const offsetX = Math.round(this.sprite.frame.centerX);
      const offsetY = Math.round(this.sprite.frame.centerY);
      textParts.push(`Offset: ${offsetX},${offsetY}`);
    }

    // Update text position and visibility
    if (textParts.length > 0) {
      const textX = bounds.centerX + this.config.textOffset.x - 75;
      const textY = bounds.y + this.config.textOffset.y;
      this.debugText
        .setPosition(textX, textY)
        .setText(textParts.join("\n"))
        .setVisible(true);
    } else {
      this.debugText.setVisible(false);
    }
  }

  public toggle(feature: ToggleableFeature, value?: boolean): void {
    if (typeof this.config[feature] === "boolean") {
      this.config[feature] = value ?? !this.config[feature];
    }
  }

  public toggleFrameDebug(enabled?: boolean): void {
    this.showFrameDebug = enabled ?? !this.showFrameDebug;
    this.registrationPoints.setVisible(this.showFrameDebug);
  }

  public destroy(): void {
    this.scene.events.off("update", this.update, this);
    this.debugGraphics.destroy();
    this.debugText.destroy();
    this.registrationPoints.destroy();
  }
}

export class DebugComponent {
  private sprite: Phaser.GameObjects.Sprite;
  private spriteDebug?: SpriteDebug;

  constructor(
    sprite: Phaser.GameObjects.Sprite,
    config: DebugSpriteConfig = {}
  ) {
    this.sprite = sprite;
    this.initializeDebug(
      config.debugMode ?? DebugMode.None,
      config.debugConfig ?? {}
    );
    this.sprite.on("destroy", this.destroy);
  }

  private initializeDebug(
    mode: DebugMode,
    config: Partial<SpriteDebugConfig> = {}
  ): void {
    this.spriteDebug?.destroy();

    if (mode === "none") {
      this.spriteDebug = undefined;
      return;
    }

    this.spriteDebug = new SpriteDebug(this.sprite, {
      showAnimation: true,
      showVelocity: true,
      textOffset: { x: 0, y: -50 },
      ...config,
    });

    if (mode === "enhanced") {
      this.spriteDebug.toggleFrameDebug(true);
    }
  }

  public setDebugMode(mode: DebugMode): void {
    this.initializeDebug(mode);
  }

  public destroy(): void {
    this.spriteDebug?.destroy();
  }
}
