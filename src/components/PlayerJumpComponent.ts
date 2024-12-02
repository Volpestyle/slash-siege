import {
  AnimationHandler,
  AnimationState,
  Direction,
} from "../types/animation";
import { JumpType } from "../types/player-physics";
import { JUMP_CONFIG } from "../constants/player-physics";

export class PlayerJumpComponent {
  private sprite: Phaser.Physics.Arcade.Sprite;
  private jumpState = {
    isJumping: false,
    isFalling: false,
    hasReleasedSpace: true,
    jumpStartTime: 0,
    fallStartTime: 0,
    currentJumpType: "neutral" as JumpType,
    velocityApplied: false,
    isLanding: false,
    landingStartVelocity: 0,
    hasLandingMomentum: false,
  };

  constructor(sprite: Phaser.Physics.Arcade.Sprite) {
    this.sprite = sprite;
  }

  public handleJump(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    moveDirection: Direction,
    getCurrentState: () => AnimationState,
    transitionTo: AnimationHandler,
    setFacingDirection: (direction: Direction) => void
  ): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const currentState = getCurrentState();

    // Handle landing before anything else
    if (
      this.jumpState.isFalling &&
      body.onFloor() &&
      !this.jumpState.isLanding &&
      body.velocity.y >= 0 &&
      !currentState.includes("land")
    ) {
      // Store the horizontal velocity at the moment of landing
      this.jumpState.landingStartVelocity = body.velocity.x;
      this.jumpState.hasLandingMomentum = true;
      this.handleLanding(transitionTo);
      return;
    }

    // Update landing deceleration
    if (this.jumpState.isLanding && this.jumpState.hasLandingMomentum) {
      this.updateLandingDeceleration(currentState);
      return;
    }

    // Handle jump initiation
    if (
      cursors.space.isDown &&
      this.jumpState.hasReleasedSpace &&
      body.onFloor() &&
      !this.jumpState.isJumping &&
      !this.jumpState.isFalling &&
      !this.jumpState.isLanding &&
      !currentState.includes("jump")
    ) {
      this.cleanupJumpListeners();

      this.jumpState.isJumping = true;
      this.jumpState.isFalling = false;
      this.jumpState.isLanding = false;
      this.jumpState.hasReleasedSpace = false;
      this.jumpState.velocityApplied = false;
      this.jumpState.jumpStartTime = this.sprite.scene.time.now;

      if (currentState.includes("run") && !currentState.includes("stop")) {
        this.handleRunJump(body, moveDirection);
      } else if (cursors.left.isDown || cursors.right.isDown) {
        this.handleDirectionalJump(body, cursors, setFacingDirection);
      } else {
        this.handleNeutralJump(body);
      }
      return;
    }

    // Handle falling transition
    if (
      this.jumpState.isJumping &&
      this.jumpState.velocityApplied &&
      !this.jumpState.isFalling &&
      !body.onFloor() &&
      body.velocity.y > 0 &&
      !currentState.includes("start")
    ) {
      this.handleFalling(transitionTo);
      return;
    }

    // Track space key release
    if (cursors.space.isUp) {
      this.jumpState.hasReleasedSpace = true;
    }
  }

  private updateLandingDeceleration(currentState: AnimationState): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Different deceleration rates based on landing type
    if (currentState.includes("neutral") || currentState.includes("forward")) {
      // Immediate stop for neutral and directional jumps
      body.setVelocityX(0);
      this.jumpState.hasLandingMomentum = false;
    } else {
      // For run jumps, get the current animation progress
      const anim = this.sprite.anims.currentAnim;
      const progress = this.sprite.anims.getProgress();

      if (anim) {
        // Calculate deceleration based on animation progress
        const remainingVelocity =
          this.jumpState.landingStartVelocity * (1 - progress);
        body.setVelocityX(remainingVelocity);

        // If we're very close to zero velocity, explicitly set it to zero
        // and mark momentum as finished to prevent further deceleration
        if (Math.abs(remainingVelocity) < 1) {
          body.setVelocityX(0);
          this.jumpState.hasLandingMomentum = false;
        }
      }
    }
  }

  private handleNeutralJump(body: Phaser.Physics.Arcade.Body): void {
    this.jumpState.currentJumpType = "neutral";

    const frameListener = (
      animation: Phaser.Animations.Animation,
      frame: Phaser.Animations.AnimationFrame
    ) => {
      if (animation.key === "jump-neutral-start" && frame.index === 13) {
        console.log("Applying neutral jump velocity");
        body.setVelocityY(JUMP_CONFIG.JUMP_VELOCITY);
        this.jumpState.velocityApplied = true;
        this.sprite.off("animationupdate", frameListener);
      }
    };

    this.sprite.on("animationupdate", frameListener);
    this.sprite.play("jump-neutral-start");
  }

  private handleDirectionalJump(
    body: Phaser.Physics.Arcade.Body,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    setFacingDirection: (direction: Direction) => void
  ): void {
    this.jumpState.currentJumpType = "forward";
    const direction = cursors.left.isDown ? "left" : "right";
    setFacingDirection(direction);

    const frameListener = (
      animation: Phaser.Animations.Animation,
      frame: Phaser.Animations.AnimationFrame
    ) => {
      if (animation.key === "jump-forward-start" && frame.index === 12) {
        console.log("Applying directional jump velocity");
        body.setVelocity(
          direction === "left"
            ? -JUMP_CONFIG.FORWARD_JUMP_VELOCITY_X
            : JUMP_CONFIG.FORWARD_JUMP_VELOCITY_X,
          JUMP_CONFIG.FORWARD_JUMP_VELOCITY_Y
        );
        this.jumpState.velocityApplied = true;
        this.sprite.off("animationupdate", frameListener);
      }
    };

    this.sprite.on("animationupdate", frameListener);
    this.sprite.play("jump-forward-start");
  }

  private handleRunJump(
    body: Phaser.Physics.Arcade.Body,
    moveDirection: Direction
  ): void {
    this.jumpState.currentJumpType = "run";

    const frameListener = (
      animation: Phaser.Animations.Animation,
      frame: Phaser.Animations.AnimationFrame
    ) => {
      if (animation.key === "run-jump-start" && frame.index === 8) {
        console.log("Applying run jump velocity");
        body.setVelocity(
          moveDirection === "left"
            ? -JUMP_CONFIG.RUN_JUMP_VELOCITY_X
            : JUMP_CONFIG.RUN_JUMP_VELOCITY_X,
          JUMP_CONFIG.RUN_JUMP_VELOCITY_Y
        );
        this.jumpState.velocityApplied = true;
      }
    };

    this.sprite.on("animationupdate", frameListener);
    this.sprite.play("run-jump-start", true);
  }

  private handleFalling(transitionTo: AnimationHandler): void {
    console.log("Transitioning to fall state");
    this.jumpState.isFalling = true;
    this.jumpState.fallStartTime = this.sprite.scene.time.now;

    switch (this.jumpState.currentJumpType) {
      case "run":
        transitionTo("runJumpFall");
        break;
      case "forward":
        transitionTo("jumpForwardFall");
        break;
      case "neutral":
        transitionTo("jumpNeutralFall");
        break;
    }
  }

  private handleLanding(transitionTo: AnimationHandler): void {
    console.log("Starting landing animation");
    this.jumpState.isLanding = true;
    const fallDuration =
      this.sprite.scene.time.now - this.jumpState.fallStartTime;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // If it's not a run jump, immediately stop
    if (this.jumpState.currentJumpType !== "run") {
      body.setVelocityX(0);
    }

    switch (this.jumpState.currentJumpType) {
      case "run":
        transitionTo(
          fallDuration > JUMP_CONFIG.HEAVY_LANDING_THRESHOLD
            ? "runJumpLandHeavy"
            : "runJumpLandLight"
        );
        break;
      case "forward":
        transitionTo("jumpForwardLand");
        break;
      case "neutral":
        transitionTo("jumpNeutralLand");
        break;
    }
  }

  private cleanupJumpListeners(): void {
    this.sprite.off("animationupdate");
  }

  public finishLanding(): void {
    console.log("Finishing landing sequence");
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Force velocity to zero at the end of landing
    body.setVelocityX(0);
    body.setVelocityY(0);

    this.cleanupJumpListeners();
    this.jumpState.isJumping = false;
    this.jumpState.isFalling = false;
    this.jumpState.isLanding = false;
    this.jumpState.velocityApplied = false;
    this.jumpState.landingStartVelocity = 0;
    this.jumpState.hasLandingMomentum = false;
  }

  public destroy(): void {
    this.cleanupJumpListeners();
  }

  public isInJumpState(): boolean {
    return this.jumpState.isJumping || this.jumpState.isLanding;
  }

  public isLanding(): boolean {
    return this.jumpState.isLanding;
  }
}
