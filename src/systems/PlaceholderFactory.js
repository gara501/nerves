import { PALETTE, PLAYER } from '../config/constants.js';
import { TILESET } from '../config/tileset.js';

// Genera texturas simples para cualquier asset que no exista.
// Así el juego siempre corre aunque falte un archivo.

const DRAWERS = {
  // Jugador: rectángulo con ojo, anclado en el centro de los pies
  player: (g) => {
    const w = 12, h = 16;
    const x = PLAYER.CENTER_X - w / 2;
    const y = PLAYER.FEET_Y - h;
    g.fillStyle(PALETTE.INK).fillRect(x - 1, y - 1, w + 2, h + 1);
    g.fillStyle(PALETTE.BOT_MID).fillRect(x, y, w, h);
    g.fillStyle(PALETTE.BOT_EYE).fillRect(x + 7, y + 4, 2, 3);
    return [PLAYER.FRAME_W, PLAYER.FRAME_H];
  },

  // Tileset: dibuja cada pieza en la posición que indica config/tileset.js
  [TILESET.key]: (g) => {
    const { x: bx, y: by } = TILESET.terrainBlock;
    g.fillStyle(PALETTE.INK).fillRect(bx, by, 32, 32);
    g.fillStyle(PALETTE.GREEN_LIGHT).fillRect(bx + 1, by + 1, 30, 30);
    g.fillStyle(PALETTE.GREEN).fillRect(bx + 3, by + 3, 26, 26);
    g.fillStyle(PALETTE.NAVY).fillRect(bx + 7, by + 8, 18, 17);

    const [sx, sy] = TILESET.frames.spike;
    g.fillStyle(PALETTE.STEEL_LIGHT).fillTriangle(sx, sy + 16, sx + 4, sy + 8, sx + 8, sy + 16)
      .fillTriangle(sx + 8, sy + 16, sx + 12, sy + 8, sx + 16, sy + 16);

    const [ex, ey, ew, eh] = TILESET.frames.exit;
    g.fillStyle(PALETTE.CYAN, 0.6).fillRect(ex + 6, ey, ew - 12, eh);

    const [px, py, pw, ph] = TILESET.frames.bgPanel;
    g.fillStyle(PALETTE.SLATE).fillRect(px, py, pw, ph);
    return [288, 160];
  },

  // Partícula para efectos
  particle: (g) => {
    g.fillStyle(0xffffff).fillRect(0, 0, 2, 2);
    return [2, 2];
  }
};

export function createPlaceholders(scene) {
  Object.entries(DRAWERS).forEach(([key, draw]) => {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const [w, h] = draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  });
}
