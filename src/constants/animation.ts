import { AnimationConfig } from "../types/animation";

export const ANIMATION: AnimationConfig = {
  FRAMERATE: 30,
  SCALE: 100 / 482,
  SPEED: 200,
  WALK_SPEED: 100,
  FRAMES: {
    IDLE: { START: 0, END: 58 },
    RUN_START: { START: 0, END: 28 },
    RUN_LOOP: { START: 0, END: 16 },
    RUN_STOP: { START: 0, END: 32 },
    RUN_STOP_SLOW: { START: 0, END: 13 }, // Updated from 18
    RUN_SWITCH: { START: 0, END: 19 },
    WALK_START: { START: 0, END: 11 },
    WALK_LOOP: { START: 0, END: 27 },
    WALK_STOP: { START: 0, END: 12 },
    // Jump animations
    JUMP_NEUTRAL_START: { START: 0, END: 26 },
    JUMP_NEUTRAL_FALL: { START: 0, END: 6 },
    JUMP_NEUTRAL_LAND: { START: 0, END: 18 }, // Updated from 19
    JUMP_FORWARD_START: { START: 0, END: 22 },
    JUMP_FORWARD_FALL: { START: 0, END: 6 },
    JUMP_FORWARD_LAND: { START: 0, END: 18 }, // Updated from 19
    RUN_JUMP_START: { START: 0, END: 23 },
    RUN_JUMP_FALL: { START: 0, END: 6 },
    RUN_JUMP_LAND_LIGHT: { START: 0, END: 9 },
    RUN_JUMP_LAND_HEAVY: { START: 0, END: 18 },
    RUN_JUMP_LAND_LIGHT_CONTINUE: { START: 0, END: 3 },
    RUN_JUMP_LAND_HEAVY_CONTINUE: { START: 0, END: 7 }, // Updated from 9
    RUN_JUMP_LAND_LIGHT_STOP: { START: 0, END: 12 },
    RUN_JUMP_LAND_HEAVY_STOP: { START: 0, END: 15 }, // Updated from 18
  },
  NAMES: {
    IDLE: "idle",
    RUN_START: "run-start",
    RUN_LOOP: "run-loop",
    RUN_STOP: "run-stop",
    RUN_STOP_SLOW: "run-stop-slow",
    RUN_SWITCH: "run-switch",
    WALK_START: "walk-start",
    WALK_LOOP: "walk-loop",
    WALK_STOP: "walk-stop",
    JUMP_NEUTRAL_START: "jump-neutral-start",
    JUMP_NEUTRAL_FALL: "jump-neutral-fall",
    JUMP_NEUTRAL_LAND: "jump-neutral-land",
    JUMP_FORWARD_START: "jump-forward-start",
    JUMP_FORWARD_FALL: "jump-forward-fall",
    JUMP_FORWARD_LAND: "jump-forward-land",
    RUN_JUMP_START: "run-jump-start",
    RUN_JUMP_FALL: "run-jump-fall",
    RUN_JUMP_LAND_LIGHT: "run-jump-land-light",
    RUN_JUMP_LAND_HEAVY: "run-jump-land-heavy",
    RUN_JUMP_LAND_LIGHT_CONTINUE: "run-jump-land-light-continue",
    RUN_JUMP_LAND_HEAVY_CONTINUE: "run-jump-land-heavy-continue",
    RUN_JUMP_LAND_LIGHT_STOP: "run-jump-land-light-stop",
    RUN_JUMP_LAND_HEAVY_STOP: "run-jump-land-heavy-stop",
  },
} as const;
