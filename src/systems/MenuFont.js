import * as Phaser from 'phaser';

export const MENU_FONT = 'menu_pixel';

// Fuente original 5×7. Cada bit se dibuja como un píxel opaco, sin fuentes del SO
// ni antialias. La sexta columna y octava fila separan los caracteres.
const GLYPHS = {
  ' ': [0, 0, 0, 0, 0, 0, 0],
  A: [14, 17, 17, 31, 17, 17, 17], B: [30, 17, 17, 30, 17, 17, 30],
  C: [14, 17, 16, 16, 16, 17, 14], D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31], F: [31, 16, 16, 30, 16, 16, 16],
  G: [14, 17, 16, 23, 17, 17, 15], H: [17, 17, 17, 31, 17, 17, 17],
  I: [14, 4, 4, 4, 4, 4, 14], J: [7, 2, 2, 2, 18, 18, 12],
  K: [17, 18, 20, 24, 20, 18, 17], L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17], N: [17, 25, 21, 19, 17, 17, 17],
  O: [14, 17, 17, 17, 17, 17, 14], P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13], R: [30, 17, 17, 30, 20, 18, 17],
  S: [15, 16, 16, 14, 1, 1, 30], T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14], V: [17, 17, 17, 17, 17, 10, 4],
  W: [17, 17, 17, 21, 21, 21, 10], X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4], Z: [31, 1, 2, 4, 8, 16, 31],
  '0': [14, 17, 19, 21, 25, 17, 14], '1': [4, 12, 4, 4, 4, 4, 14],
  '2': [14, 17, 1, 2, 4, 8, 31], '3': [30, 1, 1, 14, 1, 1, 30],
  '4': [2, 6, 10, 18, 31, 2, 2], '5': [31, 16, 16, 30, 1, 1, 30],
  '6': [14, 16, 16, 30, 17, 17, 14], '7': [31, 1, 2, 4, 8, 8, 8],
  '8': [14, 17, 17, 14, 17, 17, 14], '9': [14, 17, 17, 15, 1, 1, 14],
  '!': [4, 4, 4, 4, 4, 0, 4], '?': [14, 17, 1, 2, 4, 0, 4],
  '/': [1, 1, 2, 4, 8, 16, 16], '-': [0, 0, 0, 31, 0, 0, 0],
  '.': [0, 0, 0, 0, 0, 0, 4], ':': [0, 4, 0, 0, 4, 0, 0],
  '>': [16, 8, 4, 2, 4, 8, 16], '·': [0, 0, 0, 4, 0, 0, 0],
  '↑': [4, 14, 21, 4, 4, 4, 4], '↓': [4, 4, 4, 4, 21, 14, 4],
  '↗': [31, 3, 5, 9, 17, 16, 0]
};

export function createMenuFont(scene) {
  if (scene.cache.bitmapFont.exists(MENU_FONT)) return;
  const chars = Object.keys(GLYPHS).join('');
  const texture = scene.textures.createCanvas(MENU_FONT, chars.length * 6, 8);
  const ctx = texture.getContext();
  ctx.fillStyle = '#ffffff';
  [...chars].forEach((char, i) => {
    GLYPHS[char].forEach((row, y) => {
      for (let x = 0; x < 5; x++) {
        if (row & (1 << (4 - x))) ctx.fillRect(i * 6 + x, y, 1, 1);
      }
    });
  });
  texture.refresh();
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  scene.cache.bitmapFont.add(MENU_FONT, Phaser.GameObjects.RetroFont.Parse(scene, {
    image: MENU_FONT, width: 6, height: 8, chars, charsPerRow: chars.length
  }));
}

export function menuText(scene, x, y, value, size, color) {
  const scale = size >= 40 ? 5 : size >= 14 ? 2 : 1;
  return scene.add.bitmapText(Math.round(x), Math.round(y), MENU_FONT, value.toUpperCase(), 6)
    .setScale(scale).setTint(Phaser.Display.Color.HexStringToColor(color).color);
}
