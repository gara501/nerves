import { Trap } from './Trap.js';
import { TILESET } from '../config/tileset.js';
import { GAME } from '../config/constants.js';
import { playSfxAt } from '../systems/AudioManager.js';

// Láser vertical por ciclos: apagado -> aviso (línea fina) -> carga -> encendido.
// Solo mata encendido. El ciclo arranca igual en cada reinicio: se puede aprender.
// Se coloca en la celda superior; el haz baja hasta el primer bloque sólido.

const L = TILESET.laser;
const STATE = { OFF: 0, WARN: 1, CHARGE: 2, ON: 3 };


// Textura del láser para una altura dada: 4 frames (uno por estado)
function laserTexture(scene, height) {
  const key = `laser_${height}`;
  if (scene.textures.exists(key)) return key;

  const src = scene.textures.get(TILESET.key).getSourceImage();
  const tex = scene.textures.createCanvas(key, L.w * L.states, height);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  const beamSrcH = L.h - L.cap * 2;
  const beamH = height - L.cap * 2;

  for (let s = 0; s < L.states; s++) {
    const sx = L.x + s * L.w;
    const dx = s * L.w;
    ctx.drawImage(src, sx, L.y, L.w, L.cap, dx, 0, L.w, L.cap); // emisor superior
    ctx.drawImage(src, sx, L.y + L.cap, L.w, beamSrcH, dx, L.cap, L.w, beamH); // haz estirado
    ctx.drawImage(src, sx, L.y + L.h - L.cap, L.w, L.cap, dx, height - L.cap, L.w, L.cap); // emisor inferior
    tex.add(s, 0, dx, 0, L.w, height);
  }
  tex.refresh();
  return key;
}

export class Laser extends Trap {
  static phase = 0; // desfase inicial (0..1 del ciclo)
  static deathKind = 'burn'; // el robot queda en cenizas

  constructor(scene, x, y, opts) {
    const height = opts.cellsDown() * GAME.TILE;
    super(scene, x, y - GAME.TILE / 2, laserTexture(scene, height), STATE.OFF);
    this.setOrigin(0.5, 0);

    // Hitbox más fina que el haz
    const w = this.tuning.LASER_HITBOX_W;
    this.body.setSize(w, height - L.cap * 2).setOffset((L.w - w) / 2, L.cap);

    this.phaseState = null; // (GameObject ya usa "state")
    // Fases del ciclo en orden: [estado, duración] (según el nivel)
    const t = this.tuning;
    this.cycle = [
      [STATE.OFF, t.LASER_OFF_MS],
      [STATE.WARN, t.LASER_WARN_MS],
      [STATE.CHARGE, t.LASER_CHARGE_MS],
      [STATE.ON, t.LASER_ON_MS]
    ];
    this.cycleMs = this.cycle.reduce((sum, [, ms]) => sum + ms, 0);
    this.elapsed = this.constructor.phase * this.cycleMs;
    this.applyState();
  }

  update(delta) {
    this.elapsed = (this.elapsed + delta) % this.cycleMs;
    this.applyState();
  }

  applyState() {
    let t = this.elapsed;
    let state = STATE.OFF;
    for (const [s, ms] of this.cycle) {
      if (t < ms) { state = s; break; }
      t -= ms;
    }
    if (state === this.phaseState) return;
    this.phaseState = state;
    this.setFrame(state, false, false); // sin tocar tamaño ni origen
    this.body.enable = state === STATE.ON;
    if (state === STATE.ON) playSfxAt(this.scene, 'laser', this.x, this.y + this.height / 2);
  }
}

// Variante desfasada medio ciclo: alterna con el láser normal
export class LaserAlt extends Laser {
  static phase = 0.5;
}
