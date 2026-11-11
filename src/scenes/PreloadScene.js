import * as Phaser from 'phaser';
import { ASSETS } from '../config/assets.js';
import { PLAYER_ANIMS } from '../config/animations.js';
import { GAME, PALETTE } from '../config/constants.js';
import { TILESET } from '../config/tileset.js';
import { createPlaceholders } from '../systems/PlaceholderFactory.js';
import { createTerrainTexture } from '../systems/TerrainBuilder.js';
import { loadAudio } from '../systems/AudioManager.js';
import { createFxAnimations } from '../systems/DeathFx.js';
import { LEVELS } from '../levels/index.js';

// Atajo para diseñar: ?level=2 en la URL empieza en ese nivel
function startLevel() {
  const n = parseInt(new URLSearchParams(window.location.search).get('level'), 10);
  return n >= 1 && n <= LEVELS.length ? n - 1 : 0;
}

// Carga el manifiesto, rellena faltantes y crea animaciones
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    this.drawProgressBar();

    // Archivos faltantes no rompen el juego: se registran y luego van a placeholder
    this.missing = [];
    this.load.on('loaderror', (file) => this.missing.push(file.key));

    ASSETS.spritesheets.forEach((a) =>
      this.load.spritesheet(a.key, a.path, { frameWidth: a.frameWidth, frameHeight: a.frameHeight })
    );
    ASSETS.images.forEach((a) => this.load.image(a.key, a.path));
    loadAudio(this.load, LEVELS);
  }

  create() {
    if (this.missing.length) {
      console.info('[Nerves] Usando placeholders para:', this.missing.join(', '));
    }
    createPlaceholders(this);
    this.registerTilesetFrames();
    createTerrainTexture(this);
    this.createAnimations();
    createFxAnimations(this);

    this.scene.start('Intro', { levelIndex: startLevel() });
  }

  // Piezas del tileset con nombre (spike, exit...) para usarlas como sprites
  registerTilesetFrames() {
    const tex = this.textures.get(TILESET.key);
    Object.entries(TILESET.frames).forEach(([name, [x, y, w, h]]) => {
      if (!tex.has(name)) tex.add(name, 0, x, y, w, h);
    });

    // El TileSprite necesita una textura propia para repetirse
    const [x, y, w, h] = TILESET.frames.bgPanel;
    const bg = this.textures.createCanvas('bg_panel', w, h);
    bg.getContext().drawImage(tex.getSourceImage(), x, y, w, h, 0, 0, w, h);
    bg.refresh();
  }

  // Crea animaciones solo si el spritesheet tiene suficientes frames
  createAnimations() {
    if (this.textures.get('pop_spikes').frameTotal > 4) {
      this.anims.create({ key: 'pop_spikes', frames: this.anims.generateFrameNumbers('pop_spikes', { start: 0, end: 3 }), frameRate: 50 });
    }
    const frames = this.textures.get('player').frameTotal - 1; // -1 por __BASE
    PLAYER_ANIMS.forEach((a) => {
      if (a.frames.end >= frames) return;
      this.anims.create({
        key: a.key,
        frames: this.anims.generateFrameNumbers('player', a.frames),
        frameRate: a.frameRate,
        repeat: a.repeat
      });
    });
  }

  drawProgressBar() {
    const w = 160;
    const x = (GAME.WIDTH - w) / 2;
    const y = GAME.HEIGHT / 2;
    const bar = this.add.graphics();
    this.load.on('progress', (p) => {
      bar.clear();
      bar.fillStyle(PALETTE.SLATE).fillRect(x, y, w, 4);
      bar.fillStyle(PALETTE.GREEN_LIGHT).fillRect(x, y, w * p, 4);
    });
  }
}
