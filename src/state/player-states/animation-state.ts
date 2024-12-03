import { AnimationStates } from "../../constants/player-enums/player-animation-enums";
import {
  GROUND_MOVEMENT_CONFIG,
  JUMP_CONFIG,
} from "../../constants/player-enums/player-physics-enums";
import {
  AnimationState,
  JumpType,
  PlayerState,
} from "../../types/player-types/player-animation-types";

export const updateAnimation = (state: PlayerState): PlayerState => {
  const newAnimation = determineAnimation(state);
  if (newAnimation === state.animation) {
    return state;
  }

  return {
    ...state,
    animation: newAnimation,
  };
};

const determineAnimation = (state: PlayerState): AnimationState => {
  if (state.jump.isJumping) {
    if (!state.jump.velocityApplied) {
      return getJumpStartAnimation(state.jump.jumpType);
    }
    return getJumpMidAnimation(state.jump.jumpType);
  }

  if (state.jump.isFalling) {
    return getFallAnimation(state.jump.jumpType);
  }

  if (state.jump.isLanding) {
    return getLandingAnimation(state);
  }

  return getGroundAnimation(state);
};

const getJumpStartAnimation = (jumpType: JumpType | null): AnimationState => {
  switch (jumpType) {
    case "run":
      return AnimationStates.RunJumpStart;
    case "forward":
      return AnimationStates.JumpForwardStart;
    case "neutral":
    default:
      return AnimationStates.JumpNeutralStart;
  }
};

const getJumpMidAnimation = (jumpType: JumpType | null): AnimationState => {
  switch (jumpType) {
    case "run":
      return AnimationStates.RunJumpFall;
    case "forward":
      return AnimationStates.JumpForwardFall;
    case "neutral":
    default:
      return AnimationStates.JumpNeutralFall;
  }
};

const getFallAnimation = (jumpType: JumpType | null): AnimationState => {
  switch (jumpType) {
    case "run":
      return AnimationStates.RunJumpFall;
    case "forward":
      return AnimationStates.JumpForwardFall;
    case "neutral":
    default:
      return AnimationStates.JumpNeutralFall;
  }
};

const getLandingAnimation = (state: PlayerState): AnimationState => {
  const { jumpType, maxFallVelocity } = state.jump;
  const isMoving = state.movement.isAccelerating;

  switch (jumpType) {
    case "run":
      if (maxFallVelocity > JUMP_CONFIG.HEAVY_LANDING_THRESHOLD) {
        return isMoving
          ? AnimationStates.RunJumpLandHeavyContinue
          : AnimationStates.RunJumpLandHeavyStop;
      }
      return isMoving
        ? AnimationStates.RunJumpLandLightContinue
        : AnimationStates.RunJumpLandLightStop;

    case "forward":
      if (maxFallVelocity > JUMP_CONFIG.HEAVY_LANDING_THRESHOLD) {
        return AnimationStates.RunJumpLandHeavy;
      }
      return AnimationStates.JumpForwardLand;

    case "neutral":
    default:
      return AnimationStates.JumpNeutralLand;
  }
};

const getGroundAnimation = (state: PlayerState): AnimationState => {
  const { movement, velocity } = state;
  const speed = Math.abs(velocity.x);

  if (!movement.isAccelerating) {
    if (speed > GROUND_MOVEMENT_CONFIG.RUN_STOP_THRESHOLD) {
      return AnimationStates.RunStop;
    }
    if (speed > GROUND_MOVEMENT_CONFIG.RUN_STOP_SLOW_THRESHOLD) {
      return AnimationStates.RunStopSlow;
    }
    if (speed > GROUND_MOVEMENT_CONFIG.WALK_STOP_THRESHOLD) {
      return AnimationStates.WalkStop;
    }
    return AnimationStates.Idle;
  }

  if (movement.switchTargetDirection) {
    return AnimationStates.RunSwitch;
  }

  if (movement.isWalking) {
    return speed < GROUND_MOVEMENT_CONFIG.MAX_WALK_SPEED / 2
      ? AnimationStates.WalkStart
      : AnimationStates.WalkLoop;
  }

  return speed < GROUND_MOVEMENT_CONFIG.MAX_SPEED / 2
    ? AnimationStates.RunStart
    : AnimationStates.RunLoop;
};
