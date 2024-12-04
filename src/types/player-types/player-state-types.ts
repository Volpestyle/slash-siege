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

export type PlayerStateInterface = {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  facing: Directions;
  animation: PlayerAnimations;
  movement: {
    isWalking: boolean;
    isAccelerating: boolean;
    switchTargetDirection: Directions | null;
    stoppingInitialSpeed: number | null;
  };
  jump: {
    jumpStage: PlayerJumpStages;
    hasReleasedSpace: boolean;
    jumpType: PlayerJumpTypes | null;
    velocityApplied: boolean;
    maxFallVelocity: number;
  };
  physics: {
    onFloor: boolean;
  };

  update(input: PlayerInput): void;
  updatePhysics(
    x: number,
    y: number,
    vx: number,
    vy: number,
    onFloor: boolean
  ): void;
  handleAnimationComplete(animationKey: string): void;
};
