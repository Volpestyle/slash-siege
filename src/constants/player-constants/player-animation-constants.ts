import { AnimationFrameData } from "../../types/animation-types";
import { PlayerAnimations } from "./player-animation-enums";

export const PLAYER_ANIMATION_FRAMES: Record<
  PlayerAnimations,
  AnimationFrameData
> = {
  [PlayerAnimations.Idle]: { START: 0, END: 58, REPEAT: -1 },
  [PlayerAnimations.RunStart]: { START: 0, END: 28 },
  [PlayerAnimations.RunLoop]: { START: 0, END: 16, REPEAT: -1 },
  [PlayerAnimations.RunStop]: { START: 0, END: 32 },
  [PlayerAnimations.RunStopSlow]: { START: 0, END: 13 },
  [PlayerAnimations.RunSwitch]: { START: 0, END: 19 },
  [PlayerAnimations.WalkStart]: { START: 0, END: 11 },
  [PlayerAnimations.WalkLoop]: { START: 0, END: 27, REPEAT: -1 },
  [PlayerAnimations.WalkStop]: { START: 0, END: 12 },
  [PlayerAnimations.JumpNeutralStart]: { START: 0, END: 26 },
  [PlayerAnimations.JumpNeutralFall]: { START: 0, END: 6, REPEAT: -1 },
  [PlayerAnimations.JumpNeutralLand]: { START: 0, END: 18 },
  [PlayerAnimations.JumpForwardStart]: { START: 0, END: 22 },
  [PlayerAnimations.JumpForwardFall]: { START: 0, END: 6, REPEAT: -1 },
  [PlayerAnimations.JumpForwardLand]: { START: 0, END: 18 },
  [PlayerAnimations.RunJumpStart]: { START: 0, END: 23 },
  [PlayerAnimations.RunJumpFall]: { START: 0, END: 6, REPEAT: -1 },
  [PlayerAnimations.RunJumpLandLight]: { START: 0, END: 9 },
  [PlayerAnimations.RunJumpLandHeavy]: { START: 0, END: 18 },
  [PlayerAnimations.RunJumpLandLightContinue]: { START: 0, END: 3 },
  [PlayerAnimations.RunJumpLandHeavyContinue]: { START: 0, END: 7 },
  [PlayerAnimations.RunJumpLandLightStop]: { START: 0, END: 12 },
  [PlayerAnimations.RunJumpLandHeavyStop]: { START: 0, END: 15 },
};

export const PLAYER_ANIMATION_PREFIXES: Record<PlayerAnimations, string> = {
  [PlayerAnimations.Idle]: "idle",
  [PlayerAnimations.RunStart]: "run_start",
  [PlayerAnimations.RunLoop]: "run_loop",
  [PlayerAnimations.RunStop]: "run_stop",
  [PlayerAnimations.RunStopSlow]: "run_stop_slow",
  [PlayerAnimations.RunSwitch]: "run_switch",
  [PlayerAnimations.WalkStart]: "walk_start",
  [PlayerAnimations.WalkLoop]: "walk_loop",
  [PlayerAnimations.WalkStop]: "walk_stop",
  [PlayerAnimations.JumpNeutralStart]: "jump_neutral_start",
  [PlayerAnimations.JumpNeutralFall]: "jump_neutral_fall",
  [PlayerAnimations.JumpNeutralLand]: "jump_neutral_land",
  [PlayerAnimations.JumpForwardStart]: "jump_forward_start",
  [PlayerAnimations.JumpForwardFall]: "jump_forward_fall",
  [PlayerAnimations.JumpForwardLand]: "jump_forward_land",
  [PlayerAnimations.RunJumpStart]: "run_jump_start",
  [PlayerAnimations.RunJumpFall]: "run_jump_fall",
  [PlayerAnimations.RunJumpLandLight]: "run_jump_land_light",
  [PlayerAnimations.RunJumpLandHeavy]: "run_jump_land_heavy",
  [PlayerAnimations.RunJumpLandLightContinue]: "run_jump_land_light_continue",
  [PlayerAnimations.RunJumpLandHeavyContinue]: "run_jump_land_heavy_continue",
  [PlayerAnimations.RunJumpLandLightStop]: "run_jump_land_light_stop",
  [PlayerAnimations.RunJumpLandHeavyStop]: "run_jump_land_heavy_stop",
};

// Animations that must complete before transitioning (unless cancelled by input)
export const MUST_COMPLETE_ANIMATIONS = new Set([
  PlayerAnimations.RunJumpLandHeavy,
]);
