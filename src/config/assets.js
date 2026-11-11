// Manifiesto de assets. Si un archivo no existe, se usa un placeholder generado.
// Rutas relativas a /public.
import { PLAYER } from './constants.js';
import { TILESET } from './tileset.js';

export const ASSETS = {
  spritesheets: [
    { key: 'player', path: 'assets/sprites/player/player.png', frameWidth: PLAYER.FRAME_W, frameHeight: PLAYER.FRAME_H },
    // Robot quemándose (láser): 6 frames con el mismo encuadre que player.png
    { key: 'player_ash', path: 'assets/sprites/player/player-ash.png', frameWidth: PLAYER.FRAME_W, frameHeight: PLAYER.FRAME_H },
    // Trampas. Si falta alguna, se usa un reemplazo dibujado por código.
    { key: 'saw', path: 'assets/traps/saw.png', frameWidth: 16, frameHeight: 16 },               // 2 frames de giro
    { key: 'pop_spikes', path: 'assets/traps/pop-spikes.png', frameWidth: 16, frameHeight: 16 },  // oculto -> completo
    { key: 'moving_platform', path: 'assets/traps/moving-platform.png', frameWidth: 16, frameHeight: 16 } // izq, centro, der
  ],
  images: [
    { key: 'aramdev_logo', path: 'assets/branding/aramdev-logo.png' },
    { key: TILESET.key, path: 'assets/tilesets/tileset.png' }
  ]
  // El audio se configura en config/audio.js
};
