// utils/animationUtils.ts

import { ANIMATION_FRAMERATE } from "../constants/animation-enums";
import {
  ANIMATION_FRAMES,
  ANIMATION_PREFIXES,
  AnimationStates,
} from "../constants/player-enums/player-animation-enums";
import { AnimationConfig } from "../types/animation-types";
import { AnimationState } from "../types/player-types/player-animation-types";

export const setupPlayerAnimations = (scene: Phaser.Scene): void => {
  Object.values(AnimationStates).forEach((state) => {
    const animConfig = ANIMATION_FRAMES[state];
    if (!animConfig) return;

    createAnimation(scene, {
      key: state,
      prefix: ANIMATION_PREFIXES[state],
      start: animConfig.START,
      end: animConfig.END,
      frameRate: ANIMATION_FRAMERATE,
      repeat: animConfig.REPEAT ?? -1,
    });
  });
};

const createAnimation = (
  scene: Phaser.Scene,
  config: AnimationConfig
): void => {
  if (!scene.anims.exists(config.key)) {
    scene.anims.create({
      key: config.key,
      frames: scene.anims.generateFrameNames("player", {
        prefix: config.prefix,
        start: config.start,
        end: config.end,
        zeroPad: 4,
      }),
      frameRate: config.frameRate,
      repeat: config.repeat,
    });
  }
};

// Optional: Helper for playing animations safely
export const playAnimation = (
  sprite: Phaser.GameObjects.Sprite,
  animation: AnimationState,
  ignoreIfPlaying: boolean = true
): void => {
  const currentAnim = sprite.anims.currentAnim;
  if (!currentAnim || currentAnim.key !== animation) {
    sprite.play(animation, ignoreIfPlaying);
  }
};
