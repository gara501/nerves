import * as Phaser from 'phaser';

// Inicializa estado global y pasa a la carga
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.registry.set('deaths', 0);
    this.registry.set('levelName', '');
    this.scene.launch('Transition'); // overlay siempre activo
    this.scene.start('Preload');
  }
}
