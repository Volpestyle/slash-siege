// adapters/Player.ts

import { ANIMATION_SCALE } from "../constants/animation-enums";
import { Directions } from "../constants/player-enums/player-animation-enums";
import { JUMP_CONFIG } from "../constants/player-enums/player-physics-enums";
import { createInitialState } from "../state/player-states/initial-state";
import { updatePlayerState } from "../state/player-state";
import {
  AnimationState,
  Direction,
  PlayerInput,
  PlayerState,
} from "../types/player-types/player-animation-types";
import { DebugSpriteConfig } from "../types/debug-types";
import { playAnimation, setupPlayerAnimations } from "../utils/animation-utils";
import { PlayerDebugger } from "../utils/debug-utils";
import { pipe } from "../utils/functional-utils";
import { DebugMode } from "../constants/debug-enums";

export class Player extends Phaser.Physics.Arcade.Sprite {
  private playerState: PlayerState;
  private debugger?: PlayerDebugger;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    debug?: DebugSpriteConfig
  ) {
    super(scene, x, y, "player");

    this.setupPhaser(scene);
    this.playerState = createInitialState(x, y);
    this.setupDebugger(scene, debug);
    setupPlayerAnimations(scene);
  }

  private setupPhaser(scene: Phaser.Scene): void {
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setScale(ANIMATION_SCALE);
    this.setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(JUMP_CONFIG.GRAVITY);
  }

  private setupDebugger(scene: Phaser.Scene, debug?: DebugSpriteConfig): void {
    if (debug?.debugMode && debug.debugMode !== DebugMode.None) {
      this.debugger = new PlayerDebugger(scene, {
        showState: debug.debugMode === DebugMode.Enhanced,
        showPhysics: true,
        showAnimation: true,
        showMovement: true,
        showJump: true,
        showVelocity: true,
      });
    }
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, delta: number): void {
    if (delta === 0) return;

    const input = this.mapCursorsToInput(cursors, delta / 1000);

    // Update state through pure function composition
    this.playerState = pipe(
      this.playerState,
      (state) => this.updatePhysicsState(state),
      (state) => updatePlayerState(state, input)
    );

    // Apply state to Phaser sprite
    this.applyStateToSprite(this.playerState);

    // Update debug if enabled
    this.debugger?.update(this.playerState, this);
  }

  private updatePhysicsState(state: PlayerState): PlayerState {
    const body = this.body as Phaser.Physics.Arcade.Body;

    return {
      ...state,
      physics: {
        ...state.physics,
        isGrounded: body.onFloor(),
        gravityScale: body.gravity.y / JUMP_CONFIG.GRAVITY,
      },
      position: {
        x: this.x,
        y: this.y,
      },
      velocity: {
        x: body.velocity.x,
        y: body.velocity.y,
      },
    };
  }

  private mapCursorsToInput(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    delta: number
  ): PlayerInput {
    return {
      left: cursors.left.isDown,
      right: cursors.right.isDown,
      up: cursors.up.isDown,
      down: cursors.down.isDown,
      space: cursors.space.isDown,
      shift: cursors.shift.isDown,
      delta,
    };
  }

  private applyStateToSprite(state: PlayerState): void {
    // Apply physics
    this.setVelocity(state.velocity.x, state.velocity.y);

    // Apply facing direction
    this.setFlipX(state.facing === Directions.Left);

    // Apply animation
    playAnimation(this, state.animation);
  }

  // Public getters for external systems
  public getPlayerState(): Readonly<PlayerState> {
    return this.playerState;
  }

  public getCurrentAnimation(): AnimationState {
    return this.playerState.animation;
  }

  public getFacingDirection(): Direction {
    return this.playerState.facing;
  }

  public isGrounded(): boolean {
    return this.playerState.physics.isGrounded;
  }

  public isJumping(): boolean {
    return this.playerState.jump.isJumping;
  }

  public isLanding(): boolean {
    return this.playerState.jump.isLanding;
  }

  destroy(): void {
    this.debugger?.destroy();
    super.destroy();
  }
}
