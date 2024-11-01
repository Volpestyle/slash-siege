import { ANIMATION } from "../constants/animation";
import { DebugMode, DebugSpriteConfig } from "../types/spriteDebug";
import { DebugComponent } from "../utils/SpriteDebug";

type Direction = "left" | "right";
type AnimationState = "idle" | "runStart" | "runLoop" | "runStop" | "runSwitch";

export class Player extends Phaser.Physics.Arcade.Sprite {
  private static readonly MAX_SPEED = 500;
  private static readonly ACCELERATION = 1500;
  private static readonly RUN_START_ACCELERATION = 1000;
  private static readonly RUN_START_INITIAL_ACCELERATION = 100;
  private static readonly INITIAL_FRAMES_THRESHOLD = 7;
  private static readonly IDLE_DECELERATION = 3000;
  private static readonly RUN_STOP_DECELERATION = 2000;
  private static readonly DIRECTION_SWITCH_THRESHOLD = 200;
  private static readonly RUN_STOP_THRESHOLD = 300;

  private velocity = 0;
  private currentState: AnimationState = "idle";
  private moveDirection: Direction = "right";
  private facingDirection: Direction = "right";
  private isAccelerating = false;
  private debugComponent?: DebugComponent;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    debug?: DebugSpriteConfig
  ) {
    super(scene, x, y, "player");

    // Initialize sprite
    this.scene.physics.add.existing(this);
    this.scene.add.existing(this);
    this.setOrigin(0.5, 0.5);
    this.setScale(ANIMATION.SCALE);
    this.setCollideWorldBounds(true);

    // Setup animations
    this.setupAnimations();
    this.on("animationcomplete", this.handleAnimationComplete);

    // Start in idle
    this.play(ANIMATION.NAMES.IDLE);

    // Create debug component
    if (debug) {
      this.debugComponent = new DebugComponent(this, debug);
    }
  }

  private setupAnimations(): void {
    const createAnim = (
      key: string,
      prefix: string,
      start: number,
      end: number,
      repeat: number = -1
    ) => {
      this.scene.anims.create({
        key,
        frames: this.scene.anims.generateFrameNames("player", {
          prefix,
          start,
          end,
          zeroPad: 4,
        }),
        frameRate: ANIMATION.FRAMERATE,
        repeat,
      });
    };

    const { FRAMES, NAMES } = ANIMATION;
    createAnim(NAMES.IDLE, "idle", FRAMES.IDLE.START, FRAMES.IDLE.END);
    createAnim(
      NAMES.RUN_START,
      "run_start",
      FRAMES.RUN_START.START,
      FRAMES.RUN_START.END,
      0
    );
    createAnim(
      NAMES.RUN_LOOP,
      "run_loop",
      FRAMES.RUN_LOOP.START,
      FRAMES.RUN_LOOP.END
    );
    createAnim(
      NAMES.RUN_STOP,
      "run_stop",
      FRAMES.RUN_STOP.START,
      FRAMES.RUN_STOP.END,
      0
    );
    createAnim(
      NAMES.RUN_SWITCH,
      "run_switch",
      FRAMES.RUN_SWITCH.START,
      FRAMES.RUN_SWITCH.END,
      0
    );
  }

  private handleAnimationComplete = (
    anim: Phaser.Animations.Animation
  ): void => {
    switch (anim.key) {
      case ANIMATION.NAMES.RUN_START:
        this.transitionTo("runLoop");
        break;
      case ANIMATION.NAMES.RUN_STOP:
        this.transitionTo("idle");
        break;
      case ANIMATION.NAMES.RUN_SWITCH:
        this.facingDirection = this.moveDirection;
        this.setFlipX(this.facingDirection === "left");
        if (this.isAccelerating) {
          this.transitionTo("runLoop");
        } else {
          if (Math.abs(this.velocity) > Player.RUN_STOP_THRESHOLD) {
            this.transitionTo("runStop");
          } else {
            this.transitionTo("idle");
          }
        }
        break;
    }
  };

  private transitionTo(newState: AnimationState): void {
    this.currentState = newState;

    switch (newState) {
      case "idle":
        this.play(ANIMATION.NAMES.IDLE);
        break;
      case "runStart":
        this.play(ANIMATION.NAMES.RUN_START);
        break;
      case "runLoop":
        this.play(ANIMATION.NAMES.RUN_LOOP);
        break;
      case "runStop":
        this.play(ANIMATION.NAMES.RUN_STOP);
        break;
      case "runSwitch":
        this.play(ANIMATION.NAMES.RUN_SWITCH);
        break;
    }
  }

  private getCurrentRunStartAcceleration(): number {
    if (this.currentState === "runStart" && this.anims.currentFrame) {
      // Check if we're in the initial frames of run_start
      return this.anims.currentFrame.index < Player.INITIAL_FRAMES_THRESHOLD
        ? Player.RUN_START_INITIAL_ACCELERATION
        : Player.RUN_START_ACCELERATION;
    }
    return Player.ACCELERATION;
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, delta: number): void {
    if (delta === 0) return;

    const deltaSeconds = delta / 1000;
    const newDirection: Direction | null = cursors.left.isDown
      ? "left"
      : cursors.right.isDown
      ? "right"
      : null;

    // Handle direction changes and key states
    if (newDirection) {
      const oppositeDirection = newDirection !== this.facingDirection;
      const aboveThreshold =
        Math.abs(this.velocity) > Player.DIRECTION_SWITCH_THRESHOLD;

      if (
        oppositeDirection &&
        aboveThreshold &&
        this.currentState !== "runSwitch"
      ) {
        this.moveDirection = newDirection;
        this.transitionTo("runSwitch");
        this.isAccelerating = true;
      } else if (
        this.currentState === "idle" ||
        this.currentState === "runStop"
      ) {
        this.moveDirection = newDirection;
        this.facingDirection = newDirection;
        this.setFlipX(newDirection === "left");
        this.transitionTo("runStart");
        this.isAccelerating = true;
      }

      this.isAccelerating = true;
    } else {
      this.isAccelerating = false;
      if (this.currentState === "runLoop") {
        if (Math.abs(this.velocity) > Player.RUN_STOP_THRESHOLD) {
          this.transitionTo("runStop");
        } else {
          this.transitionTo("idle");
        }
      } else if (this.currentState === "runStart") {
        this.transitionTo("idle");
      }
    }

    // Update velocity based on move direction, not facing direction
    const targetVelocity = this.isAccelerating
      ? this.moveDirection === "left"
        ? -Player.MAX_SPEED
        : Player.MAX_SPEED
      : 0;

    // Get acceleration based on current animation frame
    let acceleration = this.getCurrentRunStartAcceleration();
    let deceleration = Player.RUN_STOP_DECELERATION;

    // Adjust deceleration based on state
    if (this.currentState === "idle") {
      deceleration = Player.IDLE_DECELERATION;
    }

    // Apply acceleration/deceleration
    if (this.isAccelerating) {
      this.velocity = Phaser.Math.Linear(
        this.velocity,
        targetVelocity,
        (deltaSeconds * acceleration) / Player.MAX_SPEED
      );
    } else {
      this.velocity = Phaser.Math.Linear(
        this.velocity,
        targetVelocity,
        (deltaSeconds * deceleration) / Player.MAX_SPEED
      );
    }

    this.setVelocityX(this.velocity);
  }
}
