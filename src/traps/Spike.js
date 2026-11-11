import { Trap } from './Trap.js';
import { TILESET } from '../config/tileset.js';

// Pincho visible. Hitbox baja y estrecha: las puntas no matan, el cuerpo sí.
export class Spike extends Trap {
  static sparks = true;

  constructor(scene, x, y) {
    super(scene, x, y, TILESET.key, 'spike');
    this.body.setSize(12, 5).setOffset(2, 11);
  }
}
