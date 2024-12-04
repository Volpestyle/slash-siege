import { DebugMode } from "../../constants/debug-enums";
import { Directions } from "../../constants/general-enums";
import {
  PlayerAnimations,
  PlayerJumpTypes,
} from "../../constants/player-constants/player-animation-enums";
import { PlayerJumpStages } from "../../constants/player-constants/player-state-enum";

export type Vec2 = {
  readonly x: number;
  readonly y: number;
};

export type PlayerInput = {
  readonly left: boolean;
  readonly right: boolean;
  readonly up: boolean;
  readonly down: boolean;
  readonly space: boolean;
  readonly shift: boolean;
  readonly delta: number;
};

// Immutable type definitions for each state category
export interface PlayerMovementState {
  readonly isWalking: boolean;
  readonly isAccelerating: boolean;
  readonly switchTargetDirection: Directions | null;
  readonly stoppingInitialSpeed: number | null;
}

export interface PlayerJumpState {
  readonly jumpStage: PlayerJumpStages;
  readonly hasReleasedSpace: boolean;
  readonly jumpType: PlayerJumpTypes | null;
  readonly velocityApplied: boolean;
  readonly maxFallVelocity: number;
  readonly wasAcceleratingOnLand: boolean;
}

export interface PlayerPhysicsState {
  readonly onFloor: boolean;
}

// Main state interface with readonly properties
export interface PlayerStateInterface {
  readonly position: Vec2;
  readonly velocity: Vec2;
  readonly facing: Directions;
  readonly animation: PlayerAnimations;
  readonly movement: PlayerMovementState;
  readonly jump: PlayerJumpState;
  readonly physics: PlayerPhysicsState;
}

// Type-safe mutation helpers
export type StateUpdater<T> = (current: Readonly<T>) => T;
