import { AUDIO, SFX, MUSIC } from '../config/audio.js';

// Reproducción de SFX y música.
// El SoundManager de Phaser es global: la música sigue sonando al reiniciar un nivel.

const sfxKey = (name) => `sfx_${name}`;
const musicKey = (name) => `music_${name}`;

let currentMusic = null; // { name, sound }

// Los fundidos corren en la escena de transición, que nunca se reinicia
const tweens = (scene) => scene.scene.get('Transition').tweens;

// Carga los SFX y solo la música que usan los niveles
export function loadAudio(load, levels) {
  Object.entries(SFX).forEach(([name, s]) => load.audio(sfxKey(name), s.path));
  const used = new Set(levels.map((l) => l.music).filter(Boolean));
  used.forEach((name) => {
    if (MUSIC[name]) load.audio(musicKey(name), MUSIC[name]);
    else console.warn(`[Nerves] Música "${name}" no está en config/audio.js`);
  });
}

// SFX simple. opts.volume multiplica, opts.detune en cents
export function playSfx(scene, name, opts = {}) {
  const key = sfxKey(name);
  if (!scene.cache.audio.exists(key)) return;
  scene.sound.play(key, {
    volume: SFX[name].volume * AUDIO.SFX_VOLUME * (opts.volume ?? 1),
    detune: opts.detune ?? 0
  });
}

// SFX que se atenúa según la distancia al centro de la cámara
export function playSfxAt(scene, name, x, y, opts = {}) {
  const cam = scene.cameras.main;
  const dist = Math.hypot(x - cam.midPoint.x, y - cam.midPoint.y);
  const falloff = 1 - dist / AUDIO.POSITIONAL_RANGE;
  if (falloff <= 0) return;
  playSfx(scene, name, { ...opts, volume: (opts.volume ?? 1) * falloff });
}

// Cambia de pista con fundido. Si ya suena la misma, no hace nada.
export function playMusic(scene, name) {
  if (!name || currentMusic?.name === name) return;
  const key = musicKey(name);
  if (!scene.cache.audio.exists(key)) return;

  stopMusic(scene);
  const sound = scene.sound.add(key, { loop: true, volume: 0 });
  sound.play();
  fade(scene, sound, 0, AUDIO.MUSIC_VOLUME);
  currentMusic = { name, sound };
}

export function stopMusic(scene) {
  if (!currentMusic) return;
  const { sound } = currentMusic;
  currentMusic = null;
  fade(scene, sound, sound.volume, 0, () => sound.destroy());
}

// Fundido de volumen con un contador (el volumen se fija en cada paso)
function fade(scene, sound, from, to, onComplete) {
  tweens(scene).addCounter({
    from,
    to,
    duration: AUDIO.MUSIC_FADE_MS,
    onUpdate: (tween) => sound.setVolume(tween.getValue()),
    onComplete
  });
}
