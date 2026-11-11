import * as Phaser from 'phaser';
import { GAME, PALETTE, PLAYER } from '../config/constants.js';
import { TILESET } from '../config/tileset.js';
import { CREDITS } from '../config/credits.js';
import { barTexture } from '../systems/TerrainBuilder.js';
import { createSawTexture } from '../traps/Saw.js';
import { createMenuFont, menuText } from '../systems/MenuFont.js';

const PAPER = '#eadcca';
const GREEN = '#88d660';

// El menú es una escena independiente: la demostración no participa en la física.
export class IntroScene extends Phaser.Scene {
  constructor() { super('Intro'); }

  init(data) {
    this.levelIndex = data.levelIndex ?? 0;
    this.starting = false;
    this.aboutOpen = false;
    this.focusIndex = 0;
  }

  create() {
    createMenuFont(this);
    this.drawBackdrop();
    this.drawTitle();
    this.mainButtons = [
      this.button(108, 170, 152, 'PLAY', () => this.startGame(), true),
      this.button(108, 210, 152, 'ABOUT', () => this.showAbout())
    ];
    this.text(32, 245, '↑ ↓ / TAB   CHOOSE     ENTER   ACCEPT', 7, '#7488aa');

    this.drawAbout();
    this.buttons = this.mainButtons;
    this.focus(0);
    this.bindInput();
    this.cameras.main.fadeIn(280, 14, 11, 32);
  }

  text(x, y, value, size = 10, color = PAPER) {
    return menuText(this, x, y, value, size, color);
  }

  drawBackdrop() {
    this.add.tileSprite(0, 0, GAME.WIDTH, GAME.HEIGHT, 'bg_panel').setOrigin(0).setAlpha(0.36);
    const g = this.add.graphics();
    // Rieles y estructura de la cámara industrial.
    g.lineStyle(1, 0x38435b).lineBetween(280, 67, 456, 67);
    [280, 456].forEach(x => g.fillStyle(PALETTE.STEEL).fillRect(x - 2, 63, 4, 8));
    g.fillStyle(PALETTE.INK).fillRect(248, 220, 232, 50);
    this.add.image(248, 214, barTexture(this, 15)).setOrigin(0);
    for (let x = 264; x < 456; x += 16) this.add.image(x, 214, TILESET.key, 'spike').setOrigin(0, 1);
    this.add.image(322, 194, barTexture(this, 4)).setOrigin(0);

    // Sierra sobre un riel; el giro usa los dos frames del juego.
    createSawTexture(this);
    this.saw = this.add.sprite(298, 67, 'saw', 0).setScale(2);
    this.tweens.add({ targets: this.saw, x: 438, duration: 1900, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
    this.add.image(430, 117, TILESET.key, 'crusher').setScale(2);
    const beam = this.add.rectangle(274, 142, 2, 108, PALETTE.RED);
    this.add.rectangle(274, 86, 14, 5, PALETTE.STEEL_LIGHT);
    this.add.rectangle(274, 198, 14, 5, PALETTE.STEEL_LIGHT);
    this.tweens.add({ targets: beam, alpha: 0.12, duration: 750, hold: 350, yoyo: true, repeat: -1, ease: 'Stepped', easeParams: [2] });

    // Saltos de pánico: mantiene el centro y los pies del sprite original.
    this.robot = this.add.sprite(350, 194, 'player', 11)
      .setOrigin(PLAYER.CENTER_X / PLAYER.FRAME_W, PLAYER.FEET_Y / PLAYER.FRAME_H).setScale(3);
    this.alarm = this.text(378, 128, '!!', 19, GREEN);
    this.tweens.add({ targets: this.robot, y: 135, duration: 440, ease: 'Quad.easeOut', yoyo: true, hold: 70, repeatDelay: 180, repeat: -1 });
    this.tweens.add({ targets: this.alarm, y: 112, duration: 440, yoyo: true, repeat: -1 });

    // Una placa opaca mantiene el título y los controles legibles.
    g.fillStyle(PALETTE.INK, 0.96).fillRect(0, 0, 237, 236);
    g.lineStyle(1, 0x38435b).lineBetween(237, 22, 237, 229);
    g.fillStyle(PALETTE.GREEN_GLOW).fillRect(32, 31, 20, 2);
  }

  drawTitle() {
    this.text(60, 27, 'ARAMDEV PRESENTS', 8, '#a0b8d4');
    this.text(34, 62, 'NERVES', 49, '#13443f');
    this.text(32, 58, 'NERVES', 49, PAPER);
  }

  button(x, y, width, title, action, primary = false, parent, height = 30) {
    const border = this.add.rectangle(0, 2, width + 2, height + 2, 0x0e0b20);
    const plate = this.add.rectangle(0, 0, width, height, 0x24283c).setStrokeStyle(1, 0x47547b)
      .setInteractive({ useHandCursor: true });
    const label = this.text(0, 0, title, primary ? 15 : 11).setOrigin(0.5);
    const arrow = this.text(-width / 2 + 9, 0, '>', 12, GREEN).setOrigin(0, 0.5);
    const container = this.add.container(x, y, [border, plate, label, arrow]);
    if (parent) parent.add(container);
    const item = { container, plate, label, arrow, action, primary };
    plate.on('pointerover', () => {
      const index = this.buttons.indexOf(item);
      if (index >= 0) this.focus(index);
    });
    plate.on('pointerup', () => {
      if (!this.starting && this.buttons.includes(item)) action();
    });
    return item;
  }

  focus(index) {
    this.focusIndex = (index + this.buttons.length) % this.buttons.length;
    this.buttons.forEach((b, i) => {
      const active = i === this.focusIndex;
      b.plate.setFillStyle(active ? PALETTE.GREEN_DARK : PALETTE.SLATE)
        .setStrokeStyle(1, active ? PALETTE.GREEN_GLOW : PALETTE.STEEL);
      b.label.setTint(active ? PALETTE.GREEN_GLOW : 0xeadcca);
      b.arrow.setVisible(active);
    });
  }

  drawAbout() {
    this.about = this.add.container(0, 0).setDepth(100);
    const shade = this.add.rectangle(240, 135, 480, 270, 0x0e0b20, 0.97).setInteractive();
    const panel = this.add.rectangle(240, 135, 420, 244, 0x161731).setStrokeStyle(1, 0x47547b);
    this.about.add([shade, panel]);
    this.about.add(this.text(48, 25, 'ABOUT / NERVES', 11, GREEN));
    if (this.textures.exists('aramdev_logo')) {
      const logo = this.add.image(240, 78, 'aramdev_logo');
      logo.setDisplaySize(180, 180 * logo.height / logo.width);
      this.about.add(logo);
    }
    this.about.add(this.text(240, 111, 'Created by ARAMDEV', 11).setOrigin(0.5));
    this.about.add(this.text(240, 127, 'Game design and development', 8, '#a0b8d4').setOrigin(0.5));
    this.aboutButtons = CREDITS.map((credit, i) => {
      const y = 145 + i * 34;
      this.about.add(this.text(55, y, credit.role, 7, '#7488aa'));
      return this.button(240, y + 19, 370, `${credit.title}  ↗`, () => window.open(credit.url, '_blank', 'noopener,noreferrer'), false, this.about, 24);
    });
    this.aboutButtons.push(this.button(240, 235, 100, 'BACK', () => this.hideAbout(), false, this.about));
    this.about.setVisible(false);
  }

  showAbout() {
    this.aboutOpen = true;
    this.about.setVisible(true);
    this.buttons = this.aboutButtons;
    this.focus(0);
  }

  hideAbout() {
    this.aboutOpen = false;
    this.about.setVisible(false);
    this.buttons = this.mainButtons;
    this.focus(1);
  }

  bindInput() {
    const onKey = (event) => {
      if (event.repeat || this.starting) return;
      const key = event.key;
      if (['ArrowUp', 'ArrowDown', 'Tab', 'Enter', ' ', 'Escape'].includes(key)) event.preventDefault();
      if (key === 'ArrowUp' || (key === 'Tab' && event.shiftKey)) this.focus(this.focusIndex - 1);
      else if (key === 'ArrowDown' || key === 'Tab') this.focus(this.focusIndex + 1);
      else if (key === 'Enter' || key === ' ') this.buttons[this.focusIndex].action();
      else if (key === 'Escape' && this.aboutOpen) this.hideAbout();
    };
    const onPad = (_pad, button) => {
      if (this.starting) return;
      if (button.index === 12) this.focus(this.focusIndex - 1);
      else if (button.index === 13) this.focus(this.focusIndex + 1);
      else if (button.index === 0) this.buttons[this.focusIndex].action();
      else if (button.index === 1 && this.aboutOpen) this.hideAbout();
    };
    this.input.keyboard.on('keydown', onKey);
    this.input.gamepad?.on('down', onPad);
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown', onKey);
      this.input.gamepad?.off('down', onPad);
    });
  }

  startGame() {
    if (this.starting) return;
    this.starting = true;
    this.registry.set('deaths', 0);
    this.scene.get('Transition').cover();
    this.scene.start('Game', { levelIndex: this.levelIndex, iris: true });
  }

  update(time) {
    this.saw.setFrame(Math.floor(time / 65) % 2);
    this.robot.setFrame(this.robot.y < 160 ? 11 : 15);
    this.alarm.setX(378 + (Math.floor(time / 100) % 2));
  }
}
