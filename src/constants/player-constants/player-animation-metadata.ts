// animation-metadata.ts

import { AnimationConfig } from "../../types/animation-types";
import { getAnimationsByCategory } from "../../utils/animation-metadata-util";
import { ANIMATION_FRAMERATE } from "../animation-constants";
import { PlayerAnimations, PlayerJumpTypes } from "./player-animation-enums";

export enum AnimationCategory {
  Idle = "idle",
  Running = "running",
  Walking = "walking",
  Landing = "landing",
  Jumping = "jumping",
  Falling = "falling",
  Stopping = "stopping",
  Transitioning = "transitioning",
}

export interface PlayerAnimationData {
  jumpType?: PlayerJumpTypes;
  requiredStamina?: number;
  // ... other player-specific animation data
}

export const PLAYER_ANIMATIONS: Record<
  PlayerAnimations,
  AnimationConfig<PlayerAnimationData>
> = {
  [PlayerAnimations.Idle]: {
    prefix: "idle",
    frames: { start: 0, end: 58, repeat: -1 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Idle,
    },
  },

  // Running States
  [PlayerAnimations.RunStart]: {
    prefix: "run_start",
    frames: { start: 0, end: 28 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Running,
      nextAnimation: PlayerAnimations.RunLoop,
    },
  },
  [PlayerAnimations.RunLoop]: {
    prefix: "run_loop",
    frames: { start: 0, end: 16, repeat: -1 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Running,
    },
  },
  [PlayerAnimations.RunStop]: {
    prefix: "run_stop",
    frames: { start: 0, end: 32 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Stopping,
      nextAnimation: PlayerAnimations.Idle,
      speedThreshold: 480,
    },
  },
  [PlayerAnimations.RunStopSlow]: {
    prefix: "run_stop_slow",
    frames: { start: 0, end: 13 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Stopping,
      nextAnimation: PlayerAnimations.Idle,
      speedThreshold: 400,
    },
  },
  [PlayerAnimations.RunSwitch]: {
    prefix: "run_switch",
    frames: { start: 0, end: 19 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Transitioning,
      nextAnimation: PlayerAnimations.RunLoop,
    },
  },

  // Walking States
  [PlayerAnimations.WalkStart]: {
    prefix: "walk_start",
    frames: { start: 0, end: 11 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Transitioning,
      nextAnimation: PlayerAnimations.WalkLoop,
    },
  },
  [PlayerAnimations.WalkLoop]: {
    prefix: "walk_loop",
    frames: { start: 0, end: 27, repeat: -1 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Walking,
    },
  },
  [PlayerAnimations.WalkStop]: {
    prefix: "walk_stop",
    frames: { start: 0, end: 12 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Stopping,

      nextAnimation: PlayerAnimations.Idle,
      speedThreshold: 150,
    },
  },

  // Neutral Jump States
  [PlayerAnimations.JumpNeutralStart]: {
    prefix: "jump_neutral_start",
    frames: { start: 0, end: 26 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Jumping,
      nextAnimation: PlayerAnimations.JumpNeutralFall,
      typeSpecificData: {
        jumpType: PlayerJumpTypes.Neutral,
      },
      physicsFrame: 12,
      physicsFrameEvent: "playerJumpPhysics",
    },
  },
  [PlayerAnimations.JumpNeutralFall]: {
    prefix: "jump_neutral_fall",
    frames: { start: 0, end: 6, repeat: -1 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Falling,
      typeSpecificData: {
        jumpType: PlayerJumpTypes.Neutral,
      },
    },
  },
  [PlayerAnimations.JumpNeutralLand]: {
    prefix: "jump_neutral_land",
    frames: { start: 0, end: 18 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Landing,
      nextAnimation: PlayerAnimations.Idle,
    },
  },

  // Forward Jump States
  [PlayerAnimations.JumpForwardStart]: {
    prefix: "jump_forward_start",
    frames: { start: 0, end: 22 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Jumping,
      nextAnimation: PlayerAnimations.JumpForwardFall,
      typeSpecificData: {
        jumpType: PlayerJumpTypes.Forward,
      },
      physicsFrame: 12,
      physicsFrameEvent: "playerJumpPhysics",
    },
  },
  [PlayerAnimations.JumpForwardFall]: {
    prefix: "jump_forward_fall",
    frames: { start: 0, end: 6, repeat: -1 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Falling,
      typeSpecificData: {
        jumpType: PlayerJumpTypes.Forward,
      },
    },
  },
  [PlayerAnimations.JumpForwardLand]: {
    prefix: "jump_forward_land",
    frames: { start: 0, end: 18 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Landing,
      nextAnimation: PlayerAnimations.Idle,
    },
  },

  // Run Jump States
  [PlayerAnimations.RunJumpStart]: {
    prefix: "run_jump_start",
    frames: { start: 0, end: 23 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Jumping,
      nextAnimation: PlayerAnimations.RunJumpFall,
      typeSpecificData: {
        jumpType: PlayerJumpTypes.Run,
      },
      physicsFrame: 8,
      physicsFrameEvent: "playerJumpPhysics",
    },
  },
  [PlayerAnimations.RunJumpFall]: {
    prefix: "run_jump_fall",
    frames: { start: 0, end: 6, repeat: -1 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Falling,
      typeSpecificData: {
        jumpType: PlayerJumpTypes.Run,
      },
    },
  },
  [PlayerAnimations.RunJumpLandLight]: {
    prefix: "run_jump_land_light",
    frames: { start: 0, end: 9 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Landing,
      nextAnimation: (isAccelerating: boolean) =>
        isAccelerating
          ? PlayerAnimations.RunJumpLandLightContinue
          : PlayerAnimations.RunJumpLandLightStop,
    },
  },
  [PlayerAnimations.RunJumpLandHeavy]: {
    prefix: "run_jump_land_heavy",
    frames: { start: 0, end: 18 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: AnimationCategory.Landing,
      nextAnimation: (isAccelerating: boolean) =>
        isAccelerating
          ? PlayerAnimations.RunJumpLandHeavyContinue
          : PlayerAnimations.RunJumpLandHeavyStop,
    },
  },
  [PlayerAnimations.RunJumpLandLightContinue]: {
    prefix: "run_jump_land_light_continue",
    frames: { start: 0, end: 3 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: [AnimationCategory.Landing, AnimationCategory.Transitioning],

      nextAnimation: PlayerAnimations.RunLoop,
    },
  },
  [PlayerAnimations.RunJumpLandHeavyContinue]: {
    prefix: "run_jump_land_heavy_continue",
    frames: { start: 0, end: 7 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: [AnimationCategory.Landing, AnimationCategory.Transitioning],

      nextAnimation: PlayerAnimations.RunLoop,
    },
  },
  [PlayerAnimations.RunJumpLandLightStop]: {
    prefix: "run_jump_land_light_stop",
    frames: { start: 0, end: 12 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: [
        AnimationCategory.Stopping,
        AnimationCategory.Landing,
        AnimationCategory.Transitioning,
      ],

      nextAnimation: PlayerAnimations.Idle,
    },
  },
  [PlayerAnimations.RunJumpLandHeavyStop]: {
    prefix: "run_jump_land_heavy_stop",
    frames: { start: 0, end: 15 },
    frameRate: ANIMATION_FRAMERATE,
    metadata: {
      category: [
        AnimationCategory.Stopping,
        AnimationCategory.Landing,
        AnimationCategory.Transitioning,
      ],

      nextAnimation: PlayerAnimations.Idle,
    },
  },
};

export const TRANSITION_ANIMATIONS = new Set(
  getAnimationsByCategory(PLAYER_ANIMATIONS, AnimationCategory.Transitioning)
);

// Animation groups using updated helpers
export const CONTINUOUS_ANIMATIONS = new Set(
  getAnimationsByCategory(PLAYER_ANIMATIONS, [
    AnimationCategory.Running,
    AnimationCategory.Walking,
  ])
);

export const LANDING_ANIMATIONS = new Set(
  getAnimationsByCategory(PLAYER_ANIMATIONS, AnimationCategory.Landing)
);

export const JUMPING_ANIMATIONS = new Set(
  getAnimationsByCategory(PLAYER_ANIMATIONS, AnimationCategory.Jumping)
);

export const FALLING_ANIMATIONS = new Set(
  getAnimationsByCategory(PLAYER_ANIMATIONS, AnimationCategory.Falling)
);

export const STOPPING_ANIMATIONS = new Set(
  getAnimationsByCategory(PLAYER_ANIMATIONS, AnimationCategory.Stopping)
);
