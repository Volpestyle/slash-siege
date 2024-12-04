import { ANIMATION_SCALE } from "../constants/animation-constants";
import { PlayerAnimations } from "../constants/player-constants/player-animation-enums";
import { PLAYER_JUMP_CONFIG } from "../constants/player-constants/player-physics-constants";
import {
  PlayerInput,
  PlayerStateInterface,
} from "../types/player-types/player-state-types";
import { DebugSpriteConfig } from "../types/debug-types";
import {
  playAnimation,
  setupAnimationListeners,
  setupAnimations,
} from "../utils/animation-utils";
import { PlayerDebugger } from "../utils/debug-utils";
import { DebugMode } from "../constants/debug-enums";
import {
  PLAYER_ANIMATION_FRAMES,
  PLAYER_ANIMATION_PREFIXES,
} from "../constants/player-constants/player-animation-constants";
import { Directions } from "../constants/general-enums";
import { PlayerState } from "../state/PlayerState";

/**
It's adapting between two distinct interfaces:

1. Phaser's Sprite System

- Properties like body, x, y, velocity
- Methods like setVelocity, setFlipX, play animation
- Phaser's physics and rendering systems

2. Our Game's Player Logic System

- PlayerState with game-specific concepts
- Input handling
- State transitions and gameplay rules

The PlayerAdapter class is bridging these two worlds by:
- Taking Phaser's low-level sprite/physics data and adapting it into our game's state system
- Taking our game state changes and adapting them back into Phaser's sprite system
 */

export class PlayerAdapter extends Phaser.Physics.Arcade.Sprite {
  private playerState: PlayerStateInterface;
  private debugger?: PlayerDebugger;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    debug?: DebugSpriteConfig
  ) {
    super(scene, x, y, "player");
    this.playerState = PlayerState.create(x, y);
    this.setupPhaser(scene);
    this.setupDebugger(scene, debug);
    setupAnimations(
      scene,
      PlayerAnimations,
      PLAYER_ANIMATION_FRAMES,
      PLAYER_ANIMATION_PREFIXES
    );
    setupAnimationListeners(this, (animationKey) => {
      this.playerState.handleAnimationComplete(animationKey);
    });
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

    // Update player state
    this.playerState.update(this.mapCursorsToInput(cursors, delta / 1000));

    // Apply state back to Phaser sprite
    this.applyStateToSprite();

    // Update debug if enabled
    this.debugger?.update(this.playerState, this);
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
    this.setVelocity(this.playerState.velocity.x, this.playerState.velocity.y);
    this.setFlipX(this.playerState.facing === Directions.Left);
    playAnimation(this, this.playerState.animation);
  }

  // Public getters for external systems
  public getPlayerState(): Readonly<PlayerStateInterface> {
    return this.playerState;
  }

  public getCurrentAnimation(): PlayerAnimations {
    return this.playerState.animation;
  }

  public getFacingDirection(): Directions {
    return this.playerState.facing;
  }

  destroy(): void {
    this.debugger?.destroy();
    super.destroy();
  }
}
