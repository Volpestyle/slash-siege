export class SpriteDebug {
  private debugGraphics: Phaser.GameObjects.Graphics;
  private debugText: Phaser.GameObjects.Text;
  private sprite: Phaser.GameObjects.Sprite;
  private scene: Phaser.Scene;
  private config: SpriteDebugConfig;

  constructor(
    sprite: Phaser.GameObjects.Sprite,
    config: Partial<SpriteDebugConfig> = {}
  ) {
    this.sprite = sprite;
    this.scene = sprite.scene;
    this.config = {
      showOrigin: true,
      showBounds: true,
      showAnimation: true,
      showVelocity: false,
      showName: false,
      textColor: "#fff",
      textBackgroundColor: "#000",
      textOffset: { x: 0, y: -80 }, // Increased Y offset
      originColor: 0xff0000,
      boundsColor: 0x00ff00,
      ...config,
    };

    this.debugGraphics = this.scene.add.graphics();
    this.debugText = this.scene.add
      .text(0, 0, "", {
        fontSize: "12px",
        backgroundColor: this.config.textBackgroundColor,
        color: this.config.textColor,
        padding: { x: 4, y: 4 },
        align: "left",
        fixedWidth: 150, // Fixed width for consistent layout
      })
      .setDepth(1000);

    // Add update callback
    this.scene.events.on("update", this.update, this);
    // Clean up when sprite is destroyed
    this.sprite.on("destroy", this.destroy, this);
  }

  private update(): void {
    this.debugGraphics.clear();

    if (this.config.showOrigin) {
      this.debugGraphics.lineStyle(1, this.config.originColor);
      this.debugGraphics.strokeCircle(this.sprite.x, this.sprite.y, 3);
    }

    if (this.config.showBounds) {
      this.debugGraphics.lineStyle(1, this.config.boundsColor);
      const bounds = this.sprite.getBounds();
      this.debugGraphics.strokeRect(
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height
      );
    }

    this.updateText();
  }

  private updateText(): void {
    const textParts: string[] = [];
    const bounds = this.sprite.getBounds();

    if (this.config.showAnimation && "anims" in this.sprite) {
      const sprite = this.sprite as Phaser.GameObjects.Sprite;
      if (sprite.anims.currentAnim) {
        textParts.push(
          `Anim: ${sprite.anims.currentAnim.key}`,
          `Frame: ${sprite.anims.currentFrame?.index}`
        );
      }
    }

    if (this.config.showVelocity && "body" in this.sprite) {
      const body = (this.sprite as Phaser.Physics.Arcade.Sprite)
        .body as Phaser.Physics.Arcade.Body;
      if (body) {
        // Format velocity to 1 decimal place
        const vx = Math.round(body.velocity.x * 10) / 10;
        const vy = Math.round(body.velocity.y * 10) / 10;
        textParts.push(`Vel X: ${vx}`);
        if (vy !== 0) {
          textParts.push(`Vel Y: ${vy}`);
        }
      }
    }

    if (textParts.length > 0) {
      // Position text above sprite bounds
      const textX = bounds.centerX + this.config.textOffset.x - 75; // Center the text (half of fixedWidth)
      const textY = bounds.y + this.config.textOffset.y;

      this.debugText
        .setPosition(textX, textY)
        .setText(textParts.join("\n"))
        .setVisible(true);
    } else {
      this.debugText.setVisible(false);
    }
  }

  public destroy(): void {
    this.scene.events.off("update", this.update, this);
    this.debugGraphics.destroy();
    this.debugText.destroy();
  }

  public toggle(feature: ToggleableFeature, value?: boolean): void {
    if (typeof this.config[feature] === "boolean") {
      this.config[feature] = value ?? !this.config[feature];
    }
  }
}

interface SpriteDebugConfig {
  showOrigin: boolean;
  showBounds: boolean;
  showAnimation: boolean;
  showVelocity: boolean;
  showName: boolean;
  textColor: string;
  textBackgroundColor: string;
  textOffset: { x: number; y: number };
  originColor: number;
  boundsColor: number;
}

type ToggleableFeature = {
  [K in keyof SpriteDebugConfig]: SpriteDebugConfig[K] extends boolean
    ? K
    : never;
}[keyof SpriteDebugConfig];
