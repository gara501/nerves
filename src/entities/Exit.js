import * as Phaser from 'phaser';
import { DEPTH } from '../config/constants.js';
import { TILESET } from '../config/tileset.js';

// Salida: teletransportador (haz de luz del tileset)
export class Exit extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, TILESET.key, 'exit');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(DEPTH.PROPS);
    this.body.setAllowGravity(false);
    this.body.moves = false;
    this.body.setSize(10, 16).setOffset((this.width - 10) / 2, this.height - 16); // hay que entrar al haz

    // Pulso suave para que se lea como interactivo
    scene.tweens.add({ targets: this, alpha: 0.85, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}
