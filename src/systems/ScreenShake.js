// Sacudida de pantalla que se calma: amplitud inicial en px que baja a 0 en N frames.
// Mueve el viewport de la cámara en píxeles enteros (nítido en pixel art)
// sin tocar el scroll, así no interfiere con el seguimiento ni la pantalla automática.

export class ScreenShake {
  constructor(camera) {
    this.camera = camera;
    this.amplitude = 0;
    this.frames = 0;
    this.frame = 0;
  }

  // Una sacudida más fuerte reemplaza a una más débil en curso
  start(amplitude, frames) {
    const remaining = this.amplitude * (1 - this.frame / Math.max(1, this.frames));
    if (amplitude < remaining) return;
    this.amplitude = amplitude;
    this.frames = frames;
    this.frame = 0;
  }

  // Llamar una vez por frame
  update() {
    if (this.frame >= this.frames) {
      if (this.amplitude) this.reset();
      return;
    }
    // Amplitud completa del momento en una dirección al azar por eje
    const a = Math.round(this.amplitude * (1 - this.frame / this.frames));
    const offset = () => (Math.random() < 0.5 ? -a : a);
    this.camera.setPosition(offset(), offset());
    this.frame++;
  }

  reset() {
    this.amplitude = 0;
    this.camera.setPosition(0, 0);
  }
}
