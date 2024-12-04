// animation-metadata.ts

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

export interface AnimationInfo {
  category: AnimationCategory;
  canInterrupt: boolean;
  nextAnimation?:
    | PlayerAnimations
    | ((isAccelerating: boolean) => PlayerAnimations);
  jumpType?: PlayerJumpTypes;
  speedThreshold?: number;
}

export const ANIMATION_METADATA = new Map<PlayerAnimations, AnimationInfo>([
  // Idle
  [
    PlayerAnimations.Idle,
    {
      category: AnimationCategory.Idle,
      canInterrupt: true,
    },
  ],

  // Running States
  [
    PlayerAnimations.RunStart,
    {
      category: AnimationCategory.Transitioning,
      canInterrupt: true,
      nextAnimation: PlayerAnimations.RunLoop,
    },
  ],
  [
    PlayerAnimations.RunLoop,
    {
      category: AnimationCategory.Running,
      canInterrupt: true,
    },
  ],
  [
    PlayerAnimations.RunStop,
    {
      category: AnimationCategory.Stopping,
      canInterrupt: false,
      nextAnimation: PlayerAnimations.Idle,
      speedThreshold: 480,
    },
  ],
  [
    PlayerAnimations.RunStopSlow,
    {
      category: AnimationCategory.Stopping,
      canInterrupt: false,
      nextAnimation: PlayerAnimations.Idle,
      speedThreshold: 400,
    },
  ],
  [
    PlayerAnimations.RunSwitch,
    {
      category: AnimationCategory.Transitioning,
      canInterrupt: false,
      nextAnimation: PlayerAnimations.RunLoop,
    },
  ],

  // Walking States
  [
    PlayerAnimations.WalkStart,
    {
      category: AnimationCategory.Transitioning,
      canInterrupt: true,
      nextAnimation: PlayerAnimations.WalkLoop,
    },
  ],
  [
    PlayerAnimations.WalkLoop,
    {
      category: AnimationCategory.Walking,
      canInterrupt: true,
    },
  ],
  [
    PlayerAnimations.WalkStop,
    {
      category: AnimationCategory.Stopping,
      canInterrupt: false,
      nextAnimation: PlayerAnimations.Idle,
      speedThreshold: 150,
    },
  ],

  // Jump States
  [
    PlayerAnimations.JumpNeutralStart,
    {
      category: AnimationCategory.Jumping,
      canInterrupt: false,
      jumpType: PlayerJumpTypes.Neutral,
      nextAnimation: PlayerAnimations.JumpNeutralFall,
    },
  ],
  [
    PlayerAnimations.JumpNeutralFall,
    {
      category: AnimationCategory.Falling,
      canInterrupt: true,
      jumpType: PlayerJumpTypes.Neutral,
    },
  ],
  [
    PlayerAnimations.JumpNeutralLand,
    {
      category: AnimationCategory.Landing,
      canInterrupt: false,
      nextAnimation: PlayerAnimations.Idle,
    },
  ],

  // Forward Jump States
  [
    PlayerAnimations.JumpForwardStart,
    {
      category: AnimationCategory.Jumping,
      canInterrupt: false,
      jumpType: PlayerJumpTypes.Forward,
      nextAnimation: PlayerAnimations.JumpForwardFall,
    },
  ],
  [
    PlayerAnimations.JumpForwardFall,
    {
      category: AnimationCategory.Falling,
      canInterrupt: true,
      jumpType: PlayerJumpTypes.Forward,
    },
  ],
  [
    PlayerAnimations.JumpForwardLand,
    {
      category: AnimationCategory.Landing,
      canInterrupt: false,
      nextAnimation: PlayerAnimations.Idle,
    },
  ],

  // Run Jump States
  [
    PlayerAnimations.RunJumpStart,
    {
      category: AnimationCategory.Jumping,
      canInterrupt: true,
      jumpType: PlayerJumpTypes.Run,
      nextAnimation: PlayerAnimations.RunJumpFall,
    },
  ],
  [
    PlayerAnimations.RunJumpFall,
    {
      category: AnimationCategory.Falling,
      canInterrupt: true,
      jumpType: PlayerJumpTypes.Run,
    },
  ],
  [
    PlayerAnimations.RunJumpLandLight,
    {
      category: AnimationCategory.Landing,
      canInterrupt: false,
      nextAnimation: (isAccelerating: boolean) =>
        isAccelerating
          ? PlayerAnimations.RunJumpLandLightContinue
          : PlayerAnimations.RunJumpLandLightStop,
    },
  ],
  [
    PlayerAnimations.RunJumpLandHeavy,
    {
      category: AnimationCategory.Landing,
      canInterrupt: false,
      nextAnimation: (isAccelerating: boolean) =>
        isAccelerating
          ? PlayerAnimations.RunJumpLandHeavyContinue
          : PlayerAnimations.RunJumpLandHeavyStop,
    },
  ],
  [
    PlayerAnimations.RunJumpLandLightContinue,
    {
      category: AnimationCategory.Transitioning,
      canInterrupt: false,
      nextAnimation: PlayerAnimations.RunLoop,
    },
  ],
  [
    PlayerAnimations.RunJumpLandHeavyContinue,
    {
      category: AnimationCategory.Transitioning,
      canInterrupt: false,
      nextAnimation: PlayerAnimations.RunLoop,
    },
  ],
  [
    PlayerAnimations.RunJumpLandLightStop,
    {
      category: AnimationCategory.Stopping,
      canInterrupt: false,
      nextAnimation: PlayerAnimations.Idle,
    },
  ],
  [
    PlayerAnimations.RunJumpLandHeavyStop,
    {
      category: AnimationCategory.Stopping,
      canInterrupt: false,
      nextAnimation: PlayerAnimations.Idle,
    },
  ],
]);

// Helper functions to work with metadata
export function getAnimationsByCategory(
  category: AnimationCategory
): PlayerAnimations[] {
  return Array.from(ANIMATION_METADATA.entries())
    .filter(([_, info]) => info.category === category)
    .map(([anim]) => anim);
}

export function getNextAnimation(
  currentAnimation: PlayerAnimations,
  isAccelerating: boolean
): PlayerAnimations | undefined {
  const metadata = ANIMATION_METADATA.get(currentAnimation);
  if (!metadata?.nextAnimation) return undefined;

  if (typeof metadata.nextAnimation === "function") {
    return metadata.nextAnimation(isAccelerating);
  }

  return metadata.nextAnimation;
}

export function getJumpTypeForAnimation(
  animation: PlayerAnimations
): PlayerJumpTypes | undefined {
  return ANIMATION_METADATA.get(animation)?.jumpType;
}

export function canInterruptAnimation(animation: PlayerAnimations): boolean {
  return ANIMATION_METADATA.get(animation)?.canInterrupt ?? true;
}

export function getAnimationCategory(
  animation: PlayerAnimations
): AnimationCategory {
  return ANIMATION_METADATA.get(animation)?.category ?? AnimationCategory.Idle;
}

// Groups for common checks
export const CONTINUOUS_ANIMATIONS = new Set([
  AnimationCategory.Running,
  AnimationCategory.Walking,
]);

export const LANDING_ANIMATIONS = new Set(
  getAnimationsByCategory(AnimationCategory.Landing)
);
export const JUMPING_ANIMATIONS = new Set(
  getAnimationsByCategory(AnimationCategory.Jumping)
);
export const FALLING_ANIMATIONS = new Set(
  getAnimationsByCategory(AnimationCategory.Falling)
);
export const STOPPING_ANIMATIONS = new Set(
  getAnimationsByCategory(AnimationCategory.Stopping)
);
