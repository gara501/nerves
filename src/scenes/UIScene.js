import * as Phaser from 'phaser';
import { GAME } from '../config/constants.js';

const TEXT_STYLE = {
  fontFamily: 'monospace',
  fontSize: '10px',
  color: '#eadcca',
  stroke: '#0e0b20',
  strokeThickness: 3
};

// HUD sobre el juego. Persiste entre reinicios de nivel.
export class UIScene extends Phaser.Scene {
  constructor() {
    super('UI');
  }

  create() {
    this.deathsText = this.add.text(8, 6, '', TEXT_STYLE);
    this.levelText = this.add.text(GAME.WIDTH - 8, 6, '', TEXT_STYLE).setOrigin(1, 0);

    this.refresh();
    this.registry.events.on('changedata', this.refresh, this);
    this.events.once('shutdown', () => this.registry.events.off('changedata', this.refresh, this));
  }

  refresh() {
    this.deathsText.setText(`Muertes: ${this.registry.get('deaths')}`);
    this.levelText.setText(this.registry.get('levelName'));
  }
}
