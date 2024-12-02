import {
  AnimationHandler,
  AnimationState,
  Direction,
} from "../types/animation";
import { GROUND_MOVEMENT_CONFIG } from "../constants/player-physics";

export class PlayerMovementComponent {
  private sprite: Phaser.Physics.Arcade.Sprite;
  private moveState = {
    velocity: 0,
    moveDirection: "right" as Direction,
    isAccelerating: false,
    isWalking: false,
    wasWalking: false,
    switchTargetDirection: null as Direction | null,
  };

  constructor(sprite: Phaser.Physics.Arcade.Sprite) {
    this.sprite = sprite;
  }

  public resetMovementState(): void {
    this.moveState.velocity = 0;
    this.moveState.isAccelerating = false;
    this.moveState.isWalking = false;
    this.moveState.wasWalking = false;
    this.moveState.switchTargetDirection = null;
  }

  handleMovement(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    deltaSeconds: number,
    getCurrentState: () => AnimationState,
    transitionTo: AnimationHandler,
    setFacingDirection: (direction: Direction) => void,
    isLanding: boolean
  ): void {
    const newDirection: Direction | null = cursors.left.isDown
      ? "left"
      : cursors.right.isDown
      ? "right"
      : null;

    this.moveState.isAccelerating = Boolean(newDirection);

    const currentState = getCurrentState();

    // Only update walking state and handle normal movement if we're not in a landing state
    if (!isLanding) {
      const isNowWalking = cursors.shift.isDown;
      const walkingStateChanged = this.moveState.isWalking !== isNowWalking;
      this.moveState.wasWalking = this.moveState.isWalking;
      this.moveState.isWalking = isNowWalking;

      // Handle run switch state
      if (currentState === "runSwitch") {
        this.moveState.moveDirection = this.moveState.switchTargetDirection!;
        this.moveState.isAccelerating = true;

        if (this.moveState.switchTargetDirection !== newDirection) {
          transitionTo("runStopSlow");
          this.moveState.switchTargetDirection = null;
          this.moveState.isAccelerating = false;
          return;
        }
      }

      if (newDirection) {
        const oppositeDirection = newDirection !== this.moveState.moveDirection;
        const aboveThreshold =
          Math.abs(this.moveState.velocity) >
          GROUND_MOVEMENT_CONFIG.DIRECTION_SWITCH_THRESHOLD;

        if (walkingStateChanged) {
          transitionTo(isNowWalking ? "walkStart" : "runStart");
        }

        if (
          oppositeDirection &&
          aboveThreshold &&
          currentState !== "runSwitch"
        ) {
          if (!this.moveState.isWalking) {
            this.moveState.switchTargetDirection = newDirection;
            this.moveState.isAccelerating = true;
            transitionTo("runSwitch");
            setFacingDirection(newDirection);
          } else {
            this.moveState.moveDirection = newDirection;
            setFacingDirection(newDirection);
          }
        } else if (
          ["idle", "runStop", "runStopSlow", "walkStop"].includes(currentState)
        ) {
          transitionTo(this.moveState.isWalking ? "walkStart" : "runStart");
        }
        this.moveState.moveDirection = newDirection;
        setFacingDirection(newDirection);
        this.moveState.isAccelerating = true;
      } else {
        this.handleNoDirectionalMovement(getCurrentState, transitionTo);
      }
    } else {
      // During landing, just update direction and acceleration based on input
      if (newDirection) {
        this.moveState.moveDirection = newDirection;
        setFacingDirection(newDirection);
        this.moveState.isAccelerating = true;
      } else {
        this.moveState.isAccelerating = false;
      }
    }

    this.updateVelocity(deltaSeconds, getCurrentState);
  }

  private handleNoDirectionalMovement(
    getCurrentState: () => string,
    transitionTo: (state: AnimationState) => void
  ): void {
    this.moveState.isAccelerating = false;
    const currentState = getCurrentState();
    const currentSpeed = Math.abs(this.moveState.velocity);

    if (currentState === "runLoop" || currentState === "runStart") {
      if (currentSpeed > GROUND_MOVEMENT_CONFIG.RUN_STOP_THRESHOLD) {
        transitionTo("runStop");
      } else if (
        currentSpeed > GROUND_MOVEMENT_CONFIG.RUN_STOP_SLOW_THRESHOLD
      ) {
        transitionTo("runStopSlow");
      } else {
        transitionTo("idle");
      }
    } else if (currentState === "walkLoop") {
      transitionTo("walkStop");
    }
  }

  private updateVelocity(
    deltaSeconds: number,
    getCurrentState: () => string
  ): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.moveState.velocity = body.velocity.x;

    const maxSpeed = this.moveState.isWalking
      ? GROUND_MOVEMENT_CONFIG.MAX_WALK_SPEED
      : GROUND_MOVEMENT_CONFIG.MAX_SPEED;

    const targetVelocity = this.moveState.isAccelerating
      ? this.moveState.moveDirection === "left"
        ? -maxSpeed
        : maxSpeed
      : 0;

    const acceleration = this.calculateAcceleration(getCurrentState);
    const deceleration = this.calculateDeceleration(getCurrentState);

    this.moveState.velocity = Phaser.Math.Linear(
      this.moveState.velocity,
      targetVelocity,
      (deltaSeconds *
        (this.moveState.isAccelerating ? acceleration : deceleration)) /
        maxSpeed
    );

    this.sprite.setVelocityX(this.moveState.velocity);
  }

  private calculateAcceleration(getCurrentState: () => string): number {
    const currentState = getCurrentState();
    const currentFrame = this.sprite.anims.currentFrame?.index;
    const isLandingContinue =
      currentState === "runJumpLandLightContinue" ||
      currentState === "runJumpLandHeavyContinue";

    if (currentState === "runStart" && currentFrame !== undefined) {
      return currentFrame < GROUND_MOVEMENT_CONFIG.INITIAL_FRAMES_THRESHOLD
        ? GROUND_MOVEMENT_CONFIG.RUN_START_INITIAL_ACCELERATION
        : GROUND_MOVEMENT_CONFIG.RUN_START_ACCELERATION;
    }

    if (isLandingContinue) {
      return GROUND_MOVEMENT_CONFIG.RUN_START_ACCELERATION;
    }

    return this.moveState.isWalking
      ? GROUND_MOVEMENT_CONFIG.WALK_ACCELERATION
      : GROUND_MOVEMENT_CONFIG.RUN_ACCELERATION;
  }

  private calculateDeceleration(getCurrentState: () => string): number {
    if (["idle", "runStopSlow"].includes(getCurrentState())) {
      return GROUND_MOVEMENT_CONFIG.IDLE_DECELERATION;
    }
    return this.moveState.isWalking
      ? GROUND_MOVEMENT_CONFIG.WALK_STOP_DECELERATION
      : GROUND_MOVEMENT_CONFIG.RUN_STOP_DECELERATION;
  }

  public getMoveDirection(): Direction {
    return this.moveState.moveDirection ?? this.moveState.switchTargetDirection;
  }

  public getSwitchTargetDirection(): Direction | null {
    return this.moveState.switchTargetDirection;
  }

  public isWalking(): boolean {
    return this.moveState.isWalking;
  }

  public isAccelerating(): boolean {
    return this.moveState.isAccelerating;
  }
}
