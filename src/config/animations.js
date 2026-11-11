// Animaciones del jugador (player.png: 8 columnas x 2 filas de 32x32).
// Fila 1 = frames 0-7, fila 2 = frames 8-15.
// Solo se crean si el spritesheet real existe (no con el placeholder).

export const PLAYER_ANIMS = [
  { key: 'player_idle', frames: { start: 0, end: 4 }, frameRate: 6, repeat: -1 },
  { key: 'player_run', frames: { start: 8, end: 15 }, frameRate: 16, repeat: -1 },
  { key: 'player_jump', frames: { start: 11, end: 11 }, frameRate: 1, repeat: 0 },
  { key: 'player_fall', frames: { start: 15, end: 15 }, frameRate: 1, repeat: 0 }
];
