export interface AnimationFrameData {
  START: number;
  END: number;
  REPEAT?: number;
}

export type AnimationConfig = {
  key: string;
  prefix: string;
  start: number;
  end: number;
  frameRate: number;
  repeat: number;
};
