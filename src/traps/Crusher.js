import { Trap } from './Trap.js';
import { TILESET } from '../config/tileset.js';
import { GAME, FX } from '../config/constants.js';
import { playSfxAt } from '../systems/AudioManager.js';

// Aplastador: bloque con ojos que cae cuando pasas debajo.
// Espera -> tiembla -> cae -> golpea -> sube despacio -> vuelve a esperar.
// Es sólido: quieto o subiendo puedes pararte encima. Solo mata mientras cae.

const MODE = { IDLE: 0, SHAKE: 1, FALL: 2, LANDED: 3, RISE: 4 };

export class Crusher extends Trap {
  static collides = true;
  static troll = true; // muerte con risa
  static deathKind = 'crush';

  constructor(scene, x, y, opts) {
    super(scene, x, y, TILESET.key, 'crusher');
    this.homeX = x;
    this.homeY = y;
    this.floorY = y + (opts.cellsDown() - 1) * GAME.TILE; // se detiene sobre el primer sólido
    this.mode = MODE.IDLE;
    this.timer = 0;
    this.vy = 0;
  }

  // Sólido: tocarlo no mata (la muerte se revisa al caer)
  onPlayerTouch() {}

  update(delta, player) {
    const dt = delta / 1000;

    switch (this.mode) {
      case MODE.IDLE:
        if (player.alive && this.playerBelow(player)) this.setMode(MODE.SHAKE, this.tuning.CRUSHER_SHAKE_MS);
        break;

      case MODE.SHAKE:
        this.x = this.homeX + (Math.floor(this.timer / 30) % 2 ? 1 : -1);
        if (this.tick(delta)) {
          this.x = this.homeX;
          this.vy = 0;
          this.body.checkCollision.none = true; // no empuja al jugador mientras cae
          this.setMode(MODE.FALL);
        }
        break;

      case MODE.FALL:
        this.vy = Math.min(this.vy + this.tuning.CRUSHER_GRAVITY * dt, this.tuning.CRUSHER_MAX_SPEED);
        this.y = Math.min(this.y + this.vy * dt, this.floorY);
        if (player.alive && this.hits(player)) this.scene.killPlayer(this);
        if (this.y >= this.floorY) this.land();
        break;

      case MODE.LANDED:
        if (this.tick(delta)) this.setMode(MODE.RISE);
        break;

      case MODE.RISE:
        this.y = Math.max(this.y - this.tuning.CRUSHER_RISE_SPEED * dt, this.homeY);
        if (this.y <= this.homeY) this.setMode(MODE.IDLE);
        break;
    }
  }

  land() {
    this.body.checkCollision.none = false;
    this.setMode(MODE.LANDED, this.tuning.CRUSHER_REST_MS);
    playSfxAt(this.scene, 'crush', this.x, this.y);
    this.scene.shake.start(FX.CRUSH_SHAKE_PX, FX.CRUSH_SHAKE_FRAMES);
  }

  // Jugador debajo, en la misma columna y antes del suelo
  playerBelow(player) {
    return (
      Math.abs(player.x - this.x) < this.tuning.CRUSHER_RANGE_X &&
      player.y > this.y &&
      player.y <= this.floorY + GAME.TILE / 2
    );
  }

  // Choque entre el bloque y la hitbox del jugador
  hits(player) {
    const b = player.body;
    const half = GAME.TILE / 2;
    return (
      b.right > this.x - half + 1 &&
      b.left < this.x + half - 1 &&
      b.bottom > this.y - half &&
      b.top < this.y + half
    );
  }

  setMode(mode, timer = 0) {
    this.mode = mode;
    this.timer = timer;
  }

  // Descuenta el timer; true cuando llega a 0
  tick(delta) {
    this.timer -= delta;
    return this.timer <= 0;
  }
}
