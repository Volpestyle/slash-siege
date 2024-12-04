import { Directions } from "../../constants/general-enums";
import { PlayerJumpTypes } from "../../constants/player-constants/player-animation-enums";

export interface PlayerJumpConfig {
  readonly JUMP_VELOCITY: number;
  readonly RUN_JUMP_VELOCITY_Y: number;
  readonly RUN_JUMP_VELOCITY_X: number;
  readonly FORWARD_JUMP_VELOCITY_Y: number;
  readonly FORWARD_JUMP_VELOCITY_X: number;
  readonly HEAVY_LANDING_THRESHOLD: number;
  readonly MAX_HEAVY_LANDING_THRESHOLD: number;
  readonly GRAVITY: number;
}

export interface PlayerGroundMovementConfig {
  readonly MAX_SPEED: number;
  readonly MAX_WALK_SPEED: number;
  readonly RUN_ACCELERATION: number;
  readonly WALK_ACCELERATION: number;
  readonly RUN_START_ACCELERATION: number;
  readonly RUN_START_INITIAL_ACCELERATION: number;
  readonly INITIAL_FRAMES_THRESHOLD: number;
  readonly IDLE_DECELERATION: number;
  readonly RUN_STOP_DECELERATION: number;
  readonly WALK_STOP_DECELERATION: number;
  readonly DIRECTION_SWITCH_THRESHOLD: number;
  readonly RUN_STOP_THRESHOLD: number;
  readonly RUN_STOP_SLOW_THRESHOLD: number;
  readonly WALK_STOP_THRESHOLD: number;
}
