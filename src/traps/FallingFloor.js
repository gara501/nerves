import { Trap } from './Trap.js';


// Piso idéntico al terreno: al pisarlo tiembla y se cae.
export class FallingFloor extends Trap {
  static collides = true;

  constructor(scene, x, y, opts) {
    super(scene, x, y, opts.terrainTexture());
    this.baseX = x;
    this.triggered = false;
    this.falling = false;
  }

  // No mata: se activa al pararse encima
  onPlayerTouch(player) {
    if (this.triggered) return;
    if (player.body.bottom > this.body.top + 1) return; // solo desde arriba
    this.triggered = true;

    // Temblor y luego caída
    this.shake = this.scene.tweens.add({
      targets: this,
      x: { from: this.baseX - this.tuning.FALLING_FLOOR_SHAKE, to: this.baseX + this.tuning.FALLING_FLOOR_SHAKE },
      duration: 40,
      yoyo: true,
      repeat: -1
    });
    this.scene.time.delayedCall(this.tuning.FALLING_FLOOR_DELAY_MS, () => this.fall());
  }

  fall() {
    this.shake?.stop();
    this.x = this.baseX;
    this.falling = true;
    this.body.checkCollision.none = true;
    this.body.moves = true;
    this.body.setAllowGravity(true);
  }

  update() {
    // Sale del mundo: se desactiva
    if (this.falling && this.y > this.scene.physics.world.bounds.bottom) {
      this.falling = false;
      this.body.enable = false;
      this.setVisible(false);
    }
  }
}
