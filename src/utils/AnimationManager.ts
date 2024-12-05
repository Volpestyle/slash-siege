import { PlayerAnimationData } from "../constants/player-constants/player-animation-metadata";
import {
  AnimationConfig,
  AnimationFrameEvent,
  AnimationMetadata,
} from "../types/animation-types";
import {
  validateAnimationConfig,
  ValidationError,
} from "./animation-metadata-util";

export class AnimationManager {
  private scene: Phaser.Scene;
  private validationErrors: ValidationError[];
  private sprite: Phaser.GameObjects.Sprite;
  private frameEvents: Map<string, Set<number>> = new Map();

  constructor(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite) {
    this.scene = scene;
    this.sprite = sprite;
    this.validationErrors = [];
  }

  createAnimation<T>(
    spritesheet: string,
    key: string | undefined,
    config: AnimationConfig<T>
  ): void {
    if (!key || this.scene.anims.exists(key)) {
      return;
    }

    const validationError = validateAnimationConfig(
      config,
      this.scene.textures,
      spritesheet
    );
    if (validationError) {
      this.validationErrors.push(validationError);
      return;
    }

    try {
      // Create base animation
      const animConfig: Phaser.Types.Animations.Animation = {
        key,
        frames: this.scene.anims.generateFrameNames(spritesheet, {
          prefix: config.prefix,
          start: config.frames.start,
          end: config.frames.end,
          zeroPad: 4,
        }),
        frameRate: config.frameRate,
        repeat: config.frames.repeat,
      };

      this.scene.anims.create(animConfig);

      // Setup frame events
      if (config.metadata) {
        this.setupFrameEvents(key, config.metadata);
      }
    } catch (error) {
      console.error(`Failed to create animation ${key}:`, error);
    }
  }

  private setupFrameEvents<T>(
    animationKey: string,
    metadata: AnimationMetadata<T>
  ): void {
    // Initialize set of frame numbers for this animation
    const frameNumbers = new Set<number>();

    // Add physics frame if specified
    if (metadata.physicsFrame !== undefined) {
      frameNumbers.add(metadata.physicsFrame);
    }

    // Add custom event frames
    if (metadata.customEvents) {
      metadata.customEvents.forEach((event) => {
        frameNumbers.add(event.frame);
      });
    }

    // Store frame numbers for this animation
    this.frameEvents.set(animationKey, frameNumbers);

    // Setup the frame event listener for this animation
    this.sprite.on(
      "animationupdate",
      (
        animation: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame
      ) => {
        if (animation.key !== animationKey) return;

        const frameEvents = this.frameEvents.get(animationKey);
        if (!frameEvents?.has(frame.index)) return;

        // Emit physics event if this is the physics frame
        if (metadata.physicsFrame === frame.index) {
          this.scene.events.emit(metadata.physicsFrameEvent || "physicsFrame", {
            animationKey,
            frame: frame.index,
          });
        }

        // Emit custom events for this frame
        metadata.customEvents?.forEach((event) => {
          if (event.frame === frame.index) {
            this.scene.events.emit(event.eventName, {
              ...event.data,
              animationKey,
              frame: frame.index,
            });
          }
        });
      }
    );
  }

  setupAnimations<T>(
    spritesheet: string,
    configs: AnimationConfig<T>[],
    onFrameEvent: (eventName: string, data: any) => void
  ): void {
    this.validationErrors = [];

    // Create animations
    configs.forEach((config) => {
      const validationError = validateAnimationConfig(
        config,
        this.scene.textures,
        spritesheet
      );

      if (validationError) {
        this.validationErrors.push(validationError);
      } else {
        this.createAnimation(spritesheet, config.key, config);
      }
    });

    if (this.validationErrors.length > 0) {
      console.warn(
        "Animation configuration validation errors:",
        this.validationErrors
      );
    }

    // Setup global event listeners for the scene
    if (onFrameEvent) {
      const eventNames = new Set<string>();

      configs.forEach((config) => {
        if (config.metadata?.physicsFrameEvent) {
          eventNames.add(config.metadata.physicsFrameEvent);
        }
        config.metadata?.customEvents?.forEach((event) => {
          eventNames.add(event.eventName);
        });
      });

      eventNames.forEach((eventName) => {
        this.scene.events.on(eventName, (data: any) => {
          onFrameEvent(eventName, data);
        });
      });
    }
  }

  setupAnimationCompleteListener(
    onComplete: (animationKey: string) => void
  ): void {
    this.sprite.on(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      (animation: Phaser.Animations.Animation) => {
        onComplete(animation.key);
      }
    );
  }

  playAnimation(
    sprite: Phaser.GameObjects.Sprite,
    animation: string,
    ignoreIfPlaying: boolean = true
  ): void {
    const currentAnim = sprite.anims.currentAnim;
    const isPlaying = currentAnim && sprite.anims.isPlaying;
    const isSameAnimation = currentAnim?.key === animation;

    if (!isPlaying || !isSameAnimation || (isSameAnimation && !isPlaying)) {
      sprite.play(animation, ignoreIfPlaying);
    }
  }

  destroy(): void {
    // Clean up all event listeners
    this.sprite.removeAllListeners();
    this.scene.events.removeAllListeners();
    this.frameEvents.clear();
    this.validationErrors = [];
  }

  getValidationErrors(): ValidationError[] {
    return this.validationErrors;
  }
}
