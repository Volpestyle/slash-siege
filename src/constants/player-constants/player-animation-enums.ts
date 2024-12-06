export enum PlayerJumpTypes {
  Neutral = "neutral",
  Forward = "forward",
  Run = "run",
}

export enum PlayerLandingTypes {
  Heavy = "heavy",
  Light = "light",
  Stationary = "stationary",
}

export enum PlayerAnimations {
  // Ground States
  Idle = "idle",
  RunStart = "runStart",
  RunLoop = "runLoop",
  RunStop = "runStop",
  RunStopSlow = "runStopSlow",
  RunSwitch = "runSwitch",
  WalkStart = "walkStart",
  WalkLoop = "walkLoop",
  WalkStop = "walkStop",

  // Jump States
  JumpNeutralStart = "jumpNeutralStart",
  JumpNeutralFall = "jumpNeutralFall",
  JumpNeutralLand = "jumpNeutralLand",

  // Forward Jump States
  JumpForwardStart = "jumpForwardStart",
  JumpForwardFall = "jumpForwardFall",
  JumpForwardLand = "jumpForwardLand",

  // Run Jump States
  RunJumpStart = "runJumpStart",
  RunJumpFall = "runJumpFall",

  // Run Jump Land States
  RunJumpLandLight = "runJumpLandLight",
  RunJumpLandHeavy = "runJumpLandHeavy",
  RunJumpLandLightContinue = "runJumpLandLightContinue",
  RunJumpLandHeavyContinue = "runJumpLandHeavyContinue",
  RunJumpLandLightStop = "runJumpLandLightStop",
  RunJumpLandHeavyStop = "runJumpLandHeavyStop",
  RunJumpLandBackwardsHeavy = "runJumpLandBackwardsHeavy",
  RunJumpLandBackwardsHeavyContinue = "RunJumpLandBackwardsContinue",
  RunJumpLandBackwardsHeavyStop = "RunJumpLandBackwardsStop",
}
