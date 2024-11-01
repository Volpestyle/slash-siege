export type Direction = "left" | "right";

export type AnimationName =
  | "idle"
  | "run-start"
  | "run-loop"
  | "run-stop"
  | "run-switch";

export type AnimationState =
  | "idle"
  | "runStart"
  | "runLoop"
  | "runStop"
  | "runSwitch";

export interface AnimationFrames {
  START: number;
  END: number;
}

export interface AnimationConfig {
  readonly FRAMERATE: number;
  readonly SCALE: number;
  readonly SPEED: number;
  readonly FRAMES: {
    readonly IDLE: AnimationFrames;
    readonly RUN_START: AnimationFrames;
    readonly RUN_LOOP: AnimationFrames;
    readonly RUN_STOP: AnimationFrames;
    readonly RUN_SWITCH: AnimationFrames;
  };
  readonly NAMES: {
    readonly IDLE: AnimationName;
    readonly RUN_START: AnimationName;
    readonly RUN_LOOP: AnimationName;
    readonly RUN_STOP: AnimationName;
    readonly RUN_SWITCH: AnimationName;
  };
}

export interface PhysicsState {
  velocity: number;
  maxSpeed: number;
  acceleration: number;
  deceleration: number;
}

export interface PlayerState {
  animationState: AnimationState;
  direction: Direction;
  inputDirection: Direction | null;
  isAccelerating: boolean;
}
