// Sonidos del juego. Cambia aquí qué archivo suena en cada evento y su volumen.
// Rutas relativas a /public.

const SFX_DIR = 'assets/audio/sfx/';
const MUSIC_DIR = 'assets/audio/music/';

export const AUDIO = {
  MUSIC_VOLUME: 0.35,
  SFX_VOLUME: 0.8,
  MUSIC_FADE_MS: 600,
  POSITIONAL_RANGE: 320  // px: más lejos de la cámara no se escucha
};

// Evento -> archivo y volumen relativo (0..1)
export const SFX = {
  jump: { path: SFX_DIR + 'jump.mp3', volume: 0.6 },
  die: { path: SFX_DIR + 'die.mp3', volume: 0.9 },
  laugh: { path: SFX_DIR + 'laugh.mp3', volume: 0.8 },       // muerte por trampa oculta
  step: { path: SFX_DIR + 'step.wav', volume: 1.0 },
  step2: { path: SFX_DIR + 'step2.wav', volume: 0.45 },
  laser: { path: SFX_DIR + 'laser.wav', volume: 0.5 },       // láser se enciende
  crush: { path: SFX_DIR + 'shoot.wav', volume: 0.45 },      // aplastador golpea
  levelClose: { path: SFX_DIR + 'level_close.wav', volume: 0.9 },
  levelOpen: { path: SFX_DIR + 'level_open.wav', volume: 0.9 }
  // Disponibles: zerrap.wav, incomming.wav, menu.wav
};

// Pistas de música. Cada nivel elige una con `music: 'nombre'`.
// Solo se cargan las que usa algún nivel.
// OGG primero (liviano); WAV de respaldo para navegadores sin OGG.
const track = (name) => [`${MUSIC_DIR}${name}.ogg`, `${MUSIC_DIR}${name}.wav`];

export const MUSIC = Object.fromEntries(
  [
    'coolsong1', 'coolsong2', 'coolsong3', 'coolsong4', 'coolsong5', 'coolsong6',
    'coolsong7', 'coolsong8', 'coolsong9', 'coolsong10', 'coolsong11', 'coolsong12',
    'coolsong13', 'coolsong14', 'coolsong15', 'coolsong16', 'coolsong17', 'coolsong18',
    'coolsong19', 'coolsong20', 'coolsong21', 'coolsong22'
  ].map((name) => [name, track(name)])
);
