import * as Phaser from 'phaser';

// Traduce teclado + gamepad a acciones abstractas.
// El jugador solo pregunta "¿izquierda?", "¿salto presionado?", etc.

const K = Phaser.Input.Keyboard.KeyCodes;

const BINDINGS = {
  left: [K.LEFT, K.A],
  right: [K.RIGHT, K.D],
  jump: [K.SPACE, K.Z, K.UP, K.W],
  restart: [K.R],
  debug: [K.B]
};

const PAD_JUMP = 0; // botón A / Cruz
const STICK_DEADZONE = 0.35;

export class InputController {
  constructor(scene) {
    this.scene = scene;
    this.keys = {};
    this.queued = new Set(); // presionados desde el último frame
    this.frame = new Set();  // presionados en este frame

    Object.entries(BINDINGS).forEach(([action, codes]) => {
      this.keys[action] = codes.map((c) => {
        const key = scene.input.keyboard.addKey(c);
        // Evento directo: no se pierde un toque aunque se suelte en el mismo frame
        key.on('down', () => this.queued.add(action));
        return key;
      });
    });
    this.prevPadJump = false;
  }

  // Llamar una vez por frame antes de leer acciones
  update() {
    const padJump = this.padButton(PAD_JUMP);
    if (padJump && !this.prevPadJump) this.queued.add('jump');
    this.prevPadJump = padJump;

    this.frame = this.queued;
    this.queued = new Set();
  }

  get pad() {
    return this.scene.input.gamepad?.pad1;
  }

  padButton(i) {
    return !!this.pad?.buttons[i]?.pressed;
  }

  held(action) {
    return this.keys[action].some((k) => k.isDown);
  }

  pressed(action) {
    return this.frame.has(action);
  }

  // Dirección horizontal: -1, 0 o 1
  get axisX() {
    let x = (this.held('right') ? 1 : 0) - (this.held('left') ? 1 : 0);
    const pad = this.pad;
    if (x === 0 && pad) {
      if (pad.left) x = -1;
      else if (pad.right) x = 1;
      else if (Math.abs(pad.leftStick.x) > STICK_DEADZONE) x = Math.sign(pad.leftStick.x);
    }
    return x;
  }

  get jumpPressed() {
    return this.pressed('jump');
  }

  get jumpHeld() {
    return this.held('jump') || this.padButton(PAD_JUMP);
  }
}
