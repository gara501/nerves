import * as Phaser from 'phaser';
import { GAME, TRANSITION } from '../config/constants.js';
import { playSfx } from '../systems/AudioManager.js';

const KEY = 'iris';
const W = GAME.WIDTH;
const H = GAME.HEIGHT;

// Transición "iris": la pantalla se cierra en un círculo negro y luego se abre.
// Escena siempre activa, por encima de todas las demás.
export class TransitionScene extends Phaser.Scene {
  constructor() {
    super('Transition');
  }

  create() {
    this.tex = this.textures.exists(KEY) ? this.textures.get(KEY) : this.textures.createCanvas(KEY, W, H);
    this.ctx = this.tex.getContext();
    this.add.image(0, 0, KEY).setOrigin(0);

    this.radius = this.maxRadius(W / 2, H / 2);
    this.center = { x: W / 2, y: H / 2 };
    this.draw();
  }

  // Radio que cubre toda la pantalla desde (x, y)
  maxRadius(x, y) {
    return Math.ceil(Math.hypot(Math.max(x, W - x), Math.max(y, H - y))) + 1;
  }

  // Negro con un hueco circular. Fila por fila: borde en píxeles duros.
  draw() {
    const { ctx } = this;
    const { x: cx, y: cy } = this.center;
    const r = Math.max(0, this.radius);
    ctx.clearRect(0, 0, W, H);

    if (r < this.maxRadius(cx, cy)) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      for (let y = Math.max(0, Math.floor(cy - r)); y < Math.min(H, Math.ceil(cy + r)); y++) {
        const dy = y + 0.5 - cy;
        const dx = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy)));
        if (dx > 0) ctx.clearRect(Math.round(cx) - dx, y, dx * 2, 1);
      }
    }
    this.tex.refresh();
  }

  // Anima el radio hacia `to`. Devuelve una promesa al terminar.
  animate(to, duration, ease) {
    this.tweens.killTweensOf(this);
    return new Promise((resolve) => {
      this.tweens.add({
        targets: this,
        radius: to,
        duration,
        ease,
        onUpdate: () => this.draw(),
        onComplete: () => {
          this.draw();
          resolve();
        }
      });
    });
  }

  // Cierra el círculo sobre (x, y) en coordenadas de pantalla
  async close(x, y) {
    this.center = { x, y };
    this.radius = this.maxRadius(x, y);
    playSfx(this, 'levelClose');
    await this.animate(0, TRANSITION.CLOSE_MS, 'Cubic.easeIn');
    await this.wait(TRANSITION.HOLD_MS);
  }

  // Abre el círculo desde (x, y)
  async open(x, y) {
    this.center = { x, y };
    this.radius = 0;
    this.draw();
    playSfx(this, 'levelOpen');
    await this.animate(this.maxRadius(x, y), TRANSITION.OPEN_MS, 'Cubic.easeOut');
  }

  // Deja la pantalla en negro (antes del primer nivel)
  cover() {
    this.tweens.killTweensOf(this);
    this.radius = 0;
    this.draw();
  }

  wait(ms) {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve));
  }
}
