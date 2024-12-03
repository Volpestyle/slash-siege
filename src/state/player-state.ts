import {
  PlayerInput,
  PlayerState,
} from "../types/player-types/player-animation-types";
import { pipe } from "../utils/functional-utils";
import { updateAnimation } from "./player-states/animation-state";
import { updateJump } from "./player-states/jump-state";
import { updateMovement } from "./player-states/movement-state";

export const updatePlayerState = (
  state: PlayerState,
  input: PlayerInput
): PlayerState => {
  return pipe(
    state,
    (state) => updateJump(state, input),
    (state) => updateMovement(state, input),
    (state) => updateAnimation(state)
  );
};
