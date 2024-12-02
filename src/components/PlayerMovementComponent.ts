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
  };

  constructor(sprite: Phaser.Physics.Arcade.Sprite) {
    this.sprite = sprite;
  }

  public resetMovementState(): void {
    this.moveState.velocity = 0;
    this.moveState.isAccelerating = false;
  }

  handleMovement(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    deltaSeconds: number,
    getCurrentState: () => AnimationState,
    transitionTo: AnimationHandler,
    setFacingDirection: (direction: Direction) => void
  ): void {
    const newDirection: Direction | null = cursors.left.isDown
      ? "left"
      : cursors.right.isDown
      ? "right"
      : null;

    const isNowWalking = cursors.shift.isDown;
    const walkingStateChanged = this.moveState.isWalking !== isNowWalking;
    this.moveState.wasWalking = this.moveState.isWalking;
    this.moveState.isWalking = isNowWalking;

    if (newDirection) {
      this.handleDirectionalMovement(
        newDirection,
        walkingStateChanged,
        getCurrentState,
        transitionTo,
        setFacingDirection
      );
    } else {
      this.handleNoDirectionalMovement(getCurrentState, transitionTo);
    }

    this.updateVelocity(deltaSeconds, getCurrentState);
  }

  private handleDirectionalMovement(
    newDirection: Direction,
    walkingStateChanged: boolean,
    getCurrentState: () => string,
    transitionTo: (state: AnimationState) => void,
    setFacingDirection: (direction: Direction) => void
  ): void {
    const oppositeDirection = newDirection !== this.moveState.moveDirection;
    const aboveThreshold =
      Math.abs(this.moveState.velocity) >
      GROUND_MOVEMENT_CONFIG.DIRECTION_SWITCH_THRESHOLD;
    const currentState = getCurrentState();

    if (oppositeDirection && aboveThreshold && currentState !== "runSwitch") {
      if (!this.moveState.isWalking) {
        this.moveState.moveDirection = newDirection;
        transitionTo("runSwitch");
        this.moveState.isAccelerating = true;
      } else {
        this.moveState.moveDirection = newDirection;
        setFacingDirection(newDirection);
      }
    } else if (["idle", "runStop", "walkStop"].includes(currentState)) {
      this.moveState.moveDirection = newDirection;
      setFacingDirection(newDirection);
      transitionTo(this.moveState.isWalking ? "walkStart" : "runStart");
    }

    if (
      walkingStateChanged &&
      !this.moveState.isWalking &&
      ["walkLoop", "walkStart"].includes(currentState)
    ) {
      transitionTo("runStart");
    }

    this.moveState.isAccelerating = true;
  }

  private handleNoDirectionalMovement(
    getCurrentState: () => string,
    transitionTo: (state: AnimationState) => void
  ): void {
    this.moveState.isAccelerating = false;
    const currentState = getCurrentState();
    const stopThreshold = this.moveState.isWalking
      ? GROUND_MOVEMENT_CONFIG.WALK_STOP_THRESHOLD
      : GROUND_MOVEMENT_CONFIG.RUN_STOP_THRESHOLD;

    if (currentState === "runLoop" || currentState === "walkLoop") {
      if (Math.abs(this.moveState.velocity) > stopThreshold) {
        transitionTo(this.moveState.isWalking ? "walkStop" : "runStop");
      } else {
        transitionTo("idle");
      }
    } else if (currentState === "runStart" || currentState === "walkStart") {
      transitionTo("idle");
    }
  }

  private updateVelocity(
    deltaSeconds: number,
    getCurrentState: () => string
  ): void {
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

    if (currentState === "runStart" && currentFrame !== undefined) {
      return currentFrame < GROUND_MOVEMENT_CONFIG.INITIAL_FRAMES_THRESHOLD
        ? GROUND_MOVEMENT_CONFIG.RUN_START_INITIAL_ACCELERATION
        : GROUND_MOVEMENT_CONFIG.RUN_START_ACCELERATION;
    }

    return this.moveState.isWalking
      ? GROUND_MOVEMENT_CONFIG.WALK_ACCELERATION
      : GROUND_MOVEMENT_CONFIG.ACCELERATION;
  }

  private calculateDeceleration(getCurrentState: () => string): number {
    if (getCurrentState() === "idle") {
      return GROUND_MOVEMENT_CONFIG.IDLE_DECELERATION;
    }
    return this.moveState.isWalking
      ? GROUND_MOVEMENT_CONFIG.WALK_STOP_DECELERATION
      : GROUND_MOVEMENT_CONFIG.RUN_STOP_DECELERATION;
  }

  public getMoveDirection(): Direction {
    return this.moveState.moveDirection;
  }

  public isWalking(): boolean {
    return this.moveState.isWalking;
  }

  public isAccelerating(): boolean {
    return this.moveState.isAccelerating;
  }
}
