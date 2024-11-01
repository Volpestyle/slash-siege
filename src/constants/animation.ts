import { AnimationConfig } from "../types/animation";

export const ANIMATION: AnimationConfig = {
  FRAMERATE: 30,
  SCALE: 100 / 469,
  SPEED: 200,
  FRAMES: {
    IDLE: { START: 0, END: 34 },
    RUN_START: { START: 0, END: 20 },
    RUN_LOOP: { START: 0, END: 16 },
    RUN_STOP: { START: 0, END: 32 },
    RUN_SWITCH: { START: 0, END: 19 },
  },
  NAMES: {
    IDLE: "idle",
    RUN_START: "run-start",
    RUN_LOOP: "run-loop",
    RUN_STOP: "run-stop",
    RUN_SWITCH: "run-switch",
  },
} as const;
