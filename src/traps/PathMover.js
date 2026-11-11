// Movimiento de ida y vuelta sobre un eje, entre dos límites.
// Lo usan las plataformas móviles y las sierras.
// Se mueve con velocidad de física (no tween) para que Arcade arrastre al jugador encima.

export class PathMover {
  // axis: 'x' o 'y'. min/max: límites del centro del objeto en px
  constructor(obj, axis, min, max, speed) {
    this.obj = obj;
    this.axis = axis;
    this.min = min;
    this.max = max;
    this.speed = max > min ? speed : 0;
    // Arranca hacia el extremo más lejano
    const pos = obj[axis];
    this.dir = max - pos >= pos - min ? 1 : -1;
    this.apply();
  }

  update() {
    const pos = this.obj[this.axis];
    if (this.dir > 0 && pos >= this.max) this.dir = -1;
    else if (this.dir < 0 && pos <= this.min) this.dir = 1;
    this.apply();
  }

  apply() {
    const v = this.speed * this.dir;
    if (this.axis === 'x') this.obj.body.setVelocity(v, 0);
    else this.obj.body.setVelocity(0, v);
  }
}
