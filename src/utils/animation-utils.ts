import { ANIMATION_FRAMERATE } from "../constants/animation-constants";
import { AnimationConfig, AnimationFrameData } from "../types/animation-types";

export const setupAnimations = <T extends { [key: string]: string }>(
  scene: Phaser.Scene,
  animations: T,
  animationFrames: Record<string, AnimationFrameData>,
  animationPrefixes: Record<string, string>
): void => {
  Object.values(animations).forEach((state) => {
    const animConfig = animationFrames[state];
    if (!animConfig) return;

    createAnimation(scene, {
      key: state,
      prefix: animationPrefixes[state],
      start: animConfig.START,
      end: animConfig.END,
      frameRate: ANIMATION_FRAMERATE,
      repeat: animConfig.REPEAT ?? 0,
    });
  });
};

/**
 * Sets up animation completion listeners for a sprite.
 * Provides a generic way to handle animation completion events.
 *
 * @param sprite - The sprite to attach listeners to
 * @param onComplete - Callback function triggered when any animation completes.
 *                    Receives the completed animation key as a parameter.
 */
export const setupAnimationListeners = (
  sprite: Phaser.GameObjects.Sprite,
  onComplete: (animationKey: string) => void
) => {
  sprite.on("animationcomplete", (animation: Phaser.Animations.Animation) => {
    console.log("calling complete listener");
    onComplete(animation.key);
  });
};

/**
 * Creates and configures an animation for the given scene.
 *
 * @param scene - Phaser scene to add animation to
 * @param config - Configuration object containing animation properties
 * @param config.key - Unique identifier for the animation
 * @param config.prefix - Prefix for frame names
 * @param config.start - Starting frame index
 * @param config.end - Ending frame index
 * @param config.frameRate - Animation speed in frames per second
 * @param config.repeat - Number of times to repeat (-1 for infinite)
 */
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

/**
 * Safely plays an animation on a sprite if it's not already playing.
 *
 * @param sprite - Sprite to play animation on
 * @param animation - Animation state/key to play
 * @param ignoreIfPlaying - If true, won't restart animation if already playing
 */
export const playAnimation = (
  sprite: Phaser.GameObjects.Sprite,
  animation: string,
  ignoreIfPlaying: boolean = true
): void => {
  const currentAnim = sprite.anims.currentAnim;
  if (!currentAnim || currentAnim.key !== animation) {
    console.log("playing ", animation);
    sprite.play(animation, ignoreIfPlaying);
  }
};
