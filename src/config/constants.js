// Valores centrales del juego. Ajusta aquí el "feel" sin tocar la lógica.

export const GAME = {
  WIDTH: 480,  // resolución interna (se escala a la ventana)
  HEIGHT: 270,
  TILE: 16     // tamaño de tile en px
};

export const PHYSICS = {
  FPS: 120,       // pasos de física por segundo
  GRAVITY: 1400
};

// Tuning del jugador (px, px/s, ms)
export const PLAYER = {
  FRAME_W: 32,          // tamaño de frame del spritesheet
  FRAME_H: 32,
  CENTER_X: 15,         // centro del personaje dentro del frame (px)
  FEET_Y: 23,           // fila justo debajo de los pies (px)
  BODY_W: 10,           // hitbox más pequeña que el dibujo = más justo
  BODY_H: 14,

  MAX_RUN: 130,
  ACCEL_GROUND: 2000,
  DECEL_GROUND: 2600,
  ACCEL_AIR: 1400,
  DECEL_AIR: 900,
  TURN_BOOST: 1.6,      // multiplicador al cambiar de dirección

  JUMP_VELOCITY: 380,   // ~3 tiles de altura
  JUMP_CUT: 0.4,        // soltar salto corta la subida (salto variable)
  MAX_FALL: 420,
  FALL_GRAVITY_MULT: 1.25,  // cae más rápido de lo que sube
  APEX_GRAVITY_MULT: 0.55,  // flota un poco en la cima si mantienes salto
  APEX_THRESHOLD: 40,       // |vy| bajo esto = cima del salto

  COYOTE_MS: 80,        // margen para saltar tras dejar el borde
  JUMP_BUFFER_MS: 110,  // margen para presionar salto antes de tocar el piso

  RESPAWN_DELAY_MS: 450
};

// Tuning de trampas
export const TRAPS = {
  POP_SPIKE_RANGE_X: 22,   // distancia horizontal que activa el pincho oculto
  POP_SPIKE_RANGE_Y: 24,
  POP_SPIKE_TIME_MS: 60,   // tiempo en salir (casi instantáneo)
  FALLING_FLOOR_DELAY_MS: 320,
  FALLING_FLOOR_SHAKE: 1,
  LASER_OFF_MS: 1100,      // apagado (ventana para pasar)
  LASER_WARN_MS: 450,      // línea fina de aviso
  LASER_CHARGE_MS: 100,    // carga justo antes de encender
  LASER_ON_MS: 800,        // encendido (mata)
  LASER_HITBOX_W: 2,
  CRUSHER_RANGE_X: 14,     // qué tan alineado debajo debe estar el jugador
  CRUSHER_SHAKE_MS: 150,   // aviso antes de caer
  CRUSHER_GRAVITY: 2400,
  CRUSHER_MAX_SPEED: 600,
  CRUSHER_REST_MS: 700,    // tiempo en el suelo
  CRUSHER_RISE_SPEED: 40,
  PLATFORM_SPEED: 45,      // plataformas móviles (px/s)
  SAW_SPEED: 70            // sierras (px/s)
};

// Efectos de impacto
export const FX = {
  SHAKE_PX: 3,            // sacudida al morir: amplitud inicial
  SHAKE_FRAMES: 10,       // ...y frames hasta calmarse
  CRUSH_SHAKE_PX: 1,      // golpe del aplastador
  CRUSH_SHAKE_FRAMES: 6,
  DROPS: 10,              // gotas que salen del corte
  DROP_COLORS: [0x99e65f, 0x56af56], // refrigerante verde (como los ojos del robot)
  SPARK_FRAMES: 4,        // estrella de impacto en pinchos y sierras
  ASH_FPS: 14,            // animación de cenizas (láser)
  ASH_LINGER_MS: 250      // tiempo que quedan las cenizas antes de reaparecer
};

// Transición entre niveles (ms)
export const TRANSITION = {
  CLOSE_MS: 600,  // igual que level_close.wav
  HOLD_MS: 250,   // pantalla negra
  OPEN_MS: 600    // igual que level_open.wav
};

// Paleta (sacada del tileset y del personaje). Ver docs/GUIA_ARTE.md
export const PALETTE = {
  BG: '#1b1d33',
  INK: 0x0e0b20,        // contorno
  NAVY: 0x161731,
  SLATE: 0x24283c,
  STEEL: 0x47547b,
  STEEL_LIGHT: 0xa0b8d4,
  GREEN_DARK: 0x13443f,
  GREEN: 0x2d814f,
  GREEN_LIGHT: 0x56af56,
  GREEN_GLOW: 0x88d660,
  CYAN: 0x15eed9,
  RED: 0xca3134,
  WHITE: 0xeaeaea,
  // Personaje
  BOT_DARK: 0x7a6964,
  BOT_MID: 0xad978f,
  BOT_LIGHT: 0xeadcca,
  BOT_EYE: 0x99e65f
};

// Profundidad de dibujo
export const DEPTH = {
  BG: 0,
  HIDDEN: 5,  // trampas escondidas bajo el suelo
  TILES: 10,
  PROPS: 15,
  TRAPS: 20,
  PLAYER: 30,
  FX: 40
};
