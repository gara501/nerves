import { TILESET } from '../config/tileset.js';
import { GAME, DEPTH } from '../config/constants.js';

// Auto-tile por cuartos (8x8) generado desde el bloque verde del tileset.
// Cada tile de 16x16 se arma con 4 cuartos; cada cuarto mira sus 3 vecinos
// (lateral, vertical, diagonal) y elige: esquina, borde, esquina interior o relleno.

const Q = GAME.TILE / 2;
export const TERRAIN_KEY = 'terrain';

const CASE = { OUTER: 0, HORIZ: 1, VERT: 2, INNER: 3, FILL: 4 };
const CASES = 5;
const QUADS = [
  { dx: 0, dy: 0 }, // arriba-izquierda
  { dx: 1, dy: 0 }, // arriba-derecha
  { dx: 0, dy: 1 }, // abajo-izquierda
  { dx: 1, dy: 1 }  // abajo-derecha
];

// De dónde copiar cada caso dentro del bloque de 32x32
function sourceOffsets(q) {
  const edgeX = q.dx ? 24 : 0;
  const edgeY = q.dy ? 24 : 0;
  const midX = q.dx ? 16 : 8;
  const fill = TILESET.terrainFill;
  return {
    [CASE.OUTER]: [edgeX, edgeY],
    [CASE.HORIZ]: [midX, edgeY],
    [CASE.VERT]: [edgeX, 16],
    [CASE.FILL]: [fill.x + q.dx * Q, fill.y + q.dy * Q]
  };
}

// Genera la textura 'terrain': 20 cuartos de 8x8 en una fila
export function createTerrainTexture(scene) {
  if (scene.textures.exists(TERRAIN_KEY)) return;

  const src = scene.textures.get(TILESET.key).getSourceImage();
  const read = document.createElement('canvas');
  read.width = src.width;
  read.height = src.height;
  const rctx = read.getContext('2d', { willReadFrequently: true });
  rctx.drawImage(src, 0, 0);
  const { x: bx, y: by } = TILESET.terrainBlock;
  const block = rctx.getImageData(bx, by, 32, 32).data;
  const px = (x, y) => block.slice((y * 32 + x) * 4, (y * 32 + x) * 4 + 4);

  const tex = scene.textures.createCanvas(TERRAIN_KEY, QUADS.length * CASES * Q, Q);
  const ctx = tex.getContext();
  const out = ctx.createImageData(QUADS.length * CASES * Q, Q);

  QUADS.forEach((q, qi) => {
    const src = sourceOffsets(q);
    const pick = (c, x, y) => px(src[c][0] + x, src[c][1] + y);

    for (let c = 0; c < CASES; c++) {
      for (let y = 0; y < Q; y++) {
        for (let x = 0; x < Q; x++) {
          let p;
          if (c === CASE.INNER) {
            // Esquina interior: el borde "gira" alrededor del hueco diagonal
            const lx = q.dx ? Q - 1 - x : x;
            const ly = q.dy ? Q - 1 - y : y;
            if (Math.max(lx, ly) >= Q - 1) p = pick(CASE.FILL, x, y);
            else p = lx >= ly ? pick(CASE.VERT, x, y) : pick(CASE.HORIZ, x, y);
          } else {
            p = pick(c, x, y);
          }
          out.data.set(p, (y * out.width + (qi * CASES + c) * Q + x) * 4);
        }
      }
    }
  });

  ctx.putImageData(out, 0, 0);
  tex.refresh();
}

// Frame del cuarto según sus vecinos. solid(c, r) -> bool
function quadFrame(solid, c, r, qi) {
  const q = QUADS[qi];
  const sx = q.dx ? 1 : -1;
  const sy = q.dy ? 1 : -1;
  const h = solid(c + sx, r);
  const v = solid(c, r + sy);
  let k;
  if (!h && !v) k = CASE.OUTER;
  else if (h && !v) k = CASE.HORIZ;
  else if (!h && v) k = CASE.VERT;
  else k = solid(c + sx, r + sy) ? CASE.FILL : CASE.INNER;
  return qi * CASES + k;
}

// Capa de terreno a 8px con colisión
export function buildTerrainLayer(scene, isTerrain, solid, cols, rows) {
  const data = Array.from({ length: rows * 2 }, () => new Array(cols * 2).fill(-1));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!isTerrain(c, r)) continue;
      QUADS.forEach((q, qi) => {
        data[r * 2 + q.dy][c * 2 + q.dx] = quadFrame(solid, c, r, qi);
      });
    }
  }

  const map = scene.make.tilemap({ data, tileWidth: Q, tileHeight: Q });
  const tileset = map.addTilesetImage(TERRAIN_KEY, TERRAIN_KEY, Q, Q, 0, 0);
  const layer = map.createLayer(0, tileset, 0, 0).setDepth(DEPTH.TILES);
  layer.setCollisionByExclusion([-1]);
  return { map, layer };
}

// Textura 16x16 de una celda (para sprites que deben verse como terreno)
export function cellTexture(scene, solid, c, r) {
  const frames = QUADS.map((_, qi) => quadFrame(solid, c, r, qi));
  const key = `cell_${frames.join('_')}`;
  if (scene.textures.exists(key)) return key;

  const terrain = scene.textures.get(TERRAIN_KEY).getSourceImage();
  const tex = scene.textures.createCanvas(key, GAME.TILE, GAME.TILE);
  const ctx = tex.getContext();
  QUADS.forEach((q, qi) => {
    ctx.drawImage(terrain, frames[qi] * Q, 0, Q, Q, q.dx * Q, q.dy * Q, Q, Q);
  });
  tex.refresh();
  return key;
}

// Barra de `n` celdas con bordes en todos los lados (plataformas sueltas)
export function barTexture(scene, n) {
  const key = `bar_${n}`;
  if (scene.textures.exists(key)) return key;

  const inBar = (c, r) => r === 0 && c >= 0 && c < n;
  const tex = scene.textures.createCanvas(key, n * GAME.TILE, GAME.TILE);
  const ctx = tex.getContext();
  for (let c = 0; c < n; c++) {
    const cell = scene.textures.get(cellTexture(scene, inBar, c, 0)).getSourceImage();
    ctx.drawImage(cell, c * GAME.TILE, 0);
  }
  tex.refresh();
  return key;
}

// Plataforma móvil de `n` celdas con moving-platform.png (izquierda, centro, derecha).
// Si el sprite no existe, usa la barra del terreno.
export function platformTexture(scene, n) {
  const src = scene.textures.get('moving_platform');
  if (src.frameTotal < 4) return barTexture(scene, n);
  const key = `platform_${n}`;
  if (scene.textures.exists(key)) return key;

  const T = GAME.TILE;
  const tex = scene.textures.createCanvas(key, n * T, T);
  const ctx = tex.getContext();
  const img = src.getSourceImage();
  for (let c = 0; c < n; c++) {
    const piece = n === 1 ? 1 : c === 0 ? 0 : c === n - 1 ? 2 : 1;
    ctx.drawImage(img, piece * T, 0, T, T, c * T, 0, T, T);
  }
  tex.refresh();
  return key;
}
