import { GAME, PLAYER, PALETTE, DEPTH } from '../config/constants.js';

const T = GAME.TILE;

// Zona donde la pantalla avanza sola.
// Config del nivel: autoscroll: { from: col, to: col, speed: px/s }
//  - Empieza cuando el jugador pasa la columna `from`.
//  - Termina cuando el borde derecho de la pantalla llega a la columna `to`.
//  - Quedarse atrás (salir por la izquierda) mata. No se puede adelantar a la pantalla.
export class AutoScroll {
  constructor(scene, { from, to, speed }) {
    this.scene = scene;
    this.from = from * T;
    this.to = to * T;
    this.speed = speed;
    this.active = false;
    this.done = false;

    // Aviso: franja roja en el borde izquierdo mientras la pantalla avanza
    this.edge = scene.add.rectangle(0, 0, 3, GAME.HEIGHT, PALETTE.RED)
      .setOrigin(0).setScrollFactor(0).setDepth(DEPTH.FX).setVisible(false);
  }

  update(delta) {
    const { scene } = this;
    const cam = scene.cameras.main;
    const player = scene.player;

    if (!this.active && !this.done && player.x >= this.from) this.start(cam);
    if (!this.active) return;

    cam.scrollX += (this.speed * delta) / 1000;
    this.edge.setAlpha(0.5 + 0.4 * Math.sin(scene.time.now / 90));

    if (cam.scrollX + GAME.WIDTH >= this.to) return this.stop(cam);
    if (!player.alive) return;

    const left = cam.scrollX;
    const right = cam.scrollX + GAME.WIDTH;
    // Atrás: la mitad del cuerpo fuera de la pantalla = muerte
    if (player.x < left) return scene.killPlayer();
    // Adelante: la pantalla hace de pared
    if (player.body.right > right) {
      player.body.x = right - player.body.width; // se mueve el cuerpo; el sprite lo sigue
      player.body.setVelocityX(Math.min(0, player.body.velocity.x));
    }
  }

  start(cam) {
    this.active = true;
    cam.stopFollow();
    cam.scrollX = cam.worldView.x; // parte desde lo que se ve ahora
    this.edge.setVisible(true);
  }

  stop(cam) {
    this.active = false;
    this.done = true;
    this.edge.setVisible(false);
    // startFollow salta al jugador: se restaura el scroll para que la cámara lo alcance suave
    const { scrollX, scrollY } = cam;
    cam.startFollow(this.scene.player, true, 0.08, 0.08, 0, PLAYER.FRAME_H / 2);
    cam.setScroll(scrollX, scrollY);
  }
}
