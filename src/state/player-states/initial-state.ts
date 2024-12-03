import {
  Directions,
  AnimationStates,
} from "../../constants/player-enums/player-animation-enums";
import { PlayerState } from "../../types/player-types/player-animation-types";

export const createInitialState = (x: number, y: number): PlayerState => ({
  position: { x, y },
  velocity: { x: 0, y: 0 },
  facing: Directions.Right,
  animation: AnimationStates.Idle,
  movement: {
    isWalking: false,
    isAccelerating: false,
    switchTargetDirection: null,
  },
  jump: {
    isJumping: false,
    isFalling: false,
    isLanding: false,
    hasReleasedSpace: true,
    jumpStartTime: 0,
    jumpType: null,
    velocityApplied: false,
    landingStartVelocity: 0,
    maxFallVelocity: 0,
  },
  physics: {
    isGrounded: false,
    gravityScale: 1,
  },
});
