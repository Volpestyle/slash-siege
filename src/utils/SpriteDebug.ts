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

// Create a type for only the boolean keys of SpriteDebugConfig
type ToggleableFeature = {
  [K in keyof SpriteDebugConfig]: SpriteDebugConfig[K] extends boolean
    ? K
    : never;
}[keyof SpriteDebugConfig];

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
      textOffset: { x: 0, y: -50 },
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
      this.drawOrigin();
    }

    if (this.config.showBounds) {
      this.drawBounds();
    }

    if (this.config.showVelocity && "body" in this.sprite) {
      this.drawVelocity();
    }

    this.updateText();
  }

  private drawOrigin(): void {
    this.debugGraphics.lineStyle(1, this.config.originColor);
    this.debugGraphics.strokeCircle(this.sprite.x, this.sprite.y, 3);
  }

  private drawBounds(): void {
    this.debugGraphics.lineStyle(1, this.config.boundsColor);
    const bounds = this.sprite.getBounds();
    this.debugGraphics.strokeRect(
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height
    );
  }

  private drawVelocity(): void {
    const body = (this.sprite as Phaser.Physics.Arcade.Sprite)
      .body as Phaser.Physics.Arcade.Body;
    if (body) {
      const velocity = new Phaser.Math.Vector2(
        body.velocity.x,
        body.velocity.y
      );
      if (!velocity.equals(Phaser.Math.Vector2.ZERO)) {
        this.debugGraphics.lineStyle(1, 0xff00ff);
        const velocityScale = 0.1; // Scale down the velocity for visualization
        this.debugGraphics.lineBetween(
          this.sprite.x,
          this.sprite.y,
          this.sprite.x + velocity.x * velocityScale,
          this.sprite.y + velocity.y * velocityScale
        );
      }
    }
  }

  private updateText(): void {
    const textParts: string[] = [];

    if (this.config.showName) {
      textParts.push(`Name: ${this.sprite.name || "unnamed"}`);
    }

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
        textParts.push(`Vel X: ${Math.round(body.velocity.x)}`);
        textParts.push(`Vel Y: ${Math.round(body.velocity.y)}`);
      }
    }

    if (textParts.length > 0) {
      this.debugText
        .setPosition(
          this.sprite.x + this.config.textOffset.x,
          this.sprite.y + this.config.textOffset.y
        )
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

  // Updated toggle method with proper typing
  public toggle(feature: ToggleableFeature, value?: boolean): void {
    this.config[feature] = value ?? !this.config[feature];
  }
}
