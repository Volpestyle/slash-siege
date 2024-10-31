export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  preload(): void {
    // Load assets here
    this.load.setBaseURL("http://labs.phaser.io");
    this.load.image("sky", "assets/skies/space3.png");
    this.load.image("logo", "assets/sprites/phaser3-logo.png");
    this.load.image("red", "assets/particles/red.png");
  }

  create(): void {
    this.add.image(400, 300, "sky");

    const logo = this.add.image(400, 100, "logo");

    // Add some simple animation
    this.tweens.add({
      targets: logo,
      y: 450,
      duration: 2000,
      ease: "Power2",
      yoyo: true,
      repeat: -1,
    });
  }
}
