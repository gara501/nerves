import { Spike } from './Spike.js';
import { GAME, DEPTH } from '../config/constants.js';

// Pincho escondido: sale cuando el jugador se acerca.
// Con pop-spikes.png: animación de 4 frames sobre el suelo (vacío -> completo).
// Sin el sprite: el pincho del tileset sube desde dentro del suelo.
export class PopSpike extends Spike {
  static troll = true;

  constructor(scene, x, y) {
    super(scene, x, y);
    this.restY = y;
    this.popped = false;
    this.animated = scene.anims.exists('pop_spikes');

    if (this.animated) {
      this.setTexture('pop_spikes', 0); // frame 0 = vacío
      this.body.setSize(12, 9).setOffset(2, 7); // la punta del medio no mata
    } else {
      this.y = y + GAME.TILE; // escondido dentro del suelo
      this.setDepth(DEPTH.HIDDEN);
    }
    this.body.enable = false;
  }

  update(delta, player) {
    if (this.popped || !player.alive) return;
    const dx = Math.abs(player.x - this.x);
    const dy = Math.abs(player.y - (this.restY + GAME.TILE / 2));
    if (dx < this.tuning.POP_SPIKE_RANGE_X && dy < this.tuning.POP_SPIKE_RANGE_Y) this.pop();
  }

  pop() {
    this.popped = true;
    const time = this.tuning.POP_SPIKE_TIME_MS;

    if (this.animated) {
      // Mata desde el frame 2 (pinchos medianos), nunca antes de que se vean
      this.on('animationupdate', (anim, frame) => {
        if (Number(frame.textureFrame) >= 2) this.body.enable = true;
      });
      this.once('animationcomplete', () => (this.body.enable = true));
      this.play({ key: 'pop_spikes', duration: time });
      return;
    }
    this.body.enable = true;
    this.scene.tweens.add({ targets: this, y: this.restY, duration: time, ease: 'Cubic.easeOut' });
  }
}
