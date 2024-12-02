// src/game.ts
import "phaser";
import { MainScene } from "./scenes/MainScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
    },
  },
  scene: MainScene,
};

// Create game instance
const game = new Phaser.Game(config);

// Add resize listener to update game size when window is resized
window.addEventListener("resize", () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});
