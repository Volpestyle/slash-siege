import { Directions } from "../../constants/player-enums/player-animation-enums";
import { GROUND_MOVEMENT_CONFIG } from "../../constants/player-enums/player-physics-enums";
import {
  Direction,
  PlayerInput,
  PlayerState,
} from "../../types/player-types/player-animation-types";

export const updateMovement = (
  state: PlayerState,
  input: PlayerInput
): PlayerState => {
  if (state.jump.isJumping && !state.jump.isLanding) {
    return state;
  }

  const direction = getMovementDirection(input);
  const targetVelocity = calculateTargetVelocity(state, input, direction);
  const acceleration = determineAcceleration(state, input);

  return {
    ...state,
    velocity: {
      ...state.velocity,
      x: Phaser.Math.Linear(
        state.velocity.x,
        targetVelocity,
        (input.delta * acceleration) / GROUND_MOVEMENT_CONFIG.MAX_SPEED
      ),
    },
    facing: direction || state.facing,
    movement: {
      ...state.movement,
      isWalking: input.shift,
      isAccelerating: Boolean(direction),
    },
  };
};

const getMovementDirection = (input: PlayerInput): Direction | null => {
  if (input.left) return Directions.Left;
  if (input.right) return Directions.Right;
  return null;
};

const calculateTargetVelocity = (
  state: PlayerState,
  input: PlayerInput,
  direction: Direction | null
): number => {
  if (!direction) return 0;

  const maxSpeed = state.movement.isWalking
    ? GROUND_MOVEMENT_CONFIG.MAX_WALK_SPEED
    : GROUND_MOVEMENT_CONFIG.MAX_SPEED;

  return direction === Directions.Left ? -maxSpeed : maxSpeed;
};

const determineAcceleration = (
  state: PlayerState,
  input: PlayerInput
): number => {
  if (!state.movement.isAccelerating) {
    return state.movement.isWalking
      ? GROUND_MOVEMENT_CONFIG.WALK_STOP_DECELERATION
      : GROUND_MOVEMENT_CONFIG.RUN_STOP_DECELERATION;
  }

  return state.movement.isWalking
    ? GROUND_MOVEMENT_CONFIG.WALK_ACCELERATION
    : GROUND_MOVEMENT_CONFIG.RUN_ACCELERATION;
};
