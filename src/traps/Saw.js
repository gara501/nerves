import { Trap } from './Trap.js';
import { PathMover } from './PathMover.js';
import { DEPTH, PALETTE } from '../config/constants.js';

// Sierra que recorre un riel visible. 'S' horizontal, 's' vertical.
// El riel muestra todo su recorrido: la trampa es dura pero se puede leer.

const KEY = 'saw';
const SIZE = 16;
const TEETH = 8;

// Textura de 2 frames (dientes desfasados) para simular el giro en pixel art.
// Reemplazable por un PNG propio: ver docs/GUIA_ARTE.md
export function createSawTexture(scene) {
  if (scene.textures.exists(KEY)) return;
  const tex = scene.textures.createCanvas(KEY, SIZE * 2, SIZE);
  const ctx = tex.getContext();
  const img = ctx.createImageData(SIZE * 2, SIZE);
  const hex = (c) => [(c >> 16) & 255, (c >> 8) & 255, c & 255, 255];
  const colors = { ink: hex(PALETTE.INK), mid: hex(PALETTE.STEEL), light: hex(PALETTE.STEEL_LIGHT), red: hex(PALETTE.RED) };

  for (let f = 0; f < 2; f++) {
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const dx = x + 0.5 - SIZE / 2;
        const dy = y + 0.5 - SIZE / 2;
        const r = Math.hypot(dx, dy);
        const a = (Math.atan2(dy, dx) + Math.PI * 2 + (f * Math.PI) / TEETH) % ((Math.PI * 2) / TEETH);
        const tooth = a < Math.PI / TEETH;
        let c = null;
        if (r < 1.6) c = colors.red;                         // eje
        else if (r < 2.6) c = colors.ink;
        else if (r < 5) c = dy < 0 ? colors.light : colors.mid; // disco con luz arriba
        else if (r < 6) c = colors.ink;
        else if (r < 8 && tooth) c = r < 7 ? colors.light : colors.ink; // dientes
        if (c) img.data.set(c, (y * SIZE * 2 + f * SIZE + x) * 4);
      }
    }
    tex.add(f, 0, f * SIZE, 0, SIZE, SIZE);
  }
  ctx.putImageData(img, 0, 0);
  tex.refresh();
}

export class Saw extends Trap {
  static axis = 'x';
  static troll = true;
  static sparks = true;

  constructor(scene, x, y, opts) {
    createSawTexture(scene);
    super(scene, x, y, KEY, 0);
    this.body.moves = true;
    this.body.setCircle(5, 3, 3); // hitbox menor que el dibujo

    const axis = this.constructor.axis;
    const { min, max } = opts.path(axis);
    this.drawRail(axis, min, max);
    this.mover = new PathMover(this, axis, min, max, this.tuning.SAW_SPEED);
    this.spin = 0;
  }

  // Riel oscuro con topes en los extremos
  drawRail(axis, min, max) {
    const g = this.scene.add.graphics().setDepth(DEPTH.PROPS - 1);
    const { x, y } = this;
    const [x1, y1, x2, y2] = axis === 'x' ? [min, y, max, y] : [x, min, x, max];
    g.lineStyle(3, PALETTE.INK).lineBetween(x1, y1, x2, y2);
    g.lineStyle(1, PALETTE.SLATE).lineBetween(x1, y1, x2, y2);
    g.fillStyle(PALETTE.STEEL).fillRect(x1 - 2, y1 - 2, 4, 4).fillRect(x2 - 2, y2 - 2, 4, 4);
  }

  update(delta) {
    this.mover.update();
    this.spin += delta;
    this.setFrame(Math.floor(this.spin / 50) % 2);
  }
}

export class SawVertical extends Saw {
  static axis = 'y';
}
