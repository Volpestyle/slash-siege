import { Directions } from "../constants/general-enums";
import {
  PlayerAnimations,
  PlayerJumpTypes,
} from "../constants/player-constants/player-animation-enums";
import {
  PLAYER_GROUND_MOVEMENT_CONFIG,
  PLAYER_JUMP_CONFIG,
} from "../constants/player-constants/player-physics-constants";
import { PlayerJumpStages } from "../constants/player-constants/player-state-enum";
import {
  PlayerInput,
  PlayerStateInterface,
} from "../types/player-types/player-state-types";

export class PlayerState implements PlayerStateInterface {
  position = { x: 0, y: 0 };
  velocity = { x: 0, y: 0 };
  facing = Directions.Right;
  animation = PlayerAnimations.Idle;
  movement = {
    isWalking: false,
    isAccelerating: false,
    switchTargetDirection: null as Directions | null,
    stoppingInitialSpeed: null as number | null,
  };
  jump = {
    jumpStage: PlayerJumpStages.grounded,
    hasReleasedSpace: true,
    jumpType: null as PlayerJumpTypes | null,
    velocityApplied: false,
    maxFallVelocity: 0,
    wasAcceleratingOnLand: false,
  };
  physics = {
    onFloor: false,
  };

  static create(x: number, y: number): PlayerState {
    const state = new PlayerState();
    state.position.x = x;
    state.position.y = y;
    return state;
  }

  isGrounded(): boolean {
    return this.jump.jumpStage === PlayerJumpStages.grounded;
  }

  isJumping(): boolean {
    return this.jump.jumpStage === PlayerJumpStages.jumping;
  }

  isLanding(): boolean {
    return this.jump.jumpStage === PlayerJumpStages.landing;
  }

  isFalling(): boolean {
    return this.jump.jumpStage === PlayerJumpStages.falling;
  }

  // Jump state management
  updateJump(input: PlayerInput): void {
    this.updateMaxFallVelocity();

    if (this.canStartJump(input)) {
      this.initiateJump(input);
      return;
    }

    if (this.shouldTransitionToFalling()) {
      this.transitionToFalling();
      return;
    }

    if (this.shouldLand()) {
      this.transitionToLanding();
      return;
    }

    this.jump.hasReleasedSpace = !input.space;
  }

  private updateMaxFallVelocity(): void {
    if (this.isFalling()) {
      this.jump.maxFallVelocity = Math.max(
        this.jump.maxFallVelocity,
        this.velocity.y
      );
    }
  }

  private canStartJump(input: PlayerInput): boolean {
    return input.space && this.jump.hasReleasedSpace && this.isGrounded();
  }

  private shouldTransitionToFalling(): boolean {
    return this.isJumping() && this.jump.velocityApplied && this.velocity.y > 0;
  }

  private shouldLand(): boolean {
    return (this.isJumping() || this.isFalling()) && this.physics.onFloor;
  }

  private determineJumpType(input: PlayerInput): PlayerJumpTypes {
    if (Math.abs(this.velocity.x) > 300) return PlayerJumpTypes.Run;
    if (input.left || input.right) return PlayerJumpTypes.Forward;
    return PlayerJumpTypes.Neutral;
  }

  private initiateJump(input: PlayerInput): void {
    const jumpType = this.determineJumpType(input);
    const direction = this.facing === Directions.Left ? -1 : 1;

    switch (jumpType) {
      case PlayerJumpTypes.Run:
        this.velocity.x = PLAYER_JUMP_CONFIG.RUN_JUMP_VELOCITY_X * direction;
        this.velocity.y = PLAYER_JUMP_CONFIG.RUN_JUMP_VELOCITY_Y;
        break;
      case PlayerJumpTypes.Forward:
        this.velocity.x =
          PLAYER_JUMP_CONFIG.FORWARD_JUMP_VELOCITY_X * direction;
        this.velocity.y = PLAYER_JUMP_CONFIG.FORWARD_JUMP_VELOCITY_Y;
        break;
      default:
        this.velocity.x = 0;
        this.velocity.y = PLAYER_JUMP_CONFIG.JUMP_VELOCITY;
    }

    this.jump.jumpStage = PlayerJumpStages.jumping;
    this.jump.hasReleasedSpace = false;
    this.jump.jumpType = jumpType;
    this.jump.velocityApplied = true;
    this.jump.maxFallVelocity = 0;
  }

  private transitionToFalling(): void {
    this.jump.jumpStage = PlayerJumpStages.falling;
    this.jump.maxFallVelocity = Math.max(
      this.jump.maxFallVelocity,
      this.velocity.y
    );
  }

  private transitionToLanding(): void {
    this.jump.jumpStage = PlayerJumpStages.landing;
    this.jump.wasAcceleratingOnLand = this.movement.isAccelerating;
  }

  // Movement state management
  updateMovement(input: PlayerInput): void {
    const wasAccelerating = this.movement.isAccelerating;
    const direction = this.getMovementDirection(input);
    const isAccelerating = Boolean(direction);

    if (wasAccelerating && !isAccelerating) {
      this.movement.stoppingInitialSpeed = Math.abs(this.velocity.x);
    }

    const targetVelocity = this.calculateTargetVelocity(input, direction);
    const acceleration = this.determineAcceleration(input);

    this.velocity.x = Phaser.Math.Linear(
      this.velocity.x,
      targetVelocity,
      (input.delta * acceleration) / PLAYER_GROUND_MOVEMENT_CONFIG.MAX_SPEED
    );

    if (direction) {
      this.facing = direction;
    }

    this.movement.isWalking = input.shift;
    this.movement.isAccelerating = isAccelerating;
  }

  private getMovementDirection(input: PlayerInput): Directions | null {
    if (input.left) return Directions.Left;
    if (input.right) return Directions.Right;
    return null;
  }

  private calculateTargetVelocity(
    input: PlayerInput,
    direction: Directions | null
  ): number {
    if (!direction) return 0;

    const maxSpeed = this.movement.isWalking
      ? PLAYER_GROUND_MOVEMENT_CONFIG.MAX_WALK_SPEED
      : PLAYER_GROUND_MOVEMENT_CONFIG.MAX_SPEED;

    return direction === Directions.Left ? -maxSpeed : maxSpeed;
  }

  private determineAcceleration(input: PlayerInput): number {
    if (!this.movement.isAccelerating) {
      return this.movement.isWalking
        ? PLAYER_GROUND_MOVEMENT_CONFIG.WALK_STOP_DECELERATION
        : PLAYER_GROUND_MOVEMENT_CONFIG.RUN_STOP_DECELERATION;
    }

    return this.movement.isWalking
      ? PLAYER_GROUND_MOVEMENT_CONFIG.WALK_ACCELERATION
      : PLAYER_GROUND_MOVEMENT_CONFIG.RUN_ACCELERATION;
  }

  // Animation state management
  updateAnimation(): void {
    const newAnimation = this.determineAnimation();
    if (newAnimation && newAnimation !== this.animation) {
      this.animation = newAnimation;
    }
  }

  private determineAnimation(): PlayerAnimations | null {
    // Jump animations take precedence
    if (this.isJumping()) {
      return jumpStartAnimations[this.jump.jumpType ?? PlayerJumpTypes.Neutral];
    }

    if (this.isFalling()) {
      return fallAnimations[this.jump.jumpType ?? PlayerJumpTypes.Neutral];
    }

    if (this.isLanding()) {
      return this.determineLandingAnimation();
    }

    // Ground movement animations
    if (!this.isGrounded()) return null;

    if (!this.movement.isAccelerating) {
      if (this.movement.stoppingInitialSpeed !== null) {
        return this.determineStoppingAnimation();
      }
      return null;
    } else if (this.movement.switchTargetDirection) {
      return PlayerAnimations.RunSwitch;
    }

    return this.determineMovementAnimation();
  }

  private determineLandingAnimation(): PlayerAnimations {
    const { jumpType, maxFallVelocity, wasAcceleratingOnLand } = this.jump;

    switch (jumpType) {
      case PlayerJumpTypes.Run:
        return maxFallVelocity > PLAYER_JUMP_CONFIG.HEAVY_LANDING_THRESHOLD
          ? PlayerAnimations.RunJumpLandHeavy
          : PlayerAnimations.RunJumpLandLight;

      case PlayerJumpTypes.Forward:
        if (maxFallVelocity > PLAYER_JUMP_CONFIG.MAX_HEAVY_LANDING_THRESHOLD) {
          return PlayerAnimations.RunJumpLandHeavy;
        }
        return wasAcceleratingOnLand
          ? PlayerAnimations.RunJumpLandLight
          : PlayerAnimations.JumpForwardLand;

      default:
        return PlayerAnimations.JumpNeutralLand;
    }
  }

  private determineStoppingAnimation(): PlayerAnimations {
    const speed = this.movement.stoppingInitialSpeed!;
    if (speed > PLAYER_GROUND_MOVEMENT_CONFIG.RUN_STOP_THRESHOLD) {
      return PlayerAnimations.RunStop;
    }
    if (speed > PLAYER_GROUND_MOVEMENT_CONFIG.RUN_STOP_SLOW_THRESHOLD) {
      return PlayerAnimations.RunStopSlow;
    }
    return PlayerAnimations.WalkStop;
  }

  private determineMovementAnimation(): PlayerAnimations | null {
    if (this.movement.isWalking) {
      return this.animation !== PlayerAnimations.WalkLoop
        ? PlayerAnimations.WalkStart
        : null;
    }

    const isRunning = [
      PlayerAnimations.RunLoop,
      PlayerAnimations.RunJumpLandHeavyContinue,
      PlayerAnimations.RunJumpLandLightContinue,
    ].includes(this.animation);
    return isRunning ? null : PlayerAnimations.RunStart;
  }

  // Animation completion handling
  handleAnimationComplete(animationKey: string): void {
    const animation = animationKey as PlayerAnimations;

    // Handle running transitions
    if (
      [
        PlayerAnimations.RunStart,
        PlayerAnimations.RunJumpLandHeavyContinue,
        PlayerAnimations.RunJumpLandLightContinue,
      ].includes(animation)
    ) {
      this.animation = PlayerAnimations.RunLoop;
      return;
    }

    // Handle walking transitions
    if (animation === PlayerAnimations.WalkStart) {
      this.animation = PlayerAnimations.WalkLoop;
      return;
    }

    // Handle stopping transitions
    if (
      [
        PlayerAnimations.RunJumpLandHeavyStop,
        PlayerAnimations.RunJumpLandLightStop,
        PlayerAnimations.RunStop,
        PlayerAnimations.RunStopSlow,
        PlayerAnimations.WalkStop,
      ].includes(animation)
    ) {
      this.movement.stoppingInitialSpeed = null;
      this.animation = PlayerAnimations.Idle;
      return;
    }

    // Handle landing transitions
    if (
      [
        PlayerAnimations.RunJumpLandHeavy,
        PlayerAnimations.RunJumpLandLight,
        PlayerAnimations.JumpForwardLand,
        PlayerAnimations.JumpNeutralLand,
      ].includes(animation)
    ) {
      this.jump.jumpStage = PlayerJumpStages.grounded;
      this.jump.jumpType = null;
      this.movement.stoppingInitialSpeed = null;

      switch (animation) {
        case PlayerAnimations.RunJumpLandHeavy:
          this.animation = this.movement.isAccelerating
            ? PlayerAnimations.RunJumpLandHeavyContinue
            : PlayerAnimations.RunJumpLandHeavyStop;
          break;
        case PlayerAnimations.RunJumpLandLight:
          this.animation = this.movement.isAccelerating
            ? PlayerAnimations.RunJumpLandLightContinue
            : PlayerAnimations.RunJumpLandLightStop;
          break;
        default:
          this.animation = PlayerAnimations.Idle;
      }
      return;
    }

    // Handle direction switch completion
    if (animation === PlayerAnimations.RunSwitch) {
      this.movement.switchTargetDirection = null;
    }
  }

  // Main update method
  update(input: PlayerInput): void {
    this.updateJump(input);
    this.updateMovement(input);
    this.updateAnimation();
  }

  // Physics state update
  updatePhysics(
    x: number,
    y: number,
    vx: number,
    vy: number,
    onFloor: boolean
  ): void {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = vx;
    this.velocity.y = vy;
    this.physics.onFloor = onFloor;
  }
}

// Animation maps at module level to avoid recreation
const jumpStartAnimations: Record<PlayerJumpTypes, PlayerAnimations> = {
  [PlayerJumpTypes.Run]: PlayerAnimations.RunJumpStart,
  [PlayerJumpTypes.Forward]: PlayerAnimations.JumpForwardStart,
  [PlayerJumpTypes.Neutral]: PlayerAnimations.JumpNeutralStart,
};

const fallAnimations: Record<PlayerJumpTypes, PlayerAnimations> = {
  [PlayerJumpTypes.Run]: PlayerAnimations.RunJumpFall,
  [PlayerJumpTypes.Forward]: PlayerAnimations.JumpForwardFall,
  [PlayerJumpTypes.Neutral]: PlayerAnimations.JumpNeutralFall,
};
