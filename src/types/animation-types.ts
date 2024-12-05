export interface AnimationConfig<T = void> {
  prefix: string;
  frames: {
    start: number;
    end: number;
    repeat?: number;
  };
  frameRate: number;
  metadata: AnimationMetadata<T>;
  key?: string;
}

export interface AnimationFrameData {
  start: number;
  end: number;
  repeat?: number;
}

// A generic interface that can handle different types of animation-specific metadata
export interface AnimationMetadata<T = void> {
  category: string | string[];
  canInterrupt?: boolean;
  key?: string;
  nextAnimation?: string | ((state: any) => string);
  physicsFrame?: number;
  physicsFrameEvent?: string;
  customEvents?: AnimationFrameEvent[];
  speedThreshold?: number;
  typeSpecificData?: T;
}

export interface AnimationFrameEvent {
  frame: number;
  eventName: string;
  data?: any;
}
