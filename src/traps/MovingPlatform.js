import { Trap } from './Trap.js';
import { PathMover } from './PathMover.js';

// Plataforma móvil. Varias celdas seguidas forman una sola plataforma.
// '-' se mueve en horizontal, 'I' en vertical. Lleva al jugador encima.
export class MovingPlatform extends Trap {
  static collides = true;
  static group = true; // celdas iguales seguidas = un objeto
  static axis = 'x';

  constructor(scene, x, y, opts) {
    super(scene, x, y, opts.platformTexture());
    // Solo la losa de arriba es sólida; las patas del sprite son decoración
    if (scene.textures.get('moving_platform').frameTotal >= 4) this.body.setSize(this.width, 9).setOffset(0, 0);
    this.body.moves = true;
    this.body.setFriction(0, 0); // el arrastre lo hace el jugador (Player.updateCarry)
    this.isPlatform = true;

    const axis = this.constructor.axis;
    const { min, max } = opts.path(axis);
    this.mover = new PathMover(this, axis, min, max, this.tuning.PLATFORM_SPEED);
  }

  // Sólida y no mata
  onPlayerTouch() {}

  update() {
    this.mover.update();
  }
}

export class VerticalPlatform extends MovingPlatform {
  static axis = 'y';
}
