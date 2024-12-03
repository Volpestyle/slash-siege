import { DebugMode } from "../../constants/debug-enums";

// types/player-animation.ts
export type Vec2 = {
  readonly x: number;
  readonly y: number;
};

export type Direction = "left" | "right";
export type JumpType = "neutral" | "forward" | "run";

export type PlayerInput = {
  readonly left: boolean;
  readonly right: boolean;
  readonly up: boolean;
  readonly down: boolean;
  readonly space: boolean;
  readonly shift: boolean;
  readonly delta: number;
};

// Updated PlayerState type
export type PlayerState = {
  readonly position: Vec2;
  readonly velocity: Vec2;
  readonly facing: Direction;
  readonly animation: AnimationState;
  readonly movement: MovementState;
  readonly jump: JumpState;
  readonly physics: PhysicsState;
  readonly debugMode?: DebugMode;
};

export type MovementState = {
  readonly isWalking: boolean;
  readonly isAccelerating: boolean;
  readonly switchTargetDirection: Direction | null;
};

export type JumpState = {
  readonly isJumping: boolean;
  readonly isFalling: boolean;
  readonly isLanding: boolean;
  readonly hasReleasedSpace: boolean;
  readonly jumpStartTime: number;
  readonly jumpType: JumpType | null;
  readonly velocityApplied: boolean;
  readonly landingStartVelocity: number;
  readonly maxFallVelocity: number;
};

export type PhysicsState = {
  readonly isGrounded: boolean;
  readonly gravityScale: number;
};

export type AnimationState =
  | "idle"
  | "runStart"
  | "runLoop"
  | "runStop"
  | "runStopSlow"
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
