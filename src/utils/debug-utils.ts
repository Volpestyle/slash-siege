// utils/debug.ts

import { PlayerStateInterface } from "../types/player-types/player-state-types";

export type DebugConfig = {
  showState: boolean;
  showPhysics: boolean;
  showAnimation: boolean;
  showMovement: boolean;
  showJump: boolean;
  showVelocity: boolean;
  textColor: string;
  textBackgroundColor: string;
  textOffset: { x: number; y: number };
};

export class PlayerDebugger {
  private graphics: Phaser.GameObjects.Graphics;
  private stateText: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;
  private config: DebugConfig;

  constructor(scene: Phaser.Scene, config: Partial<DebugConfig> = {}) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.config = {
      showState: true,
      showPhysics: true,
      showAnimation: true,
      showMovement: true,
      showJump: true,
      showVelocity: true,
      textColor: "#ffffff",
      textBackgroundColor: "#000000",
      textOffset: { x: 0, y: -75 }, // Centered above sprite
      ...config,
    };

    this.stateText = scene.add.text(0, 0, "", {
      color: this.config.textColor,
      backgroundColor: this.config.textBackgroundColor,
      padding: { x: 10, y: 5 }, // Added more horizontal padding
      align: "left",
      wordWrap: { width: 400 }, // Maximum width before wrapping
    });

    this.stateText.setDepth(1000);
    this.stateText.setOrigin(0.5, 1); // Center horizontally, anchor to bottom
  }

  update(
    state: PlayerStateInterface,
    sprite: Phaser.Physics.Arcade.Sprite
  ): void {
    this.graphics.clear();
    this.updateStateText(state, sprite);
    this.drawDebugShapes(state, sprite);
  }

  private updateStateText(
    state: PlayerStateInterface,
    sprite: Phaser.Physics.Arcade.Sprite
  ): void {
    const lines: string[] = [];

    if (this.config.showState) {
      lines.push(
        `Position: (${Math.round(state.position.x)}, ${Math.round(
          state.position.y
        )})`
      );
      lines.push(`Facing: ${state.facing}`);
    }

    if (this.config.showPhysics) {
      lines.push(`On Floor: ${state.physics.onFloor}`);
    }

    if (this.config.showAnimation) {
      lines.push(`Animation: ${state.animation}`);
      if (sprite.anims.currentFrame) {
        lines.push(`Frame: ${sprite.anims.currentFrame.index}`);
      }
    }

    if (this.config.showMovement) {
      lines.push(`Walking: ${state.movement.isWalking}`);
      lines.push(`Accelerating: ${state.movement.isAccelerating}`);
      if (state.movement.switchTargetDirection) {
        lines.push(`Switch Target: ${state.movement.switchTargetDirection}`);
      }
    }

    if (this.config.showJump) {
      lines.push(`Jump State: ${state.jump.jumpStage}`);
      lines.push(`Jump Type: ${state.jump.jumpType || "none"}`);
      lines.push(`Max Fall: ${Math.round(state.jump.maxFallVelocity)}`);
    }

    if (this.config.showVelocity) {
      lines.push(`Velocity X: ${Math.round(state.velocity.x)}`);
      lines.push(`Velocity Y: ${Math.round(state.velocity.y)}`);
    }

    this.stateText.setText(lines);
    // Position text above sprite
    this.stateText.setPosition(
      sprite.x, // Center on sprite
      sprite.y + this.config.textOffset.y
    );
  }

  private drawDebugShapes(
    state: PlayerStateInterface,
    sprite: Phaser.Physics.Arcade.Sprite
  ): void {
    // Draw velocity vector
    if (this.config.showVelocity) {
      const velocityScale = 0.1;
      this.graphics.lineStyle(2, 0x00ff00);
      this.graphics.beginPath();
      this.graphics.moveTo(sprite.x, sprite.y);
      this.graphics.lineTo(
        sprite.x + state.velocity.x * velocityScale,
        sprite.y + state.velocity.y * velocityScale
      );
      this.graphics.closePath();
      this.graphics.strokePath();
    }

    // Draw bounding box
    this.graphics.lineStyle(1, 0xff0000);
    const bounds = sprite.getBounds();
    this.graphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

    // Draw ground check rays
    if (this.config.showPhysics) {
      this.graphics.lineStyle(1, state.physics.onFloor ? 0x00ff00 : 0xff0000);
      this.graphics.beginPath();
      this.graphics.moveTo(bounds.x, bounds.bottom);
      this.graphics.lineTo(bounds.right, bounds.bottom);
      this.graphics.closePath();
      this.graphics.strokePath();
    }
  }

  destroy(): void {
    this.graphics.destroy();
    this.stateText.destroy();
  }
}
export class DebugHUD {
  private fpsText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.fpsText = scene.add
      .text(10, 10, "", {
        color: "#00ff00",
        fontSize: "16px",
      } as Phaser.Types.GameObjects.Text.TextStyle)
      .setDepth(1000)
      .setScrollFactor(0);

    this.update = this.update.bind(this);
  }

  update() {
    const fps = this.fpsText.scene.game.loop.actualFps.toFixed(1);
    const ms = this.fpsText.scene.game.loop.delta.toFixed(2);
    this.fpsText.setText([`FPS: ${fps}`, `MS: ${ms}`]);
  }

  destroy() {
    this.fpsText.destroy();
  }
}
