import * as Phaser from 'phaser';
import { PLAYER, PHYSICS, DEPTH } from '../config/constants.js';
import { playSfx } from '../systems/AudioManager.js';

// Frames del spritesheet donde un pie toca el piso al correr
const STEP_FRAMES = [9, 13];

// Jugador con control de precisión:
// aceleración propia, coyote time, jump buffer, salto variable y flotación en la cima.

const approach = (value, target, step) =>
  value < target ? Math.min(value + step, target) : Math.max(value - step, target);

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, controls) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.controls = controls;
    this.alive = true;
    this.facing = 1;
    this.coyoteTimer = 0;
    this.bufferTimer = 0;
    this.isJumping = false;

    this.setDepth(DEPTH.PLAYER);
    this.stepCount = 0;
    this.on('animationupdate', (anim, frame) => this.onAnimFrame(anim, frame));
    this.body.setSize(PLAYER.BODY_W, PLAYER.BODY_H);
    this.body.setMaxVelocityY(PLAYER.MAX_FALL);
    this.setCollideWorldBounds(true);
    this.applyFacing();
  }

  // x,y del sprite = centro de los pies. Phaser voltea sobre el centro del frame,
  // así que al girar se mueve el origen para que el personaje no se desplace.
  applyFacing() {
    const flipped = this.facing < 0;
    const cx = flipped ? PLAYER.FRAME_W - PLAYER.CENTER_X : PLAYER.CENTER_X;
    this.setFlipX(flipped);
    this.setOrigin(cx / PLAYER.FRAME_W, PLAYER.FEET_Y / PLAYER.FRAME_H);
    this.body.setOffset(cx - PLAYER.BODY_W / 2, PLAYER.FEET_Y - PLAYER.BODY_H);
  }

  get grounded() {
    return this.body.blocked.down || this.body.touching.down;
  }

  update(delta) {
    if (!this.alive) return;
    const dt = delta / 1000;

    this.updateTimers(delta);
    this.updateCarry();
    this.updateHorizontal(dt);
    this.updateJump();
    this.updateGravity();
    this.updateAnimation();
  }

  updateTimers(delta) {
    if (this.grounded) {
      this.coyoteTimer = PLAYER.COYOTE_MS;
      if (this.body.velocity.y >= 0) this.isJumping = false;
    } else {
      this.coyoteTimer -= delta;
    }

    if (this.controls.jumpPressed) this.bufferTimer = PLAYER.JUMP_BUFFER_MS;
    else this.bufferTimer -= delta;
  }

  // Impulso de plataforma: parado sobre una móvil, el jugador hereda su velocidad
  // y la conserva en el aire hasta volver a pisar algo. Así saltar sobre ella no te deja atrás.
  updateCarry() {
    if (!this.grounded) return;
    const platform = this.platformBelow();
    this.carryX = platform ? platform.body.velocity.x : 0;
  }

  platformBelow() {
    const b = this.body;
    return this.scene.level.traps.find((t) => {
      if (!t.isPlatform) return false;
      const p = t.body;
      return b.right > p.left && b.left < p.right && Math.abs(b.bottom - p.top) <= 1.5;
    });
  }

  updateHorizontal(dt) {
    const dir = this.controls.axisX;
    const carry = this.carryX ?? 0;
    const vx = this.body.velocity.x;
    const onGround = this.grounded;
    let rate;

    if (dir !== 0) {
      rate = onGround ? PLAYER.ACCEL_GROUND : PLAYER.ACCEL_AIR;
      if (Math.sign(vx - carry) === -dir) rate *= PLAYER.TURN_BOOST; // giro rápido
      if (dir !== this.facing) {
        this.facing = dir;
        this.applyFacing();
      }
    } else {
      rate = onGround ? PLAYER.DECEL_GROUND : PLAYER.DECEL_AIR;
    }

    this.body.setVelocityX(approach(vx, dir * PLAYER.MAX_RUN + carry, rate * dt));
  }

  updateJump() {
    // Saltar si hay buffer y estamos en piso (o dentro del coyote time)
    if (this.bufferTimer > 0 && this.coyoteTimer > 0) {
      this.body.setVelocityY(-PLAYER.JUMP_VELOCITY);
      this.bufferTimer = 0;
      this.coyoteTimer = 0;
      this.isJumping = true;
      playSfx(this.scene, 'jump', { detune: Phaser.Math.Between(-60, 60) });
    }

    // Salto variable: soltar el botón corta la subida
    if (this.isJumping && !this.controls.jumpHeld && this.body.velocity.y < 0) {
      this.body.setVelocityY(this.body.velocity.y * PLAYER.JUMP_CUT);
      this.isJumping = false;
    }
  }

  // Gravedad extra/reducida sumada a la del mundo
  updateGravity() {
    const vy = this.body.velocity.y;
    let mult = 1;
    if (!this.grounded) {
      if (Math.abs(vy) < PLAYER.APEX_THRESHOLD && this.controls.jumpHeld) mult = PLAYER.APEX_GRAVITY_MULT;
      else if (vy > 0) mult = PLAYER.FALL_GRAVITY_MULT;
    }
    this.body.setGravityY(PHYSICS.GRAVITY * (mult - 1));
  }

  updateAnimation() {
    let key = 'player_idle';
    if (!this.grounded) key = this.body.velocity.y < 0 ? 'player_jump' : 'player_fall';
    else if (Math.abs(this.body.velocity.x) > 10) key = 'player_run';

    if (this.scene.anims.exists(key)) this.play(key, true);
  }

  // Pasos sincronizados con la animación, alternando dos sonidos
  onAnimFrame(anim, frame) {
    if (anim.key !== 'player_run' || !this.grounded) return;
    if (!STEP_FRAMES.includes(Number(frame.textureFrame))) return;
    this.stepCount++;
    playSfx(this.scene, this.stepCount % 2 ? 'step' : 'step2', { detune: Phaser.Math.Between(-80, 80) });
  }

  die() {
    if (!this.alive) return false;
    this.alive = false;
    this.body.stop();
    this.body.enable = false;
    this.setVisible(false);
    return true;
  }
}
