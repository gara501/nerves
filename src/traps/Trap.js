import * as Phaser from 'phaser';
import { DEPTH } from '../config/constants.js';

// Base de todas las trampas.
// collides = false -> overlap (daña al tocar). true -> sólido (piso falso, etc.)
export class Trap extends Phaser.Physics.Arcade.Sprite {
  static collides = false;
  static troll = false; // true: trampa oculta, la muerte se celebra con risa
  static deathKind = 'cut'; // efecto de muerte: cut | crush | burn (ver systems/DeathFx.js)
  static sparks = false;    // estrella de impacto en el punto de contacto

  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.TRAPS);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.moves = false; // la posición la controla el sprite (tweens)
  }

  // Tiempos de trampas del nivel actual (TRAPS + ajustes del nivel)
  get tuning() {
    return this.scene.tuning;
  }

  // Por defecto: tocarla mata
  onPlayerTouch(player) {
    this.scene.killPlayer(this);
  }

  // Lógica por frame (sensores, timers)
  update(delta, player) {}
}
