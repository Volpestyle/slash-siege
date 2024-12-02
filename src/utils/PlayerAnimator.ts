import { ANIMATION } from "../constants/animation";
import { AnimationState, Direction } from "../types/animation";

export class PlayerAnimator {
  private sprite: Phaser.Physics.Arcade.Sprite;
  private currentState: AnimationState = "idle";
  private facingDirection: Direction = "right";
  private onAnimationComplete: (state: AnimationState) => void;

  constructor(
    sprite: Phaser.Physics.Arcade.Sprite,
    onAnimationComplete: (state: AnimationState) => void
  ) {
    this.sprite = sprite;
    this.onAnimationComplete = onAnimationComplete;
    this.setupAnimations();
    this.sprite.on("animationcomplete", this.handleAnimationComplete);
    this.play(ANIMATION.NAMES.IDLE);
  }

  private setupAnimations(): void {
    const createAnim = (
      key: string,
      prefix: string,
      start: number,
      end: number,
      repeat: number = -1
    ) => {
      console.log(
        `Creating animation: ${key} with prefix: ${prefix} (${start}-${end})`
      );

      try {
        this.sprite.scene.anims.create({
          key,
          frames: this.sprite.scene.anims.generateFrameNames("player", {
            prefix,
            start,
            end,
            zeroPad: 4,
          }),
          frameRate: ANIMATION.FRAMERATE,
          repeat,
        });
        console.log(`Successfully created animation: ${key}`);
      } catch (error) {
        console.error(`Failed to create animation ${key}:`, error);
      }
    };

    const { FRAMES, NAMES } = ANIMATION;

    // Ground movement animations
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
    createAnim(
      NAMES.WALK_START,
      "walk_start",
      FRAMES.WALK_START.START,
      FRAMES.WALK_START.END,
      0
    );
    createAnim(
      NAMES.WALK_LOOP,
      "walk_loop",
      FRAMES.WALK_LOOP.START,
      FRAMES.WALK_LOOP.END
    );
    createAnim(
      NAMES.WALK_STOP,
      "walk_stop",
      FRAMES.WALK_STOP.START,
      FRAMES.WALK_STOP.END,
      0
    );

    // Neutral Jump animations
    createAnim(
      NAMES.JUMP_NEUTRAL_START,
      "jump_neutral_start",
      FRAMES.JUMP_NEUTRAL_START.START,
      FRAMES.JUMP_NEUTRAL_START.END,
      0
    );
    createAnim(
      NAMES.JUMP_NEUTRAL_FALL,
      "jump_neutral_fall",
      FRAMES.JUMP_NEUTRAL_FALL.START,
      FRAMES.JUMP_NEUTRAL_FALL.END
    );
    createAnim(
      NAMES.JUMP_NEUTRAL_LAND,
      "jump_neutral_land",
      FRAMES.JUMP_NEUTRAL_LAND.START,
      FRAMES.JUMP_NEUTRAL_LAND.END,
      0
    );

    // Forward Jump animations
    createAnim(
      NAMES.JUMP_FORWARD_START,
      "jump_forward_start",
      FRAMES.JUMP_FORWARD_START.START,
      FRAMES.JUMP_FORWARD_START.END,
      0
    );
    createAnim(
      NAMES.JUMP_FORWARD_FALL,
      "jump_forward_fall",
      FRAMES.JUMP_FORWARD_FALL.START,
      FRAMES.JUMP_FORWARD_FALL.END
    );
    createAnim(
      NAMES.JUMP_FORWARD_LAND,
      "jump_forward_land",
      FRAMES.JUMP_FORWARD_LAND.START,
      FRAMES.JUMP_FORWARD_LAND.END,
      0
    );

    // Run Jump animations
    createAnim(
      NAMES.RUN_JUMP_START,
      "run_jump_start",
      FRAMES.RUN_JUMP_START.START,
      FRAMES.RUN_JUMP_START.END,
      0
    );
    createAnim(
      NAMES.RUN_JUMP_FALL,
      "run_jump_fall",
      FRAMES.RUN_JUMP_FALL.START,
      FRAMES.RUN_JUMP_FALL.END
    );
    createAnim(
      NAMES.RUN_JUMP_LAND_LIGHT,
      "run_jump_land_light",
      FRAMES.RUN_JUMP_LAND_LIGHT.START,
      FRAMES.RUN_JUMP_LAND_LIGHT.END,
      0
    );
    createAnim(
      NAMES.RUN_JUMP_LAND_HEAVY,
      "run_jump_land_heavy",
      FRAMES.RUN_JUMP_LAND_HEAVY.START,
      FRAMES.RUN_JUMP_LAND_HEAVY.END,
      0
    );
    createAnim(
      NAMES.RUN_JUMP_LAND_LIGHT_CONTINUE,
      "run_jump_land_light_continue",
      FRAMES.RUN_JUMP_LAND_LIGHT_CONTINUE.START,
      FRAMES.RUN_JUMP_LAND_LIGHT_CONTINUE.END,
      0
    );
    createAnim(
      NAMES.RUN_JUMP_LAND_HEAVY_CONTINUE,
      "run_jump_land_heavy_continue",
      FRAMES.RUN_JUMP_LAND_HEAVY_CONTINUE.START,
      FRAMES.RUN_JUMP_LAND_HEAVY_CONTINUE.END,
      0
    );
    createAnim(
      NAMES.RUN_JUMP_LAND_LIGHT_STOP,
      "run_jump_land_light_stop",
      FRAMES.RUN_JUMP_LAND_LIGHT_STOP.START,
      FRAMES.RUN_JUMP_LAND_LIGHT_STOP.END,
      0
    );
    createAnim(
      NAMES.RUN_JUMP_LAND_HEAVY_STOP,
      "run_jump_land_heavy_stop",
      FRAMES.RUN_JUMP_LAND_HEAVY_STOP.START,
      FRAMES.RUN_JUMP_LAND_HEAVY_STOP.END,
      0
    );
  }

  private handleAnimationComplete = (
    anim: Phaser.Animations.Animation
  ): void => {
    console.log(`Animation complete: ${anim.key}`);
    this.onAnimationComplete(this.currentState);
  };

  public transitionTo(newState: AnimationState): void {
    const prevState = this.currentState;
    this.currentState = newState;
    const animationKey = newState.replace(/([A-Z])/g, "-$1").toLowerCase();
    console.log(
      `Transitioning from ${prevState} to ${newState} (animation key: ${animationKey})`
    );
    this.play(animationKey);
  }

  private play(animationKey: string): void {
    console.log(`Playing animation: ${animationKey}`);
    try {
      this.sprite.play(animationKey);
      console.log("Animation started successfully");
    } catch (error) {
      console.error(`Failed to play animation ${animationKey}:`, error);
    }
  }

  public getCurrentState(): AnimationState {
    return this.currentState;
  }

  public getFacingDirection(): Direction {
    return this.facingDirection;
  }

  public setFacingDirection(direction: Direction): void {
    this.facingDirection = direction;
    this.sprite.setFlipX(direction === "left");
  }

  public getCurrentFrame(): number | undefined {
    return this.sprite.anims.currentFrame?.index;
  }

  public destroy(): void {
    this.sprite.off("animationcomplete", this.handleAnimationComplete);
  }
}
