// Mapa del tileset (assets/tilesets/tileset.png, tiles de 16x16).
// Coordenadas en píxeles: [x, y, ancho, alto].

export const TILESET = {
  key: 'tiles',

  // Bloque verde 32x32 del que se genera el auto-tile del terreno
  terrainBlock: { x: 48, y: 16 },
  // Zona interior (16x16) que se repite como relleno
  terrainFill: { x: 8, y: 9 }, // relativo al bloque

  // Láser vertical: 4 estados en columnas (apagado, aviso, carga, encendido)
  // cap = alto de cada emisor; el haz del medio se estira a la altura necesaria
  laser: { x: 192, y: 80, w: 16, h: 48, states: 4, cap: 4 },

  // Piezas que se usan como sprites
  frames: {
    spike: [192, 48, 16, 16],
    crusher: [144, 16, 16, 16],
    exit: [192, 16, 32, 28],
    bgPanel: [0, 64, 32, 32]
  }
};
