import * as Phaser from 'phaser';
import { GAME, PLAYER, DEPTH, TRAPS } from '../config/constants.js';
import { LEVELS } from '../levels/index.js';
import { buildLevel } from '../systems/LevelBuilder.js';
import { InputController } from '../systems/InputController.js';
import { Player } from '../entities/Player.js';
import { playSfx, playMusic, stopMusic } from '../systems/AudioManager.js';
import { AutoScroll } from '../systems/AutoScroll.js';
import { ScreenShake } from '../systems/ScreenShake.js';
import { playDeathFx } from '../systems/DeathFx.js';

// Escena de juego: arma el nivel, conecta colisiones y maneja muerte/salida
export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(data) {
    this.levelIndex = data.levelIndex ?? 0;
    this.withIris = !!data.iris; // entrar con transición (no tras morir)
    this.finished = false;
    this.inputLocked = false;
  }

  create() {
    const levelData = LEVELS[this.levelIndex];
    // Dificultad: cada nivel puede endurecer los tiempos de las trampas
    this.tuning = { ...TRAPS, ...levelData.tuning };
    this.createBackground();
    this.level = buildLevel(this, levelData);
    this.registry.set('levelName', levelData.name);

    this.controls = new InputController(this);
    this.player = new Player(this, this.level.spawn.x, this.level.spawn.y, this.controls);

    this.setupWorld();
    this.setupCollisions();
    this.setupCamera();
    this.shake = new ScreenShake(this.cameras.main);
    this.shake.reset();
    this.applyDebug();
    this.autoScroll = levelData.autoscroll ? new AutoScroll(this, levelData.autoscroll) : null;
    const backToIntro = () => {
      if (this.inputLocked || !this.player.alive) return;
      stopMusic(this);
      this.scene.stop('UI');
      this.scene.start('Intro', { levelIndex: this.levelIndex });
    };
    this.input.keyboard.on('keydown-ESC', backToIntro);
    this.events.once('shutdown', () => this.input.keyboard.off('keydown-ESC', backToIntro));

    if (!this.scene.isActive('UI')) this.scene.launch('UI');
    playMusic(this, levelData.music);
    if (this.withIris) this.openIris();
  }

  get transition() {
    return this.scene.get('Transition');
  }

  // Posición del jugador en pantalla (centro del cuerpo)
  // (el scroll se limita a los bordes del nivel a mano: al crear la escena la cámara aún no lo hizo)
  playerScreenPos() {
    const cam = this.cameras.main;
    const sx = Phaser.Math.Clamp(cam.scrollX, 0, Math.max(0, this.level.width - GAME.WIDTH));
    const sy = Phaser.Math.Clamp(cam.scrollY, 0, Math.max(0, this.level.height - GAME.HEIGHT));
    return { x: this.player.x - sx, y: this.player.y - PLAYER.BODY_H / 2 - sy };
  }

  // Abre el círculo sobre el jugador; los controles esperan a que termine
  async openIris() {
    this.inputLocked = true;
    const { x, y } = this.playerScreenPos();
    await this.transition.open(x, y);
    this.inputLocked = false;
  }

  // Pared de fondo con parallax leve
  createBackground() {
    this.bg = this.add.tileSprite(0, 0, GAME.WIDTH, GAME.HEIGHT, 'bg_panel')
      .setOrigin(0).setScrollFactor(0).setDepth(DEPTH.BG).setAlpha(0.45);
  }

  // Límites: sin piso abajo para que caer al vacío mate
  setupWorld() {
    const { width, height } = this.level;
    this.physics.world.setBounds(0, 0, width, height + 64);
    this.physics.world.setBoundsCollision(true, true, true, false);
  }

  setupCollisions() {
    const { layer, solids, hazards, exit } = this.level;
    this.physics.add.collider(this.player, layer);
    this.physics.add.collider(this.player, solids, (p, s) => s.onPlayerTouch(p));
    this.physics.add.overlap(this.player, hazards, (p, h) => h.onPlayerTouch(p));
    if (exit) this.physics.add.overlap(this.player, exit, () => this.completeLevel());
  }

  setupCamera() {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.level.width, this.level.height);
    cam.startFollow(this.player, true, 0.15, 0.15, 0, PLAYER.FRAME_H / 2);
    cam.setDeadzone(40, 30);
  }

  update(time, delta) {
    this.shake.update();
    this.controls.update();
    if (this.inputLocked) return;
    if (this.controls.pressed('restart')) return this.restartLevel();
    if (this.controls.pressed('debug')) this.toggleDebug();

    this.bg.tilePositionX = this.cameras.main.scrollX * 0.5;
    this.bg.tilePositionY = this.cameras.main.scrollY * 0.5;

    this.player.update(delta);
    this.autoScroll?.update(delta);
    this.level.traps.forEach((t) => t.update(delta, this.player));

    // Cayó al vacío
    if (this.player.alive && this.player.y > this.level.height + 16) this.killPlayer();
  }

  // cause: la trampa que mató (o nada si cayó al vacío)
  killPlayer(cause) {
    if (this.finished || !this.player.die()) return;
    this.registry.inc('deaths', 1);
    playSfx(this, 'die');
    if (cause?.constructor.troll) this.time.delayedCall(150, () => playSfx(this, 'laugh'));
    const delay = playDeathFx(this, this.player, cause);
    this.time.delayedCall(delay, () => this.restartLevel());
  }

  completeLevel() {
    if (this.finished || !this.player.alive) return;
    this.finished = true;
    this.player.body.stop();
    this.player.body.enable = false;
    this.inputLocked = true;
    const next = (this.levelIndex + 1) % LEVELS.length;
    const { x, y } = this.playerScreenPos();
    this.transition.close(x, y).then(() => this.scene.restart({ levelIndex: next, iris: true }));
  }

  // Reinicio completo: todas las trampas vuelven a su estado inicial
  restartLevel() {
    this.scene.restart({ levelIndex: this.levelIndex });
  }

  // Tecla B: muestra hitboxes para ajustar trampas
  toggleDebug() {
    this.registry.toggle('debug');
    this.applyDebug();
  }

  // Se reaplica en cada reinicio de nivel
  applyDebug() {
    const world = this.physics.world;
    const on = !!this.registry.get('debug');
    if (on && !world.debugGraphic) world.createDebugGraphic();
    world.drawDebug = on;
    world.debugGraphic?.clear();
  }
}
