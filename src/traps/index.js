import { Spike } from './Spike.js';
import { PopSpike } from './PopSpike.js';
import { FallingFloor } from './FallingFloor.js';
import { Laser, LaserAlt } from './Laser.js';
import { Crusher } from './Crusher.js';
import { MovingPlatform, VerticalPlatform } from './MovingPlatform.js';
import { Saw, SawVertical } from './Saw.js';

// Carácter del mapa ASCII -> clase de trampa.
// Para una trampa nueva: crea la clase y regístrala aquí.
export const TRAP_TYPES = {
  '^': Spike,
  'h': PopSpike,
  'F': FallingFloor,
  'L': Laser,
  'l': LaserAlt,
  'C': Crusher,
  '-': MovingPlatform,
  'I': VerticalPlatform,
  'S': Saw,
  's': SawVertical
};
