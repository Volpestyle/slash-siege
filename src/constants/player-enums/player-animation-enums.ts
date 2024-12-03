import { AnimationFrameData } from "../../types/animation-types";

export enum Directions {
  Left = "left",
  Right = "right",
}

export enum JumpTypes {
  Neutral = "neutral",
  Forward = "forward",
  Run = "run",
}

export enum PlayerStateType {
  Idle = "idle",
  Walking = "walking",
  Running = "running",
  JumpingNeutral = "jumpingNeutral",
  JumpingForward = "jumpingForward",
  JumpingRun = "jumpingRun",
  Falling = "falling",
  Landing = "landing",
}

export enum AnimationStates {
  // Ground States
  Idle = "idle",
  RunStart = "runStart",
  RunLoop = "runLoop",
  RunStop = "runStop",
  RunStopSlow = "runStopSlow",
  RunSwitch = "runSwitch",
  WalkStart = "walkStart",
  WalkLoop = "walkLoop",
  WalkStop = "walkStop",

  // Jump States
  JumpNeutralStart = "jumpNeutralStart",
  JumpNeutralFall = "jumpNeutralFall",
  JumpNeutralLand = "jumpNeutralLand",

  // Forward Jump States
  JumpForwardStart = "jumpForwardStart",
  JumpForwardFall = "jumpForwardFall",
  JumpForwardLand = "jumpForwardLand",

  // Run Jump States
  RunJumpStart = "runJumpStart",
  RunJumpFall = "runJumpFall",
  RunJumpLandLight = "runJumpLandLight",
  RunJumpLandHeavy = "runJumpLandHeavy",
  RunJumpLandLightContinue = "runJumpLandLightContinue",
  RunJumpLandHeavyContinue = "runJumpLandHeavyContinue",
  RunJumpLandLightStop = "runJumpLandLightStop",
  RunJumpLandHeavyStop = "runJumpLandHeavyStop",
}

export const ANIMATION_FRAMES: Record<AnimationStates, AnimationFrameData> = {
  [AnimationStates.Idle]: { START: 0, END: 58 },
  [AnimationStates.RunStart]: { START: 0, END: 28 },
  [AnimationStates.RunLoop]: { START: 0, END: 16 },
  [AnimationStates.RunStop]: { START: 0, END: 32 },
  [AnimationStates.RunStopSlow]: { START: 0, END: 13 },
  [AnimationStates.RunSwitch]: { START: 0, END: 19 },
  [AnimationStates.WalkStart]: { START: 0, END: 11 },
  [AnimationStates.WalkLoop]: { START: 0, END: 27 },
  [AnimationStates.WalkStop]: { START: 0, END: 12 },
  [AnimationStates.JumpNeutralStart]: { START: 0, END: 26 },
  [AnimationStates.JumpNeutralFall]: { START: 0, END: 6 },
  [AnimationStates.JumpNeutralLand]: { START: 0, END: 18 },
  [AnimationStates.JumpForwardStart]: { START: 0, END: 22 },
  [AnimationStates.JumpForwardFall]: { START: 0, END: 6 },
  [AnimationStates.JumpForwardLand]: { START: 0, END: 18 },
  [AnimationStates.RunJumpStart]: { START: 0, END: 23 },
  [AnimationStates.RunJumpFall]: { START: 0, END: 6 },
  [AnimationStates.RunJumpLandLight]: { START: 0, END: 9 },
  [AnimationStates.RunJumpLandHeavy]: { START: 0, END: 18 },
  [AnimationStates.RunJumpLandLightContinue]: { START: 0, END: 3 },
  [AnimationStates.RunJumpLandHeavyContinue]: { START: 0, END: 7 },
  [AnimationStates.RunJumpLandLightStop]: { START: 0, END: 12 },
  [AnimationStates.RunJumpLandHeavyStop]: { START: 0, END: 15 },
};

export const ANIMATION_PREFIXES = {
  [AnimationStates.Idle]: "idle",
  [AnimationStates.RunStart]: "run_start",
  [AnimationStates.RunLoop]: "run_loop",
  [AnimationStates.RunStop]: "run_stop",
  [AnimationStates.RunStopSlow]: "run_stop_slow",
  [AnimationStates.RunSwitch]: "run_switch",
  [AnimationStates.WalkStart]: "walk_start",
  [AnimationStates.WalkLoop]: "walk_loop",
  [AnimationStates.WalkStop]: "walk_stop",
  [AnimationStates.JumpNeutralStart]: "jump_neutral_start",
  [AnimationStates.JumpNeutralFall]: "jump_neutral_fall",
  [AnimationStates.JumpNeutralLand]: "jump_neutral_land",
  [AnimationStates.JumpForwardStart]: "jump_forward_start",
  [AnimationStates.JumpForwardFall]: "jump_forward_fall",
  [AnimationStates.JumpForwardLand]: "jump_forward_land",
  [AnimationStates.RunJumpStart]: "run_jump_start",
  [AnimationStates.RunJumpFall]: "run_jump_fall",
  [AnimationStates.RunJumpLandLight]: "run_jump_land_light",
  [AnimationStates.RunJumpLandHeavy]: "run_jump_land_heavy",
  [AnimationStates.RunJumpLandLightContinue]: "run_jump_land_light_continue",
  [AnimationStates.RunJumpLandHeavyContinue]: "run_jump_land_heavy_continue",
  [AnimationStates.RunJumpLandLightStop]: "run_jump_land_light_stop",
  [AnimationStates.RunJumpLandHeavyStop]: "run_jump_land_heavy_stop",
} as const;

// We can then type it after the fact if needed:
export type AnimationPrefixes = typeof ANIMATION_PREFIXES;
