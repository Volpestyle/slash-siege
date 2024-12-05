import {
  PlayerAnimations,
  PlayerJumpTypes,
} from "../constants/player-constants/player-animation-enums";
import { PlayerAnimationData } from "../constants/player-constants/player-animation-metadata";
import { AnimationConfig, AnimationMetadata } from "../types/animation-types";

export interface ValidationError {
  key: string;
  errors: string[];
}

export function getAnimationsByCategory<T>(
  animations: Record<string, AnimationConfig<T>>,
  categories: string | string[]
): string[] {
  const categoryArray = Array.isArray(categories) ? categories : [categories];

  return Object.entries(animations)
    .filter(([_, config]) => {
      const metadataCategory = config.metadata.category;

      if (typeof metadataCategory === "string") {
        return categoryArray.includes(metadataCategory);
      }

      if (Array.isArray(metadataCategory)) {
        return metadataCategory.some((cat) => categoryArray.includes(cat));
      }

      return false;
    })
    .map(([anim]) => anim);
}

export function getNextAnimation<T>(
  animations: Record<string, AnimationConfig<T>>,
  currentAnimation: string,
  state?: any
): string | undefined {
  const animConfig = animations[currentAnimation];
  if (!animConfig?.metadata.nextAnimation) return undefined;

  if (typeof animConfig.metadata.nextAnimation === "function") {
    return animConfig.metadata.nextAnimation(state);
  }

  return animConfig.metadata.nextAnimation;
}

export function validateAnimationConfig<T>(
  config: AnimationConfig<T>,
  textureManager?: Phaser.Textures.TextureManager,
  spritesheet?: string
): ValidationError | null {
  const errors: string[] = [];
  const key = config.key || "unnamed";

  // Check for required properties
  if (!config.prefix) {
    errors.push("Missing animation prefix");
  }

  if (!config.frames) {
    errors.push("Missing frames configuration");
  } else {
    // Validate frame range
    if (config.frames.start < 0) {
      errors.push(`Invalid start frame: ${config.frames.start}`);
    }
    if (config.frames.end < config.frames.start) {
      errors.push(
        `End frame (${config.frames.end}) is less than start frame (${config.frames.start})`
      );
    }

    // Optional spritesheet frame validation
    if (textureManager && spritesheet) {
      const frameKey = `${config.prefix}${String(config.frames.start).padStart(
        4,
        "0"
      )}`;
      if (!textureManager.getFrame(spritesheet, frameKey)) {
        errors.push(
          `Frame ${frameKey} not found in spritesheet ${spritesheet}`
        );
      }
    }
  }

  // Validate metadata
  if (config.metadata) {
    const metadataErrors = validateAnimationMetadata(
      config.frames,
      config.metadata
    );
    errors.push(...metadataErrors);
  }

  return errors.length > 0 ? { key, errors } : null;
}

export function validateAnimationMetadata<T>(
  frames: { start: number; end: number } | undefined,
  metadata: AnimationMetadata<T>
): string[] {
  const errors: string[] = [];

  if (frames) {
    // Validate physics frame
    if (metadata.physicsFrame !== undefined) {
      if (
        metadata.physicsFrame < frames.start ||
        metadata.physicsFrame > frames.end
      ) {
        errors.push(
          `Physics frame ${metadata.physicsFrame} outside of frame range ${frames.start}-${frames.end}`
        );
      }
    }

    // Validate custom events
    if (metadata.customEvents) {
      metadata.customEvents.forEach((event, index) => {
        if (event.frame < frames.start || event.frame > frames.end) {
          errors.push(
            `Custom event ${index} frame ${event.frame} outside of frame range ${frames.start}-${frames.end}`
          );
        }
      });
    }
  }

  return errors;
}

export function validateAnimations<T>(
  animations: Record<string, AnimationConfig<T>>,
  textureManager?: Phaser.Textures.TextureManager,
  spritesheet?: string
): ValidationError[] {
  return Object.entries(animations)
    .map(([key, config]) =>
      validateAnimationConfig({ ...config, key }, textureManager, spritesheet)
    )
    .filter((error): error is ValidationError => error !== null);
}

export function canInterruptAnimation<T>(
  animations: Record<string, AnimationConfig<T>>,
  animation: string
): boolean {
  return animations[animation]?.metadata.canInterrupt ?? true;
}

export function getAnimationCategory<T>(
  animations: Record<string, AnimationConfig<T>>,
  animation: string
): string | string[] {
  return animations[animation]?.metadata.category ?? "default";
}

export function getTypeSpecificData<T>(
  animations: Record<string, AnimationConfig<T>>,
  animation: string
): T | undefined {
  return animations[animation]?.metadata.typeSpecificData;
}

export function getJumpTypeForAnimation(
  animations: Record<PlayerAnimations, AnimationConfig<PlayerAnimationData>>,
  animation: PlayerAnimations
): PlayerJumpTypes | undefined {
  return animations[animation]?.metadata.typeSpecificData?.jumpType;
}
