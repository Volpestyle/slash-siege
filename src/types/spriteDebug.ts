export enum DebugMode {
  None = "none",
  Basic = "basic",
  Enhanced = "enhanced",
}
export interface SpriteDebugConfig {
  showOrigin: boolean;
  showBounds: boolean;
  showAnimation: boolean;
  showVelocity: boolean;
  showName: boolean;
  textColor: string;
  textBackgroundColor: string;
  textOffset: { x: number; y: number };
  originColor: number;
  boundsColor: number;
}

export type ToggleableFeature = {
  [K in keyof SpriteDebugConfig]: SpriteDebugConfig[K] extends boolean
    ? K
    : never;
}[keyof SpriteDebugConfig];

export interface DebugSpriteConfig {
  debugMode?: DebugMode;
  debugConfig?: Partial<SpriteDebugConfig>;
}
