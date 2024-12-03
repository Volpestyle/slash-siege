import {
  Directions,
  JumpTypes,
} from "../../constants/player-enums/player-animation-enums";
import { JUMP_CONFIG } from "../../constants/player-enums/player-physics-enums";
import {
  JumpType,
  PlayerInput,
  PlayerState,
} from "../../types/player-types/player-animation-types";

export const updateJump = (
  state: PlayerState,
  input: PlayerInput
): PlayerState => {
  if (shouldExitLanding(state)) {
    return exitLanding(state);
  }

  if (canStartJump(state, input)) {
    return initiateJump(state, input);
  }

  if (shouldTransitionToFalling(state)) {
    return transitionToFalling(state);
  }

  if (shouldLand(state)) {
    return transitionToLanding(state);
  }

  return updateSpaceKeyState(state, input);
};

const shouldExitLanding = (state: PlayerState): boolean =>
  state.jump.isLanding && state.physics.isGrounded;

const canStartJump = (state: PlayerState, input: PlayerInput): boolean =>
  input.space &&
  state.jump.hasReleasedSpace &&
  state.physics.isGrounded &&
  !state.jump.isJumping &&
  !state.jump.isFalling &&
  !state.jump.isLanding;

const shouldTransitionToFalling = (state: PlayerState): boolean =>
  state.jump.isJumping &&
  state.jump.velocityApplied &&
  !state.jump.isFalling &&
  !state.physics.isGrounded &&
  state.velocity.y > 0;

const shouldLand = (state: PlayerState): boolean =>
  (state.jump.isJumping || state.jump.isFalling) && state.physics.isGrounded;

const determineJumpType = (state: PlayerState): JumpType => {
  if (Math.abs(state.velocity.x) > 300) return JumpTypes.Run;
  if (Math.abs(state.velocity.x) > 0) return JumpTypes.Forward;
  return JumpTypes.Neutral;
};

const initiateJump = (state: PlayerState, input: PlayerInput): PlayerState => {
  const jumpType = determineJumpType(state);

  // Calculate jump velocity based on type
  const jumpVelocity = (() => {
    switch (jumpType) {
      case JumpTypes.Run:
        return {
          x:
            state.facing === Directions.Left
              ? -JUMP_CONFIG.RUN_JUMP_VELOCITY_X
              : JUMP_CONFIG.RUN_JUMP_VELOCITY_X,
          y: JUMP_CONFIG.RUN_JUMP_VELOCITY_Y,
        };
      case JumpTypes.Forward:
        return {
          x:
            state.facing === Directions.Left
              ? -JUMP_CONFIG.FORWARD_JUMP_VELOCITY_X
              : JUMP_CONFIG.FORWARD_JUMP_VELOCITY_X,
          y: JUMP_CONFIG.FORWARD_JUMP_VELOCITY_Y,
        };
      case JumpTypes.Neutral:
      default:
        return {
          x: 0,
          y: JUMP_CONFIG.JUMP_VELOCITY,
        };
    }
  })();

  return {
    ...state,
    velocity: jumpVelocity,
    jump: {
      ...state.jump,
      isJumping: true,
      isFalling: false,
      isLanding: false,
      hasReleasedSpace: false,
      jumpType,
      jumpStartTime: Date.now(),
      velocityApplied: true,
      maxFallVelocity: 0,
    },
  };
};

const transitionToFalling = (state: PlayerState): PlayerState => ({
  ...state,
  jump: {
    ...state.jump,
    isJumping: false,
    isFalling: true,
    maxFallVelocity: Math.max(state.jump.maxFallVelocity, state.velocity.y),
  },
});

const transitionToLanding = (state: PlayerState): PlayerState => ({
  ...state,
  jump: {
    ...state.jump,
    isJumping: false,
    isFalling: false,
    isLanding: true,
    landingStartVelocity: state.velocity.x,
  },
});

const exitLanding = (state: PlayerState): PlayerState => ({
  ...state,
  jump: {
    ...state.jump,
    isLanding: false,
    isJumping: false,
    isFalling: false,
    velocityApplied: false,
    jumpType: null,
  },
});

const updateSpaceKeyState = (
  state: PlayerState,
  input: PlayerInput
): PlayerState => ({
  ...state,
  jump: {
    ...state.jump,
    hasReleasedSpace: !input.space,
  },
});
