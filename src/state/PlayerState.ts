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
  PlayerJumpState,
  PlayerMovementState,
  PlayerPhysicsState,
  PlayerStateInterface,
  StateUpdater,
  Vec2,
} from "../types/player-types/player-state-types";
import {
  AnimationCategory,
  ANIMATION_METADATA,
  canInterruptAnimation,
  getAnimationCategory,
  getNextAnimation,
  STOPPING_ANIMATIONS,
  LANDING_ANIMATIONS,
  CONTINUOUS_ANIMATIONS,
} from "../constants/player-constants/player-animation-metadata";

export class PlayerState implements PlayerStateInterface {
  private state: PlayerStateInterface;

  constructor() {
    this.state = {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      facing: Directions.Right,
      animation: PlayerAnimations.Idle,
      movement: {
        isWalking: false,
        isAccelerating: false,
        switchTargetDirection: null,
        stoppingInitialSpeed: null,
      },
      jump: {
        jumpStage: PlayerJumpStages.grounded,
        hasReleasedSpace: true,
        jumpType: null,
        velocityApplied: false,
        maxFallVelocity: 0,
        wasAcceleratingOnLand: false,
      },
      physics: {
        onFloor: false,
      },
    };
  }

  // Getters for readonly access to state
  get position(): Readonly<Vec2> {
    return this.state.position;
  }
  get velocity(): Readonly<Vec2> {
    return this.state.velocity;
  }
  get facing(): Directions {
    return this.state.facing;
  }
  get animation(): PlayerAnimations {
    return this.state.animation;
  }
  get movement(): Readonly<PlayerMovementState> {
    return this.state.movement;
  }
  get jump(): Readonly<PlayerJumpState> {
    return this.state.jump;
  }
  get physics(): Readonly<PlayerPhysicsState> {
    return this.state.physics;
  }

  // Type-safe state updaters
  private updateState(updater: StateUpdater<PlayerStateInterface>): void {
    this.state = updater(this.state);
  }

  private updatePosition(updater: StateUpdater<Vec2>): void {
    this.updateState((state) => ({
      ...state,
      position: updater(state.position),
    }));
  }

  private updateVelocity(updater: StateUpdater<Vec2>): void {
    this.updateState((state) => ({
      ...state,
      velocity: updater(state.velocity),
    }));
  }

  private updateMovement(updater: StateUpdater<PlayerMovementState>): void {
    this.updateState((state) => ({
      ...state,
      movement: updater(state.movement),
    }));
  }

  private updateJump(updater: StateUpdater<PlayerJumpState>): void {
    this.updateState((state) => ({
      ...state,
      jump: updater(state.jump),
    }));
  }

  // Helper method for creating new instances
  static create(x: number, y: number): PlayerState {
    const state = new PlayerState();
    state.updatePosition(() => ({ x, y }));
    return state;
  }

  // State checks
  isGrounded(): boolean {
    return this.state.jump.jumpStage === PlayerJumpStages.grounded;
  }

  isJumping(): boolean {
    return this.state.jump.jumpStage === PlayerJumpStages.jumping;
  }

  isLanding(): boolean {
    return this.state.jump.jumpStage === PlayerJumpStages.landing;
  }

  isFalling(): boolean {
    return this.state.jump.jumpStage === PlayerJumpStages.falling;
  }

  // Jump state management
  private updateJumpState(input: PlayerInput): void {
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

    this.updateJump((jump) => ({
      ...jump,
      hasReleasedSpace: !input.space,
    }));
  }

  private updateMaxFallVelocity(): void {
    if (this.isFalling()) {
      this.updateJump((jump) => ({
        ...jump,
        maxFallVelocity: Math.max(jump.maxFallVelocity, this.state.velocity.y),
      }));
    }
  }

  private canStartJump(input: PlayerInput): boolean {
    return input.space && this.state.jump.hasReleasedSpace && this.isGrounded();
  }

  private shouldTransitionToFalling(): boolean {
    return (
      this.isJumping() &&
      this.state.jump.velocityApplied &&
      this.state.velocity.y > 0
    );
  }

  private shouldLand(): boolean {
    return (this.isJumping() || this.isFalling()) && this.state.physics.onFloor;
  }

  private initiateJump(input: PlayerInput): void {
    const jumpType = this.determineJumpType(input);
    const direction = this.state.facing === Directions.Left ? -1 : 1;

    let velocityX = 0;
    let velocityY = PLAYER_JUMP_CONFIG.JUMP_VELOCITY;

    switch (jumpType) {
      case PlayerJumpTypes.Run:
        velocityX = PLAYER_JUMP_CONFIG.RUN_JUMP_VELOCITY_X * direction;
        velocityY = PLAYER_JUMP_CONFIG.RUN_JUMP_VELOCITY_Y;
        break;
      case PlayerJumpTypes.Forward:
        velocityX = PLAYER_JUMP_CONFIG.FORWARD_JUMP_VELOCITY_X * direction;
        velocityY = PLAYER_JUMP_CONFIG.FORWARD_JUMP_VELOCITY_Y;
        break;
    }

    this.updateJump((jump) => ({
      ...jump,
      jumpStage: PlayerJumpStages.jumping,
      hasReleasedSpace: false,
      jumpType,
      velocityApplied: true,
      maxFallVelocity: 0,
    }));

    this.updateVelocity(() => ({ x: velocityX, y: velocityY }));
  }

  private determineJumpType(input: PlayerInput): PlayerJumpTypes {
    if (Math.abs(this.state.velocity.x) > 300) return PlayerJumpTypes.Run;
    if (input.left || input.right) return PlayerJumpTypes.Forward;
    return PlayerJumpTypes.Neutral;
  }

  private transitionToFalling(): void {
    this.updateJump((jump) => ({
      ...jump,
      jumpStage: PlayerJumpStages.falling,
      maxFallVelocity: Math.max(jump.maxFallVelocity, this.state.velocity.y),
    }));
  }

  private transitionToLanding(): void {
    this.updateJump((jump) => ({
      ...jump,
      jumpStage: PlayerJumpStages.landing,
      wasAcceleratingOnLand: this.state.movement.isAccelerating,
    }));
  }

  // Movement state management
  private updateMovementState(input: PlayerInput): void {
    const wasAccelerating = this.state.movement.isAccelerating;
    const direction = this.getMovementDirection(input);
    const isAccelerating = Boolean(direction);

    if (wasAccelerating && !isAccelerating) {
      this.updateMovement((movement) => ({
        ...movement,
        stoppingInitialSpeed: Math.abs(this.state.velocity.x),
      }));
    }

    const targetVelocity = this.calculateTargetVelocity(input, direction);
    const acceleration = this.determineAcceleration(input);

    this.updateVelocity((velocity) => ({
      ...velocity,
      x: Phaser.Math.Linear(
        velocity.x,
        targetVelocity,
        (input.delta * acceleration) / PLAYER_GROUND_MOVEMENT_CONFIG.MAX_SPEED
      ),
    }));

    if (direction) {
      this.updateState((state) => ({ ...state, facing: direction }));
    }

    this.updateMovement((movement) => ({
      ...movement,
      isWalking: input.shift,
      isAccelerating,
    }));
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

    const maxSpeed = this.state.movement.isWalking
      ? PLAYER_GROUND_MOVEMENT_CONFIG.MAX_WALK_SPEED
      : PLAYER_GROUND_MOVEMENT_CONFIG.MAX_SPEED;

    return direction === Directions.Left ? -maxSpeed : maxSpeed;
  }

  private determineAcceleration(input: PlayerInput): number {
    if (!this.state.movement.isAccelerating) {
      return this.state.movement.isWalking
        ? PLAYER_GROUND_MOVEMENT_CONFIG.WALK_STOP_DECELERATION
        : PLAYER_GROUND_MOVEMENT_CONFIG.RUN_STOP_DECELERATION;
    }

    return this.state.movement.isWalking
      ? PLAYER_GROUND_MOVEMENT_CONFIG.WALK_ACCELERATION
      : PLAYER_GROUND_MOVEMENT_CONFIG.RUN_ACCELERATION;
  }

  // Animation state management
  private updateAnimationState(): void {
    const newAnimation = this.determineAnimation();
    if (newAnimation && newAnimation !== this.state.animation) {
      this.updateState((state) => ({ ...state, animation: newAnimation }));
    }
  }

  private determineAnimation(): PlayerAnimations | null {
    const currentCategory = getAnimationCategory(this.state.animation);

    // If current animation can't be interrupted, keep it
    if (!canInterruptAnimation(this.state.animation)) {
      return null;
    }

    // Jump animations take precedence
    if (this.isJumping()) {
      return this.getJumpStartAnimation();
    }

    if (this.isFalling()) {
      return this.getFallAnimation();
    }
    if (this.isLanding()) {
      return this.determineLandingAnimation();
    }

    // Ground movement animations
    if (!this.isGrounded()) return null;

    if (!this.state.movement.isAccelerating) {
      if (this.state.movement.stoppingInitialSpeed !== null) {
        return this.determineStoppingAnimation();
      }
      return PlayerAnimations.Idle;
    }

    if (this.state.movement.switchTargetDirection) {
      return PlayerAnimations.RunSwitch;
    }

    return this.determineMovementAnimation();
  }

  private determineStoppingAnimation(): PlayerAnimations {
    const speed = this.state.movement.stoppingInitialSpeed!;

    // Find the appropriate stopping animation based on speed threshold
    for (const [animation, metadata] of ANIMATION_METADATA.entries()) {
      if (
        metadata.category === AnimationCategory.Stopping &&
        metadata.speedThreshold &&
        speed > metadata.speedThreshold
      ) {
        return animation;
      }
    }

    return PlayerAnimations.WalkStop;
  }

  private getJumpStartAnimation(): PlayerAnimations {
    const jumpType = this.state.jump.jumpType ?? PlayerJumpTypes.Neutral;

    for (const [animation, metadata] of ANIMATION_METADATA.entries()) {
      if (
        metadata.category === AnimationCategory.Jumping &&
        metadata.jumpType === jumpType
      ) {
        return animation;
      }
    }
    return PlayerAnimations.JumpNeutralStart;
  }

  private getFallAnimation(): PlayerAnimations {
    const jumpType = this.state.jump.jumpType ?? PlayerJumpTypes.Neutral;

    for (const [animation, metadata] of ANIMATION_METADATA.entries()) {
      if (
        metadata.category === AnimationCategory.Falling &&
        metadata.jumpType === jumpType
      ) {
        return animation;
      }
    }
    return PlayerAnimations.JumpNeutralFall;
  }

  private determineLandingAnimation(): PlayerAnimations {
    const { jumpType, maxFallVelocity, wasAcceleratingOnLand } =
      this.state.jump;
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

  private determineMovementAnimation(): PlayerAnimations | null {
    if (this.state.movement.isWalking) {
      return this.state.animation !== PlayerAnimations.WalkLoop
        ? PlayerAnimations.WalkStart
        : null;
    }

    const currentCategory = getAnimationCategory(this.state.animation);
    return CONTINUOUS_ANIMATIONS.has(currentCategory)
      ? null
      : PlayerAnimations.RunStart;
  }

  // Animation completion handling
  handleAnimationComplete(animationKey: string): void {
    const animation = animationKey as PlayerAnimations;
    const nextAnimation = getNextAnimation(
      animation,
      this.state.movement.isAccelerating
    );

    if (LANDING_ANIMATIONS.has(animation)) {
      this.updateJump((jump) => ({
        ...jump,
        jumpStage: PlayerJumpStages.grounded,
        jumpType: null,
      }));

      this.updateMovement((movement) => ({
        ...movement,
        stoppingInitialSpeed: null,
      }));
    }

    if (STOPPING_ANIMATIONS.has(animation)) {
      this.updateMovement((movement) => ({
        ...movement,
        stoppingInitialSpeed: null,
      }));
    }

    if (animation === PlayerAnimations.RunSwitch) {
      this.updateMovement((movement) => ({
        ...movement,
        switchTargetDirection: null,
      }));
    }

    if (nextAnimation) {
      this.updateState((state) => ({
        ...state,
        animation: nextAnimation,
      }));
    }
  }

  // Physics state update
  updatePhysics(
    x: number,
    y: number,
    vx: number,
    vy: number,
    onFloor: boolean
  ): void {
    this.updatePosition(() => ({ x, y }));
    this.updateVelocity(() => ({ x: vx, y: vy }));
    this.updateState((state) => ({
      ...state,
      physics: { onFloor },
    }));
  }

  // Main update method
  update(input: PlayerInput): void {
    this.updateJumpState(input);
    this.updateMovementState(input);
    this.updateAnimationState();
  }
}
