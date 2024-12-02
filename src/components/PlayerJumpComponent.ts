import {
  AnimationHandler,
  AnimationState,
  Direction,
} from "../types/animation";
import { JumpType } from "../types/player-physics";
import {
  GROUND_MOVEMENT_CONFIG,
  JUMP_CONFIG,
} from "../constants/player-physics";

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
    maxFallVelocity: 0,
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

    this.jumpState.maxFallVelocity = Math.max(
      this.jumpState.maxFallVelocity,
      body.velocity.y
    );

    // Handle landing before anything else
    if (
      this.jumpState.isFalling &&
      body.onFloor() &&
      !this.jumpState.isLanding &&
      body.velocity.y >= 0 &&
      !currentState.includes("land")
    ) {
      this.jumpState.landingStartVelocity = body.velocity.x;
      this.handleLanding(transitionTo, cursors);
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
      const direction = cursors.left.isDown ? "left" : "right";
      setFacingDirection(direction);
      if (Math.abs(body.velocity.x) > 300) {
        this.handleRunJump(body, moveDirection, transitionTo);
      } else if (cursors.left.isDown || cursors.right.isDown) {
        this.handleDirectionalJump(body, direction, transitionTo);
      } else {
        this.handleNeutralJump(body, transitionTo);
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

  public handleLandingDeceleration(deltaSeconds: number): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    if (this.jumpState.isLanding) {
      const newVelocity = Phaser.Math.Linear(
        body.velocity.x,
        0,
        deltaSeconds * (GROUND_MOVEMENT_CONFIG.IDLE_DECELERATION / 1000)
      );

      body.setVelocityX(newVelocity);

      if (Math.abs(newVelocity) < 1) {
        body.setVelocityX(0);
      }
    }
  }

  private handleNeutralJump(
    body: Phaser.Physics.Arcade.Body,
    transitionTo: AnimationHandler
  ): void {
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
    transitionTo("jumpNeutralStart");
  }

  private handleDirectionalJump(
    body: Phaser.Physics.Arcade.Body,
    moveDirection: Direction,
    transitionTo: AnimationHandler
  ): void {
    this.jumpState.currentJumpType = "forward";

    const frameListener = (
      animation: Phaser.Animations.Animation,
      frame: Phaser.Animations.AnimationFrame
    ) => {
      if (animation.key === "jump-forward-start" && frame.index === 12) {
        console.log("Applying directional jump velocity");
        body.setVelocity(
          moveDirection === "left"
            ? -JUMP_CONFIG.FORWARD_JUMP_VELOCITY_X
            : JUMP_CONFIG.FORWARD_JUMP_VELOCITY_X,
          JUMP_CONFIG.FORWARD_JUMP_VELOCITY_Y
        );
        this.jumpState.velocityApplied = true;
        this.sprite.off("animationupdate", frameListener);
      }
    };

    this.sprite.on("animationupdate", frameListener);
    transitionTo("jumpForwardStart");
  }

  private handleRunJump(
    body: Phaser.Physics.Arcade.Body,
    moveDirection: Direction,
    transitionTo: AnimationHandler
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
    transitionTo("runJumpStart");
  }

  private handleFalling(transitionTo: AnimationHandler): void {
    console.log("Transitioning to fall state");
    this.jumpState.isJumping = false;
    this.jumpState.isFalling = true;

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

  private handleLanding(
    transitionTo: AnimationHandler,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
  ): void {
    console.log("Starting landing animation");
    this.jumpState.isFalling = false;
    this.jumpState.isLanding = true;

    switch (this.jumpState.currentJumpType) {
      case "run":
        if (
          this.jumpState.maxFallVelocity > JUMP_CONFIG.HEAVY_LANDING_THRESHOLD
        ) {
          transitionTo("runJumpLandHeavy");
        } else {
          transitionTo("runJumpLandLight");
        }
        break;
      case "forward":
        if (
          this.jumpState.maxFallVelocity >
          JUMP_CONFIG.MAX_HEAVY_LANDING_THRESHOLD
        ) {
          transitionTo("runJumpLandHeavy");
        } else if (this.jumpState.landingStartVelocity > 200) {
          transitionTo("runJumpLandLight");
        } else {
          transitionTo("jumpForwardLand");
        }
        break;
      case "neutral":
        transitionTo("jumpNeutralLand");
        break;
    }

    // Reset the maximum fall velocity
    this.jumpState.maxFallVelocity = 0;
  }

  private cleanupJumpListeners(): void {
    this.sprite.off("animationupdate");
  }

  public finishLanding(): void {
    console.log("Finishing landing sequence");
    this.cleanupJumpListeners();
    this.jumpState.isJumping = false;
    this.jumpState.isFalling = false;
    this.jumpState.isLanding = false;
    this.jumpState.velocityApplied = false;
    this.jumpState.landingStartVelocity = 0;
  }

  public destroy(): void {
    this.cleanupJumpListeners();
  }

  public isInJumpState(): boolean {
    return (
      this.jumpState.isJumping ||
      this.jumpState.isFalling ||
      this.jumpState.isLanding
    );
  }

  public isJumping(): boolean {
    return this.jumpState.isJumping;
  }

  public isLanding(): boolean {
    return this.jumpState.isLanding;
  }
}
