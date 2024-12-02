import { JumpConfig, GroundMovementConfig } from "../types/player-physics";

export const JUMP_CONFIG = {
  GRAVITY: 1000,
  JUMP_VELOCITY: -600,
  FORWARD_JUMP_VELOCITY_X: 400,
  FORWARD_JUMP_VELOCITY_Y: -600,
  RUN_JUMP_VELOCITY_X: 500,
  RUN_JUMP_VELOCITY_Y: -600,
  HEAVY_LANDING_THRESHOLD: 500,
  MAX_HEAVY_LANDING_THRESHOLD: 900,
} as const;

export const GROUND_MOVEMENT_CONFIG: GroundMovementConfig = {
  MAX_SPEED: 500,
  MAX_WALK_SPEED: 250,
  RUN_ACCELERATION: 1500,
  WALK_ACCELERATION: 750,
  RUN_START_ACCELERATION: 2000,
  RUN_START_INITIAL_ACCELERATION: 100,
  INITIAL_FRAMES_THRESHOLD: 7,
  IDLE_DECELERATION: 3000,
  RUN_STOP_DECELERATION: 2000,
  WALK_STOP_DECELERATION: 1000,
  DIRECTION_SWITCH_THRESHOLD: 400,
  RUN_STOP_THRESHOLD: 480,
  RUN_STOP_SLOW_THRESHOLD: 400,
  WALK_STOP_THRESHOLD: 150,
} as const;

// Default initial states
export const DEFAULT_MOVEMENT_STATE = {
  isAccelerating: false,
  isWalking: false,
  wasWalking: false,
  velocity: 0,
  moveDirection: "right" as const,
};

export const DEFAULT_JUMP_STATE = {
  isJumping: false,
  isFalling: false,
  jumpStartTime: 0,
  fallStartTime: 0,
  currentJumpType: "neutral" as const,
  hasReleasedSpace: true,
};
