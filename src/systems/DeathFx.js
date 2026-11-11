import * as Phaser from 'phaser';
import { PLAYER, FX, DEPTH } from '../config/constants.js';

// Efectos de muerte según cómo mató la trampa (static deathKind en cada trampa):
//   cut   -> gotas saliendo del corte (+ estrella si la trampa tiene static sparks)
//   crush -> gotas hacia los lados
//   burn  -> el robot se convierte en cenizas (player-ash.png)
//   sin trampa (caída al vacío) -> solo sacudida
export const DEATH = { CUT: 'cut', CRUSH: 'crush', BURN: 'burn' };

const SPARK_KEY = 'spark';
const SPARK_SIZE = 9;

// Estrella de impacto: 4 frames (crece, destella, se encoge)
export function createSparkTexture(scene) {
  if (scene.textures.exists(SPARK_KEY)) return;
  const tex = scene.textures.createCanvas(SPARK_KEY, SPARK_SIZE * 4, SPARK_SIZE);
  const ctx = tex.getContext();
  const c = 4; // centro
  const px = (f, x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(f * SPARK_SIZE + c + x, c + y, 1, 1);
  };
  const white = '#eaeaea';
  const warm = '#eadcca';
  // [radio de la cruz, radio de las diagonales]
  const shapes = [[1, 0], [3, 1], [4, 2], [2, 1]];
  shapes.forEach(([arm, diag], f) => {
    for (let i = 1; i <= arm; i++) {
      const col = i === arm ? warm : white;
      px(f, i, 0, col); px(f, -i, 0, col); px(f, 0, i, col); px(f, 0, -i, col);
    }
    for (let i = 1; i <= diag; i++) {
      px(f, i, i, warm); px(f, -i, i, warm); px(f, i, -i, warm); px(f, -i, -i, warm);
    }
    px(f, 0, 0, white);
    tex.add(f, 0, f * SPARK_SIZE, 0, SPARK_SIZE, SPARK_SIZE);
  });
  tex.refresh();
}

// Animaciones de efectos (se llama una vez al cargar)
export function createFxAnimations(scene) {
  createSparkTexture(scene);
  if (!scene.anims.exists('spark')) {
    // 60 fps: cada frame dura un frame de juego
    scene.anims.create({ key: 'spark', frames: scene.anims.generateFrameNumbers(SPARK_KEY, { start: 0, end: FX.SPARK_FRAMES - 1 }), frameRate: 60 });
  }
  const ash = scene.textures.get('player_ash');
  if (!scene.anims.exists('player_ash') && ash.frameTotal > 2) {
    scene.anims.create({ key: 'player_ash', frames: scene.anims.generateFrameNumbers('player_ash'), frameRate: FX.ASH_FPS });
  }
}

// Ejecuta los efectos y devuelve cuántos ms esperar antes de reaparecer
export function playDeathFx(scene, player, cause) {
  const kind = cause?.constructor.deathKind;
  scene.shake.start(FX.SHAKE_PX, FX.SHAKE_FRAMES);

  if (kind === DEATH.BURN && scene.anims.exists('player_ash')) return ashes(scene, player);

  const hit = contactPoint(player, cause);
  if (cause?.constructor.sparks) spark(scene, hit);
  if (kind === DEATH.CUT) drops(scene, hit, awayAngle(player, hit), 55);
  if (kind === DEATH.CRUSH) drops(scene, hit, -90, 80);
  return PLAYER.RESPAWN_DELAY_MS;
}

// Punto de contacto: el punto de la trampa más cercano al centro del jugador
function contactPoint(player, cause) {
  const center = { x: player.x, y: player.body.center.y };
  if (!cause?.body) return center;
  const b = cause.body;
  return {
    x: Phaser.Math.Clamp(center.x, b.left, b.right),
    y: Phaser.Math.Clamp(center.y, b.top, b.bottom)
  };
}

// Ángulo (grados) desde el contacto hacia el jugador: las gotas salen hacia afuera
function awayAngle(player, hit) {
  const dx = player.x - hit.x;
  const dy = player.body.center.y - hit.y;
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return -90;
  return Phaser.Math.RadToDeg(Math.atan2(dy, dx));
}

function drops(scene, hit, angle, spread) {
  const emitter = scene.add.particles(hit.x, hit.y, 'particle', {
    speed: { min: 70, max: 170 },
    angle: { min: angle - spread, max: angle + spread },
    gravityY: 700,
    lifespan: { min: 350, max: 650 },
    tint: FX.DROP_COLORS,
    emitting: false
  }).setDepth(DEPTH.FX);
  emitter.explode(FX.DROPS);
  scene.time.delayedCall(800, () => emitter.destroy());
}

function spark(scene, hit) {
  const s = scene.add.sprite(Math.round(hit.x), Math.round(hit.y), SPARK_KEY, 0).setDepth(DEPTH.FX + 1);
  s.play('spark');
  s.once('animationcomplete', () => s.destroy());
}

// Cenizas: mismo encuadre y orientación que el robot
function ashes(scene, player) {
  const flipped = player.flipX;
  const cx = flipped ? PLAYER.FRAME_W - PLAYER.CENTER_X : PLAYER.CENTER_X;
  const ash = scene.add.sprite(player.x, player.y, 'player_ash', 0)
    .setOrigin(cx / PLAYER.FRAME_W, PLAYER.FEET_Y / PLAYER.FRAME_H)
    .setFlipX(flipped)
    .setDepth(DEPTH.PLAYER);
  ash.play('player_ash');
  const frames = scene.anims.get('player_ash').frames.length;
  return (frames / FX.ASH_FPS) * 1000 + FX.ASH_LINGER_MS;
}
