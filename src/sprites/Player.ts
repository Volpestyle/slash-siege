import { PlayerAnimator } from "../utils/PlayerAnimator";
import { ANIMATION } from "../constants/animation";
import { AnimationState } from "../types/animation";
import { DebugSpriteConfig } from "../types/spriteDebug";
import { DebugComponent } from "../utils/SpriteDebug";
import {
  JUMP_CONFIG,
  GROUND_MOVEMENT_CONFIG,
} from "../constants/player-physics";
import { PlayerJumpComponent } from "../components/PlayerJumpComponent";
import { PlayerMovementComponent } from "../components/PlayerMovementComponent";
export class Player extends Phaser.Physics.Arcade.Sprite {
  private animator: PlayerAnimator;
  private debugComponent?: DebugComponent;
  private jumpComponent: PlayerJumpComponent;
  private movementComponent: PlayerMovementComponent;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    debug?: DebugSpriteConfig
  ) {
    super(scene, x, y, "player");

    this.scene.physics.add.existing(this);
    this.scene.add.existing(this);
    this.setOrigin(0.5, 0.5);
    this.setScale(ANIMATION.SCALE);
    this.setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(JUMP_CONFIG.GRAVITY);

    this.animator = new PlayerAnimator(this, this.handleAnimationComplete);
    this.jumpComponent = new PlayerJumpComponent(this);
    this.movementComponent = new PlayerMovementComponent(this);
    this.cursors = this.scene.input.keyboard!.createCursorKeys();

    if (debug) {
      this.debugComponent = new DebugComponent(this, debug);
    }
  }

  private handleAnimationComplete = (state: AnimationState): void => {
    console.log("Animation complete:", state);
    const body = this.body as Phaser.Physics.Arcade.Body;

    switch (state) {
      case "runJumpLandHeavy":
        const isMovingHeavy =
          this.cursors.left.isDown || this.cursors.right.isDown;
        // Call finishLanding here before transitioning to continue/stop
        this.jumpComponent.finishLanding();
        this.animator.transitionTo(
          isMovingHeavy ? "runJumpLandHeavyContinue" : "runJumpLandHeavyStop"
        );
        break;

      case "runJumpLandLight":
        const isMovingLight =
          this.cursors.left.isDown || this.cursors.right.isDown;
        // Call finishLanding here before transitioning to continue/stop
        this.jumpComponent.finishLanding();
        this.animator.transitionTo(
          isMovingLight ? "runJumpLandLightContinue" : "runJumpLandLightStop"
        );
        break;

      case "runJumpLandHeavyContinue":
      case "runJumpLandLightContinue":
        const stillMoving =
          this.cursors.left.isDown || this.cursors.right.isDown;
        if (stillMoving) {
          this.animator.transitionTo("runLoop");
        } else if (
          Math.abs(body.velocity.x) > GROUND_MOVEMENT_CONFIG.RUN_STOP_THRESHOLD
        ) {
          this.animator.transitionTo("runStop");
        } else if (
          Math.abs(body.velocity.x) >
          GROUND_MOVEMENT_CONFIG.RUN_STOP_SLOW_THRESHOLD
        ) {
          this.animator.transitionTo("runStopSlow");
        } else {
          this.animator.transitionTo("idle");
        }
        break;

      case "runJumpLandHeavyStop":
      case "runJumpLandLightStop":
        this.animator.transitionTo("idle");
        break;

      case "jumpForwardLand":
      case "jumpNeutralLand":
        this.jumpComponent.finishLanding();
        this.animator.transitionTo("idle");
        break;

      case "runStart":
      case "walkStart":
        if (!this.jumpComponent.isInJumpState()) {
          this.animator.transitionTo(
            this.movementComponent.isWalking() ? "walkLoop" : "runLoop"
          );
        }
        break;

      case "runStop":
      case "walkStop":
        if (!this.jumpComponent.isInJumpState()) {
          this.animator.transitionTo("idle");
        }
        break;

      case "runSwitch":
        if (!this.jumpComponent.isInJumpState()) {
          if (this.movementComponent.isAccelerating()) {
            this.animator.transitionTo("runLoop");
          } else {
            if (
              Math.abs(body.velocity.x) >
              GROUND_MOVEMENT_CONFIG.RUN_STOP_THRESHOLD
            ) {
              this.animator.transitionTo("runStop");
            } else {
              this.animator.transitionTo("runStopSlow");
            }
          }
        }
        break;

      case "runStopSlow":
        this.animator.transitionTo("idle");
        break;
    }
  };

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, delta: number): void {
    if (delta === 0) return;

    const deltaSeconds = delta / 1000;

    // Handle jumping
    this.jumpComponent.handleJump(
      cursors,
      this.movementComponent.getMoveDirection(),
      () => this.animator.getCurrentState(),
      (state) => this.animator.transitionTo(state),
      (direction) => this.animator.setFacingDirection(direction)
    );

    // Handle landing deceleration when not holding a direction
    if (this.jumpComponent.isLanding()) {
      this.jumpComponent.handleLandingDeceleration(deltaSeconds);
    }

    // Handle movement if we're not jumping (but allow during landing)
    if (!this.jumpComponent.isInJumpState()) {
      this.movementComponent.handleMovement(
        cursors,
        deltaSeconds,
        () => this.animator.getCurrentState(),
        (state) => this.animator.transitionTo(state),
        (direction) => this.animator.setFacingDirection(direction),
        this.jumpComponent.isLanding()
      );
    }
  }

  destroy() {
    super.destroy();
    this.animator.destroy();
    this.jumpComponent.destroy();
    this.debugComponent?.destroy();
  }
}
