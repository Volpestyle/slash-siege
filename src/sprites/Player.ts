import { ANIMATION } from "../constants/animation";
import {
  Direction,
  AnimationName,
  AnimationState,
  PhysicsState,
  PlayerState,
} from "../types/animation";
import { SpriteDebug } from "../utils/SpriteDebug";

export class Player extends Phaser.Physics.Arcade.Sprite {
  private static readonly MAX_SPEED = 300;
  private static readonly INITIAL_ACCELERATION = 300;
  private static readonly FULL_ACCELERATION = 1500;
  private static readonly RUN_STOP_DECELERATION = 1200;
  private static readonly IDLE_DECELERATION = 2400;
  private static readonly MIN_SPEED_FOR_RUNNING = 50;
  private static readonly DIRECTION_SWITCH_THRESHOLD = 0.4;
  private static readonly RUN_START_COMMITMENT_POINT = 0.3;

  private physics: PhysicsState = {
    velocity: 0,
    maxSpeed: Player.MAX_SPEED,
    acceleration: Player.INITIAL_ACCELERATION,
    deceleration: Player.RUN_STOP_DECELERATION,
  };

  private playerState: PlayerState = {
    animationState: "idle",
    direction: "right",
    inputDirection: null,
    isAccelerating: false,
    runStartProgress: 0,
    runStopProgress: 0,
  };

  private spriteDebug?: SpriteDebug;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    debug: boolean = false
  ) {
    super(scene, x, y, "player");

    // Ensure proper initial positioning
    this.setOrigin(0.5, 0.5);
    this.setPosition(x, y);

    // Initialize physics before any movement
    this.scene.physics.add.existing(this);
    this.scene.add.existing(this);

    // Ensure zero initial velocity
    this.setVelocity(0, 0);
    this.physics.velocity = 0;

    this.setScale(ANIMATION.SCALE);
    this.setCollideWorldBounds(true);
    this.setupAnimations();
    this.setupAnimationListeners();

    this.play(ANIMATION.NAMES.IDLE);

    if (debug) {
      this.spriteDebug = new SpriteDebug(this, {
        showAnimation: true,
        showVelocity: true,
        textOffset: { x: 0, y: -50 },
      });
    }
  }

  destroy(fromScene?: boolean): void {
    this.spriteDebug?.destroy();
    super.destroy(fromScene);
  }

  private setupAnimationListeners(): void {
    this.on("animationcomplete", this.handleAnimationComplete);
    this.on("animationupdate", this.handleAnimationUpdate);
  }

  private setupAnimations(): void {
    const { FRAMERATE, FRAMES, NAMES } = ANIMATION;

    const createAnim = (
      key: AnimationName,
      prefix: string,
      frames: { START: number; END: number },
      repeat: number = -1
    ): void => {
      this.scene.anims.create({
        key,
        frames: this.scene.anims.generateFrameNames("player", {
          prefix,
          start: frames.START,
          end: frames.END,
          zeroPad: 4,
        }),
        frameRate: FRAMERATE,
        repeat,
      });
    };

    createAnim(NAMES.IDLE, "idle", FRAMES.IDLE);
    createAnim(NAMES.RUN_START, "run_start", FRAMES.RUN_START, 0);
    createAnim(NAMES.RUN_LOOP, "run_loop", FRAMES.RUN_LOOP);
    createAnim(NAMES.RUN_STOP, "run_stop", FRAMES.RUN_STOP, 0);
    createAnim(NAMES.RUN_SWITCH, "run_switch", FRAMES.RUN_SWITCH, 0);
  }

  private handleAnimationComplete = (
    animation: Phaser.Animations.Animation
  ): void => {
    switch (animation.key) {
      case ANIMATION.NAMES.RUN_START:
        if (this.playerState.inputDirection === this.playerState.direction) {
          this.transitionTo("runLoop");
        } else {
          this.transitionTo("runStop");
        }
        break;
      case ANIMATION.NAMES.RUN_STOP:
        this.transitionTo("idle");
        break;
      case ANIMATION.NAMES.RUN_SWITCH:
        if (this.playerState.inputDirection) {
          this.transitionTo("runLoop");
        } else {
          this.transitionTo("runStop");
        }
        break;
    }
  };

  private handleAnimationUpdate = (
    animation: Phaser.Animations.Animation,
    frame: number
  ): void => {
    const progress = frame / animation.frames.length;

    if (animation.key === ANIMATION.NAMES.RUN_START) {
      this.playerState.runStartProgress = progress;
    } else if (animation.key === ANIMATION.NAMES.RUN_STOP) {
      this.playerState.runStopProgress = progress;
    }
  };

  private transitionTo(newState: AnimationState): void {
    const oldState = this.playerState.animationState;
    this.playerState.animationState = newState;

    switch (newState) {
      case "idle":
        this.play(ANIMATION.NAMES.IDLE);
        this.playerState.isAccelerating = false;
        break;

      case "runStart":
        this.play(ANIMATION.NAMES.RUN_START);
        this.playerState.isAccelerating = true;
        this.playerState.runStartProgress = 0;
        break;

      case "runLoop":
        this.play(ANIMATION.NAMES.RUN_LOOP);
        this.playerState.isAccelerating = true;
        break;

      case "runStop":
        this.play(ANIMATION.NAMES.RUN_STOP);
        this.playerState.isAccelerating = false;
        this.playerState.runStopProgress = 0;
        break;

      case "runSwitch":
        this.play(ANIMATION.NAMES.RUN_SWITCH);
        this.playerState.direction = this.playerState.inputDirection!;
        this.setFlipX(this.playerState.direction === "left");
        break;
    }
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, delta: number): void {
    if (delta === 0) return;

    const wasStill = this.physics.velocity === 0;

    const newInputDirection: Direction | null = cursors.left?.isDown
      ? "left"
      : cursors.right?.isDown
      ? "right"
      : null;

    if (wasStill && newInputDirection) {
      console.log("Starting movement:", {
        position: { x: this.x, y: this.y },
        direction: newInputDirection,
      });
    }

    if (newInputDirection !== this.playerState.inputDirection) {
      this.handleDirectionChange(newInputDirection);
    }

    this.updatePhysics(delta);
    this.updateState();

    this.playerState.inputDirection = newInputDirection;
  }

  private handleDirectionChange(newDirection: Direction | null): void {
    console.log("Direction change:", {
      newDirection,
      position: { x: this.x, y: this.y },
      velocity: this.physics.velocity,
    });

    const canSwitchDirection =
      this.playerState.animationState === "runLoop" ||
      (this.playerState.animationState === "runStart" &&
        this.playerState.runStartProgress > Player.DIRECTION_SWITCH_THRESHOLD);

    if (
      newDirection &&
      canSwitchDirection &&
      newDirection !== this.playerState.direction
    ) {
      this.transitionTo("runSwitch");
    } else if (!newDirection) {
      if (this.playerState.animationState === "runStart") {
        this.transitionTo("idle");
      } else if (this.playerState.animationState === "runLoop") {
        this.transitionTo("runStop");
      }
    } else if (newDirection && this.playerState.animationState === "idle") {
      this.playerState.direction = newDirection;
      this.setFlipX(newDirection === "left");
      this.transitionTo("runStart");
    }
  }

  private updatePhysics(delta: number): void {
    const prevX = this.x;

    const targetVelocity = this.playerState.isAccelerating
      ? this.playerState.direction === "left"
        ? -this.physics.maxSpeed
        : this.physics.maxSpeed
      : 0;

    if (this.playerState.isAccelerating) {
      let currentAcceleration = Player.FULL_ACCELERATION;
      if (
        this.playerState.animationState === "runStart" &&
        this.playerState.runStartProgress < Player.RUN_START_COMMITMENT_POINT
      ) {
        currentAcceleration = Player.INITIAL_ACCELERATION;
      }

      this.physics.acceleration = currentAcceleration;
    } else {
      this.physics.deceleration =
        this.playerState.animationState === "idle"
          ? Player.IDLE_DECELERATION
          : Player.RUN_STOP_DECELERATION;
    }

    if (this.playerState.isAccelerating) {
      this.physics.velocity = Phaser.Math.Linear(
        this.physics.velocity,
        targetVelocity,
        ((delta / 1000) * this.physics.acceleration) / this.physics.maxSpeed
      );
    } else {
      this.physics.velocity = Phaser.Math.Linear(
        this.physics.velocity,
        targetVelocity,
        ((delta / 1000) * this.physics.deceleration) / this.physics.maxSpeed
      );
    }

    this.setVelocityX(this.physics.velocity);

    if (Math.abs(this.x - prevX) > 10) {
      console.log("Large position change:", {
        prevX,
        newX: this.x,
        velocity: this.physics.velocity,
        delta,
      });
    }
  }

  private updateState(): void {
    if (
      Math.abs(this.physics.velocity) < Player.MIN_SPEED_FOR_RUNNING &&
      !this.playerState.isAccelerating &&
      this.playerState.animationState !== "idle" &&
      this.playerState.animationState !== "runStop"
    ) {
      this.transitionTo("idle");
    }
  }
}
