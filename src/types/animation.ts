export type Direction = "left" | "right";

export type AnimationName =
  | "idle"
  | "run-start"
  | "run-loop"
  | "run-stop"
  | "run-switch"
  | "walk-start"
  | "walk-loop"
  | "walk-stop"
  // Jump animations
  | "jump-neutral-start"
  | "jump-neutral-fall"
  | "jump-neutral-land"
  | "jump-forward-start"
  | "jump-forward-fall"
  | "jump-forward-land"
  | "run-jump-start"
  | "run-jump-fall"
  | "run-jump-land-light"
  | "run-jump-land-heavy"
  | "run-jump-land-light-continue"
  | "run-jump-land-heavy-continue"
  | "run-jump-land-light-stop"
  | "run-jump-land-heavy-stop";

export type AnimationState =
  | "idle"
  | "runStart"
  | "runLoop"
  | "runStop"
  | "runSwitch"
  | "walkStart"
  | "walkLoop"
  | "walkStop"
  // Jump states
  | "jumpNeutralStart"
  | "jumpNeutralFall"
  | "jumpNeutralLand"
  | "jumpForwardStart"
  | "jumpForwardFall"
  | "jumpForwardLand"
  | "runJumpStart"
  | "runJumpFall"
  | "runJumpLandLight"
  | "runJumpLandHeavy"
  | "runJumpLandLightContinue"
  | "runJumpLandHeavyContinue"
  | "runJumpLandLightStop"
  | "runJumpLandHeavyStop";

export interface AnimationFrames {
  START: number;
  END: number;
}

export interface AnimationConfig {
  readonly FRAMERATE: number;
  readonly SCALE: number;
  readonly SPEED: number;
  readonly WALK_SPEED: number;
  readonly FRAMES: {
    readonly IDLE: AnimationFrames;
    readonly RUN_START: AnimationFrames;
    readonly RUN_LOOP: AnimationFrames;
    readonly RUN_STOP: AnimationFrames;
    readonly RUN_SWITCH: AnimationFrames;
    readonly WALK_START: AnimationFrames;
    readonly WALK_LOOP: AnimationFrames;
    readonly WALK_STOP: AnimationFrames;
    readonly JUMP_NEUTRAL_START: AnimationFrames;
    readonly JUMP_NEUTRAL_FALL: AnimationFrames;
    readonly JUMP_NEUTRAL_LAND: AnimationFrames;
    readonly JUMP_FORWARD_START: AnimationFrames;
    readonly JUMP_FORWARD_FALL: AnimationFrames;
    readonly JUMP_FORWARD_LAND: AnimationFrames;
    readonly RUN_JUMP_START: AnimationFrames;
    readonly RUN_JUMP_FALL: AnimationFrames;
    readonly RUN_JUMP_LAND_LIGHT: AnimationFrames;
    readonly RUN_JUMP_LAND_HEAVY: AnimationFrames;
    readonly RUN_JUMP_LAND_LIGHT_CONTINUE: AnimationFrames;
    readonly RUN_JUMP_LAND_HEAVY_CONTINUE: AnimationFrames;
    readonly RUN_JUMP_LAND_LIGHT_STOP: AnimationFrames;
    readonly RUN_JUMP_LAND_HEAVY_STOP: AnimationFrames;
  };
  readonly NAMES: {
    readonly IDLE: AnimationName;
    readonly RUN_START: AnimationName;
    readonly RUN_LOOP: AnimationName;
    readonly RUN_STOP: AnimationName;
    readonly RUN_SWITCH: AnimationName;
    readonly WALK_START: AnimationName;
    readonly WALK_LOOP: AnimationName;
    readonly WALK_STOP: AnimationName;
    readonly JUMP_NEUTRAL_START: AnimationName;
    readonly JUMP_NEUTRAL_FALL: AnimationName;
    readonly JUMP_NEUTRAL_LAND: AnimationName;
    readonly JUMP_FORWARD_START: AnimationName;
    readonly JUMP_FORWARD_FALL: AnimationName;
    readonly JUMP_FORWARD_LAND: AnimationName;
    readonly RUN_JUMP_START: AnimationName;
    readonly RUN_JUMP_FALL: AnimationName;
    readonly RUN_JUMP_LAND_LIGHT: AnimationName;
    readonly RUN_JUMP_LAND_HEAVY: AnimationName;
    readonly RUN_JUMP_LAND_LIGHT_CONTINUE: AnimationName;
    readonly RUN_JUMP_LAND_HEAVY_CONTINUE: AnimationName;
    readonly RUN_JUMP_LAND_LIGHT_STOP: AnimationName;
    readonly RUN_JUMP_LAND_HEAVY_STOP: AnimationName;
  };
}

export type AnimationHandler = (state: AnimationState) => void;
