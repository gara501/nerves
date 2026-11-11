import { Trap } from './Trap.js';
import { PathMover } from './PathMover.js';

// Plataforma móvil. Varias celdas seguidas forman una sola plataforma.
// '-' se mueve en horizontal, 'I' en vertical. Lleva al jugador encima.
export class MovingPlatform extends Trap {
  static collides = true;
  static group = true; // celdas iguales seguidas = un objeto
  static axis = 'x';
  static deathKind = 'crush';

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

  // Sólida; solo mata si te aplasta (ver update)
  onPlayerTouch() {}

  update(delta, player) {
    this.mover.update();
    if (player.alive && this.crushes(player)) this.scene.killPlayer(this);
  }

  // Bajando sobre el jugador: si su cabeza queda bajo la plataforma, lo aplasta
  crushes(player) {
    if (this.mover.axis !== 'y' || this.mover.dir < 0) return false;
    const p = this.body;
    const b = player.body;
    return b.right > p.left + 2 && b.left < p.right - 2 && b.top < p.bottom && b.top > p.top + 2;
  }
}

// Vertical: sólida solo desde arriba (se atraviesa desde abajo y de lado).
// Así nada puede trabarla; si baja sobre el jugador, lo aplasta.
export class VerticalPlatform extends MovingPlatform {
  static axis = 'y';

  constructor(scene, x, y, opts) {
    super(scene, x, y, opts);
    const c = this.body.checkCollision;
    c.down = c.left = c.right = false;
  }
}
