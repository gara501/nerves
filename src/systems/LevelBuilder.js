import { GAME } from '../config/constants.js';
import { TRAP_TYPES } from '../traps/index.js';
import { Exit } from '../entities/Exit.js';
import { buildTerrainLayer, cellTexture, platformTexture } from './TerrainBuilder.js';

const T = GAME.TILE;
const TERRAIN = '#';
const LOOKS_SOLID = new Set(['#', 'F']); // lo que el auto-tile considera "terreno"
const STOP = ':'; // tope invisible para recorridos de plataformas y sierras

// Convierte un nivel ASCII en terreno + objetos.
export function buildLevel(scene, level) {
  const rows = normalize(level.map);
  const height = rows.length;
  const width = rows[0].length;

  const charAt = (c, r) => rows[r]?.[c];
  // Fuera del mapa cuenta como sólido: no se dibujan bordes en los límites
  const looksSolid = (c, r) => {
    const ch = charAt(c, r);
    return ch === undefined || LOOKS_SOLID.has(ch);
  };

  // Celdas libres desde (c, r) hacia abajo hasta el primer bloque sólido
  const cellsDown = (c, r) => {
    let n = 1;
    while (r + n < height && charAt(c, r + n) !== TERRAIN) n++;
    return n;
  };

  // Bloquea un recorrido: sólido, tope ':' o fuera del mapa
  const blocks = (c, r) => {
    const ch = charAt(c, r);
    return ch === undefined || LOOKS_SOLID.has(ch) || ch === STOP;
  };

  // Límites del centro de un objeto de `run` celdas (desde c0, fila r) al moverse en `axis`
  const pathRange = (c0, r, run, axis) => {
    const w = run * T;
    if (axis === 'x') {
      let a = c0 - 1;
      while (!blocks(a, r)) a--;
      let b = c0 + run;
      while (!blocks(b, r)) b++;
      return { min: (a + 1) * T + w / 2, max: b * T - w / 2 };
    }
    const cols = Array.from({ length: run }, (_, i) => c0 + i);
    let a = r - 1;
    while (!cols.some((c) => blocks(c, a))) a--;
    let b = r + 1;
    while (!cols.some((c) => blocks(c, b))) b++;
    return { min: (a + 1) * T + T / 2, max: b * T - T / 2 };
  };

  // 1. Terreno
  const { map, layer } = buildTerrainLayer(scene, (c, r) => charAt(c, r) === TERRAIN, looksSolid, width, height);

  // 2. Objetos: inicio, salida y trampas
  const hazards = scene.add.group();
  const solids = scene.add.group();
  const traps = [];
  let spawn = { x: T * 2, y: T * 2 };
  let exit = null;

  rows.forEach((row, r) => {
    [...row].forEach((ch, c) => {
      const cx = c * T + T / 2;
      const cy = r * T + T / 2;
      const bottom = (r + 1) * T;

      if (ch === 'P') spawn = { x: cx, y: bottom };
      else if (ch === 'E') exit = new Exit(scene, cx, bottom);
      else if (TRAP_TYPES[ch]) {
        const Type = TRAP_TYPES[ch];
        // Tipos agrupables: celdas iguales seguidas forman un solo objeto
        if (Type.group && row[c - 1] === ch) return;
        let run = 1;
        if (Type.group) while (row[c + run] === ch) run++;

        // Datos del entorno que una trampa puede necesitar
        const opts = {
          run,
          terrainTexture: () => cellTexture(scene, looksSolid, c, r),
          platformTexture: () => platformTexture(scene, run),
          cellsDown: () => cellsDown(c, r),
          path: (axis) => pathRange(c, r, run, axis)
        };
        const trap = new Type(scene, c * T + (run * T) / 2, cy, opts);
        (Type.collides ? solids : hazards).add(trap);
        traps.push(trap);
      }
    });
  });

  return { map, layer, spawn, exit, hazards, solids, traps, width: width * T, height: height * T };
}

// Iguala el largo de las filas (rellena con vacío)
function normalize(map) {
  const w = Math.max(...map.map((r) => r.length));
  return map.map((r) => r.padEnd(w, '.'));
}
