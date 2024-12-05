import {
  ANIMATION_SCALE,
  SpriteSheets,
} from "../constants/animation-constants";
import {
  PlayerAnimations,
  PlayerJumpTypes,
} from "../constants/player-constants/player-animation-enums";
import { PLAYER_JUMP_CONFIG } from "../constants/player-constants/player-physics-constants";
import {
  PlayerInput,
  PlayerStateInterface,
} from "../types/player-types/player-state-types";
import { DebugSpriteConfig } from "../types/debug-types";
import { PlayerDebugger } from "../utils/debug-utils";
import { DebugMode } from "../constants/debug-enums";
import { Directions } from "../constants/general-enums";
import { PlayerState } from "../state/PlayerState";
import { AnimationConfig } from "../types/animation-types";
import {
  PLAYER_ANIMATIONS,
  PlayerAnimationData,
} from "../constants/player-constants/player-animation-metadata";
import { AnimationManager } from "../utils/AnimationManager";

export class PlayerAdapter extends Phaser.Physics.Arcade.Sprite {
  private playerState: PlayerState;
  private debugger?: PlayerDebugger;
  private animationManager: AnimationManager;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    debug?: DebugSpriteConfig
  ) {
    super(scene, x, y, "player");
    this.playerState = PlayerState.create(x, y);
    this.animationManager = new AnimationManager(scene, this);

    this.setupPhaser(scene);
    this.setupDebugger(scene, debug);
    this.setupAnimations();
  }

  private setupPhaser(scene: Phaser.Scene): void {
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setScale(ANIMATION_SCALE);
    this.setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(PLAYER_JUMP_CONFIG.GRAVITY);
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

  private setupAnimations(): void {
    const animationConfigs: AnimationConfig<PlayerAnimationData>[] =
      Object.entries(PLAYER_ANIMATIONS).map(
        ([key, config]: [string, AnimationConfig<PlayerAnimationData>]) => ({
          ...config,
          key,
        })
      );

    this.animationManager.setupAnimations(
      SpriteSheets.Player,
      animationConfigs,
      (eventName: string, data: any) => {
        const body = this.body as Phaser.Physics.Arcade.Body;
        this.playerState.handleAnimationEvent(eventName, data, body);
      }
    );

    // Setup animation completion handling
    this.animationManager.setupAnimationCompleteListener(
      (animationKey: string) =>
        this.playerState.handleAnimationComplete(animationKey)
    );

    // Check for validation errors
    const errors = this.animationManager.getValidationErrors();
    if (errors.length > 0) {
      console.warn("Animation validation errors:", errors);
    }
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, delta: number): void {
    if (delta === 0) return;

    // Update physics state from Phaser
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.playerState.updatePhysics(
      this.x,
      this.y,
      body.velocity.x,
      body.velocity.y,
      body.onFloor()
    );

    // Update player state with mapped input
    this.playerState.update(this.mapCursorsToInput(cursors, delta / 1000));

    // Apply state back to Phaser sprite
    this.applyStateToSprite();

    // Update debug if enabled
    if (this.debugger) {
      this.debugger.update(this.playerState, this);
    }
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

  private applyStateToSprite(): void {
    // Apply velocity changes
    this.setVelocity(this.playerState.velocity.x, this.playerState.velocity.y);

    // Apply facing direction
    this.setFlipX(this.playerState.facing === Directions.Left);

    this.animationManager.playAnimation(this, this.playerState.animation);
  }

  public getPlayerState(): Readonly<PlayerStateInterface> {
    return this.playerState;
  }

  public getCurrentAnimation(): PlayerAnimations {
    return this.playerState.animation;
  }

  public getFacingDirection(): Directions {
    return this.playerState.facing;
  }

  destroy(fromScene?: boolean): void {
    if (this.debugger) {
      this.debugger.destroy();
    }

    if (this.animationManager) {
      this.animationManager.destroy();
    }

    this.removeAllListeners();
    this.scene.events.off("playerJumpPhysics");

    super.destroy(fromScene);
  }
}
