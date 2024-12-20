import { Directions } from "../constants/general-enums";
import {
  PlayerAnimations,
  PlayerJumpTypes,
  PlayerLandingTypes,
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
  STOPPING_ANIMATIONS,
  LANDING_ANIMATIONS,
  PLAYER_ANIMATIONS,
  JUMPING_ANIMATIONS,
  TRANSITION_ANIMATIONS,
  RUNNING_ANIMATIONS,
} from "../constants/player-constants/player-animation-metadata";
import { getNextAnimation } from "../utils/animation-metadata-util";

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
        landingType: null,
        velocityApplied: false,
        maxFallVelocity: 0,
        wasAcceleratingOnLand: false,
      },
      physics: {
        onFloor: false,
      },
    };
  }

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

    // Don't check for landing/falling while waiting for jump physics
    if (this.isJumping() && !this.state.jump.velocityApplied) {
      return;
    }

    if (this.shouldTransitionToFalling()) {
      this.transitionToFalling();
      return;
    }

    if (this.shouldLand()) {
      this.transitionToLanding(input);
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
    return this.state.velocity.y > 100;
  }

  private shouldLand(): boolean {
    return (this.isJumping() || this.isFalling()) && this.state.physics.onFloor;
  }

  private initiateJump(input: PlayerInput): void {
    const jumpType = this.determineJumpType(input);
    const animation = this.determineJumpAnimation(jumpType);
    const hasPhysicsEvent =
      PLAYER_ANIMATIONS[animation]?.metadata.physicsFrameEvent;

    // Only apply velocity immediately if there's no physics event
    const velocityApplied = !hasPhysicsEvent;
    if (velocityApplied) {
      this.applyJumpVelocity(jumpType);
    }

    this.updateJump((jump) => ({
      ...jump,
      jumpStage: PlayerJumpStages.jumping,
      hasReleasedSpace: false,
      jumpType,
      velocityApplied,
      maxFallVelocity: 0,
    }));
  }

  private applyJumpVelocity(
    jumpType: PlayerJumpTypes,
    body?: Phaser.Physics.Arcade.Body
  ): void {
    const direction = this.state.facing === Directions.Left ? -1 : 1;
    let velocityX = this.state.velocity.x;
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

    if (body) {
      body.setVelocity(velocityX, velocityY);
    } else {
      this.updateVelocity(() => ({ x: velocityX, y: velocityY }));
    }
  }

  private determineJumpAnimation(jumpType: PlayerJumpTypes): PlayerAnimations {
    switch (jumpType) {
      case PlayerJumpTypes.Run:
        return PlayerAnimations.RunJumpStart;
      case PlayerJumpTypes.Forward:
        return PlayerAnimations.JumpForwardStart;
      default:
        return PlayerAnimations.JumpNeutralStart;
    }
  }

  private determineJumpType(input: PlayerInput): PlayerJumpTypes {
    if (Math.abs(this.state.velocity.x) > PLAYER_JUMP_CONFIG.RUN_JUMP_THRESHOLD)
      return PlayerJumpTypes.Run;
    if (input.left || input.right) return PlayerJumpTypes.Forward;
    return PlayerJumpTypes.Neutral;
  }

  private transitionToFalling(): void {
    this.updateJump((jump) => {
      return {
        ...jump,
        jumpStage: PlayerJumpStages.falling,
        maxFallVelocity: Math.max(jump.maxFallVelocity, this.state.velocity.y),
      };
    });
  }

  private transitionToLanding(input: PlayerInput): void {
    let landingType: PlayerLandingTypes | null = PlayerLandingTypes.Stationary;
    if (
      this.state.jump.maxFallVelocity >
        PLAYER_JUMP_CONFIG.MAX_HEAVY_LANDING_THRESHOLD ||
      input.down
    ) {
      landingType = PlayerLandingTypes.Heavy;
      // Apply impact velocity immediately on heavy landing
      const currentDirection =
        this.state.velocity.x > 0 ? Directions.Right : Directions.Left;
      const impactVelocity =
        currentDirection === Directions.Left
          ? -PLAYER_JUMP_CONFIG.HEAVY_LANDING_IMPACT_VELOCITY
          : PLAYER_JUMP_CONFIG.HEAVY_LANDING_IMPACT_VELOCITY;

      this.updateVelocity((velocity) => ({
        ...velocity,
        x: velocity.x + impactVelocity,
      }));
    } else if (input.left || input.right) {
      landingType = PlayerLandingTypes.Light;
    }
    this.updateJump((jump) => ({
      ...jump,
      jumpStage: PlayerJumpStages.landing,
      landingType,
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
    if (direction) {
      // Rolling-recovery
      if (this.state.jump.landingType === PlayerLandingTypes.Heavy) {
        return direction === Directions.Left
          ? -PLAYER_GROUND_MOVEMENT_CONFIG.ROLLING_SPEED
          : PLAYER_GROUND_MOVEMENT_CONFIG.ROLLING_SPEED;
      }
      // In a stationary jump animation (neutral/forward)
      if (
        (this.state.jump.jumpType !== PlayerJumpTypes.Run &&
          this.isJumping() &&
          !this.state.jump.velocityApplied) ||
        this.state.jump.landingType === PlayerLandingTypes.Stationary
      ) {
        return direction === Directions.Left
          ? -PLAYER_GROUND_MOVEMENT_CONFIG.STATIONARY_JUMP_SPEED
          : PLAYER_GROUND_MOVEMENT_CONFIG.STATIONARY_JUMP_SPEED;
      }
      let maxSpeed = this.state.movement.isWalking
        ? PLAYER_GROUND_MOVEMENT_CONFIG.MAX_WALK_SPEED
        : PLAYER_GROUND_MOVEMENT_CONFIG.MAX_SPEED;
      if (this.state.jump.landingType === PlayerLandingTypes.Light) {
        return direction === Directions.Left
          ? -maxSpeed * 0.85
          : maxSpeed * 0.85;
      }

      return direction === Directions.Left ? -maxSpeed : maxSpeed;
    }
    if (!this.state.physics.onFloor) return this.state.velocity.x;
    return 0;
  }

  private determineAcceleration(input: PlayerInput): number {
    if (!this.state.movement.isAccelerating) {
      return this.state.movement.isWalking
        ? PLAYER_GROUND_MOVEMENT_CONFIG.WALK_STOP_DECELERATION
        : PLAYER_GROUND_MOVEMENT_CONFIG.RUN_STOP_DECELERATION;
    }

    if (this.state.movement.isWalking)
      return PLAYER_GROUND_MOVEMENT_CONFIG.WALK_ACCELERATION;

    return PLAYER_GROUND_MOVEMENT_CONFIG.RUN_ACCELERATION;
  }

  // Animation state management
  private updateAnimationState(input: PlayerInput): void {
    const newAnimation = this.determineAnimation(input);
    if (newAnimation && newAnimation !== this.state.animation) {
      this.updateState((state) => ({
        ...state,
        animation: newAnimation,
      }));
    }
  }

  private determineAnimation(input: PlayerInput): PlayerAnimations | null {
    // jumping states
    if (this.isJumping()) {
      return this.getJumpStartAnimation();
    }

    if (this.isFalling()) {
      return this.getFallAnimation();
    }

    if (this.isLanding()) {
      if (LANDING_ANIMATIONS.has(this.state.animation)) return null;
      return this.getLandingAnimation(input);
    }

    // stopping animations
    if (!this.state.movement.isAccelerating) {
      // velocity based stopping animations
      if (this.state.movement.stoppingInitialSpeed !== null) {
        return this.getStoppingAnimation();
      }
      // transition to idle
      if (
        TRANSITION_ANIMATIONS.has(this.state.animation) &&
        STOPPING_ANIMATIONS.has(this.state.animation)
      )
        return null;
      return PlayerAnimations.Idle;
    }

    // direction based animations
    if (this.state.movement.switchTargetDirection) {
      return PlayerAnimations.RunSwitch;
    }

    // Walking can always cancel
    // movement will cancel out of stopping animations
    // movement will not cancel out of a transitional running animation
    if (
      !STOPPING_ANIMATIONS.has(this.state.animation) &&
      TRANSITION_ANIMATIONS.has(this.state.animation) &&
      RUNNING_ANIMATIONS.has(this.state.animation) &&
      !this.state.movement.isWalking
    ) {
      return null;
    }
    // movement animations
    return this.getMovementAnimation();
  }

  private getStoppingAnimation(): PlayerAnimations {
    const speed = this.state.movement.stoppingInitialSpeed!;

    // Find the appropriate stopping animation based on speed threshold
    for (const [animation, config] of Object.entries(PLAYER_ANIMATIONS)) {
      if (
        config.metadata.category === AnimationCategory.Stopping &&
        config.metadata.speedThreshold &&
        speed > config.metadata.speedThreshold
      ) {
        return animation as PlayerAnimations;
      }
    }

    return PlayerAnimations.WalkStop;
  }

  private getJumpStartAnimation(): PlayerAnimations {
    const jumpType = this.state.jump.jumpType ?? PlayerJumpTypes.Neutral;

    for (const [animation, config] of Object.entries(PLAYER_ANIMATIONS)) {
      if (
        config.metadata.category === AnimationCategory.Jumping &&
        config.metadata.typeSpecificData?.jumpType === jumpType
      ) {
        return animation as PlayerAnimations;
      }
    }
    return PlayerAnimations.JumpNeutralStart;
  }

  private getFallAnimation(): PlayerAnimations {
    const jumpType = this.state.jump.jumpType ?? PlayerJumpTypes.Neutral;

    for (const [animation, config] of Object.entries(PLAYER_ANIMATIONS)) {
      if (
        config.metadata.category === AnimationCategory.Falling &&
        config.metadata.typeSpecificData?.jumpType === jumpType
      ) {
        return animation as PlayerAnimations;
      }
    }
    return PlayerAnimations.JumpNeutralFall;
  }

  private getLandingAnimation(input: PlayerInput): PlayerAnimations {
    const { jumpType, landingType, maxFallVelocity, wasAcceleratingOnLand } =
      this.state.jump;
    switch (landingType) {
      case PlayerLandingTypes.Heavy:
        const currentDirection =
          this.state.velocity.x > 0 ? Directions.Right : Directions.Left;
        return this.state.facing === currentDirection
          ? PlayerAnimations.RunJumpLandHeavy
          : PlayerAnimations.RunJumpLandBackwardsHeavy;

      case PlayerLandingTypes.Light:
        return PlayerAnimations.RunJumpLandLight;

      case PlayerLandingTypes.Stationary:
        return jumpType === PlayerJumpTypes.Forward
          ? PlayerAnimations.JumpForwardLand
          : PlayerAnimations.JumpNeutralLand;

      default:
        return PlayerAnimations.JumpNeutralLand;
    }
  }

  private getMovementAnimation(): PlayerAnimations | null {
    if (this.state.movement.isWalking) {
      return this.state.animation !== PlayerAnimations.WalkLoop
        ? PlayerAnimations.WalkStart
        : null;
    }

    return this.state.animation === PlayerAnimations.RunLoop
      ? null
      : PlayerAnimations.RunStart;
  }

  // Animation completion handling
  public handleAnimationComplete(animationKey: string): void {
    const animation = animationKey as PlayerAnimations;
    const nextAnimation = getNextAnimation(
      PLAYER_ANIMATIONS,
      animation,
      this.state.movement.isAccelerating
    ) as PlayerAnimations;

    if (nextAnimation) {
      this.updateState((state) => ({
        ...state,
        animation: nextAnimation,
      }));
    }

    if (JUMPING_ANIMATIONS.has(animation)) {
      // When jump start animation completes, ensure we transition to falling state
      this.updateJump((jump) => ({
        ...jump,
        jumpStage: PlayerJumpStages.falling,
        maxFallVelocity: Math.max(jump.maxFallVelocity, this.state.velocity.y),
      }));
    }

    if (LANDING_ANIMATIONS.has(animation)) {
      this.updateJump((jump) => ({
        ...jump,
        jumpStage: PlayerJumpStages.grounded,
        jumpType: null,
        velocityApplied: false, // Reset velocity applied flag
        landingType: null,
        maxFallVelocity: 0,
      }));

      this.updateMovement((movement) => ({
        ...movement,
        stoppingInitialSpeed: null,
      }));
    }

    // Rest of the method remains the same
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
  }

  handleAnimationEvent(
    eventName: string,
    data: any,
    body: Phaser.Physics.Arcade.Body
  ): void {
    if (
      eventName === "playerJumpPhysics" &&
      data.animationKey === this.state.animation &&
      !this.state.jump.velocityApplied
    ) {
      this.applyJumpVelocity(this.state.jump.jumpType!, body);
      this.updateJump((jump) => ({ ...jump, velocityApplied: true }));
    }
  }

  applyVelocity(): void {
    this.updateJump((jump) => ({
      ...jump,
      velocityApplied: true,
    }));
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
  update(input: PlayerInput): PlayerStateInterface {
    this.updateJumpState(input);
    this.updateMovementState(input);
    this.updateAnimationState(input);
    return this.state;
  }
}
