import * as Phaser from 'phaser';
import { GAME, PHYSICS, PALETTE } from './constants.js';
import { BootScene } from '../scenes/BootScene.js';
import { PreloadScene } from '../scenes/PreloadScene.js';
import { IntroScene } from '../scenes/IntroScene.js';
import { GameScene } from '../scenes/GameScene.js';
import { UIScene } from '../scenes/UIScene.js';
import { TransitionScene } from '../scenes/TransitionScene.js';

// Configuración global de Phaser
export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  backgroundColor: PALETTE.BG,
  pixelArt: true, // sin suavizado + roundPixels
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  input: { gamepad: true },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: PHYSICS.GRAVITY },
      fps: PHYSICS.FPS, // paso fijo: el salto se siente igual en cualquier monitor
      fixedStep: true,
      debug: false
    }
  },
  scene: [BootScene, PreloadScene, IntroScene, GameScene, UIScene, TransitionScene] // la última se dibuja encima
};
