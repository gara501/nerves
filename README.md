# Nerves

Plataformero de precisión con trampas ocultas, hecho con Phaser 4 y Vite.

## Arrancar

```bash
npm install
npm run dev      # servidor local con recarga automática
npm run build    # build de producción en /dist
```

## Controles

| Acción | Teclado | Gamepad |
|---|---|---|
| Moverse | ← → / A D | Cruceta / stick |
| Saltar (mantener = más alto) | Espacio / Z / ↑ / W | A / Cruz |
| Reiniciar nivel | R | |
| Ver hitboxes | B | |
| Volver a la intro | Esc | |

La intro incluye PLAY y ABOUT, con el logo de ARAMDEV y enlaces a los packs utilizados. Navega con flechas/Tab y Enter/Espacio, ratón o cruceta/A. En ABOUT, Esc/B vuelve al menú. Créditos: [docs/CREDITOS.md](docs/CREDITOS.md).

## Estructura

```
src/
  main.js                 entrada
  config/
    constants.js          tuning del jugador, trampas, paleta, tamaños
    gameConfig.js         configuración de Phaser
    assets.js             manifiesto de assets (rutas y tamaños)
    tileset.js            qué pieza del tileset es qué (coordenadas)
    animations.js         frames de las animaciones del jugador
    audio.js              qué sonido suena en cada evento + volúmenes
  scenes/
    BootScene.js          estado global
    PreloadScene.js       carga + placeholders + animaciones
    GameScene.js          nivel, colisiones, muerte, salida
    UIScene.js            HUD (muertes, nombre del nivel)
    TransitionScene.js    cierre/apertura en círculo entre niveles
  entities/
    Player.js             movimiento de precisión
    Exit.js               puerta de salida
  traps/
    Trap.js               clase base
    Spike.js              pincho visible
    PopSpike.js           pincho oculto que sale al acercarse
    FallingFloor.js       piso que se cae al pisarlo
    Laser.js              láser por ciclos con aviso
    Crusher.js            aplastador que cae al pasar debajo
    MovingPlatform.js     plataformas móviles horizontales y verticales
    Saw.js                sierras sobre riel
    PathMover.js          movimiento de ida y vuelta compartido
    index.js              carácter del mapa -> trampa
  levels/
    level01.js            nivel en ASCII
    index.js              orden de niveles
  systems/
    InputController.js    teclado + gamepad -> acciones
    LevelBuilder.js       ASCII -> terreno + objetos
    TerrainBuilder.js     auto-tile del terreno desde el bloque verde
    PlaceholderFactory.js texturas temporales
    AudioManager.js       SFX, sonido posicional y música con fundido
    AutoScroll.js         zona donde la pantalla avanza sola
    ScreenShake.js        sacudida de pantalla que se calma
    DeathFx.js            gotas, estrella de impacto y cenizas
public/assets/            tus imágenes y sonidos (ver LEEME.md)
docs/GUIA_ARTE.md         reglas visuales + prompt para ChatGPT
```

## Control de precisión

Todo se ajusta en `src/config/constants.js` → `PLAYER`:

- **Física a paso fijo (120 Hz)**: el salto es idéntico en cualquier monitor.
- **Coyote time (80 ms)**: puedes saltar justo después de dejar un borde.
- **Jump buffer (110 ms)**: si presionas salto un poco antes de tocar el piso, igual salta.
- **Salto variable**: soltar antes corta la subida (de ~8 px con un toque a ~50 px manteniendo).
- **Caída más rápida que la subida** y una pequeña flotación en la cima.
- **Toques nunca perdidos**: las teclas se leen por evento, así que un toque de menos de un frame cuenta.
- **Hitbox menor que el sprite**: el jugador muere solo cuando "de verdad" toca.

## Crear niveles

Edita o copia `src/levels/level01.js` y regístralo en `src/levels/index.js`.

Para probar un nivel directamente, abre el juego con `?level=N` en la URL, por ejemplo `http://localhost:5173/?level=2`.

| Nivel | Nombre | Qué agrega |
|---|---|---|
| 1 | Bienvenido | Presenta cada trampa por separado |
| 2 | Confianza | Combina trampas: aplastadores en serie bajo techo bajo, láseres alternados, puente falso con láser, foso con pincho oculto |
| 3 | Movimiento | Plataformas móviles, sierras, pantalla que avanza sola; tiempos de trampas más duros |
| 4 | Ascenso | Casi dos pantallas de alto; aplastadores + láser sin pausa, salto entre plataformas que se cruzan; tiempos aún más duros |

### Dificultad por nivel

Cada nivel puede endurecer las trampas con `tuning`, usando los mismos nombres de `TRAPS` en `src/config/constants.js`:

```js
tuning: { LASER_OFF_MS: 900, CRUSHER_SHAKE_MS: 120, PLATFORM_SPEED: 60 }
```

### Pantalla que avanza sola

```js
autoscroll: { from: 46, to: 102, speed: 55 }  // columnas y px/s
```

Empieza cuando el jugador pasa la columna `from` y termina cuando el borde derecho de la pantalla llega a `to`. Quedarse atrás mata; una franja roja en el borde izquierdo avisa.


| Carácter | Significado |
|---|---|
| `#` | Bloque sólido |
| `P` | Inicio del jugador |
| `E` | Salida |
| `^` | Pincho visible |
| `h` | Pincho oculto |
| `F` | Piso falso |
| `L` | Láser por ciclos (se pone en la celda superior; el haz baja hasta el suelo) |
| `l` | Láser desfasado medio ciclo (alterna con `L`) |
| `C` | Aplastador: cae cuando pasas debajo (se pone donde cuelga) |
| `-` | Plataforma móvil horizontal (varias seguidas = una más ancha) |
| `I` | Plataforma móvil vertical (varias seguidas = una más ancha) |
| `S` | Sierra horizontal sobre riel |
| `s` | Sierra vertical sobre riel |
| `:` | Tope invisible: limita el recorrido de plataformas y sierras |

Las plataformas y sierras van de ida y vuelta hasta topar con un bloque sólido o un `:`. Arrancan hacia el extremo más lejano.

Las plataformas verticales son sólidas solo desde arriba: se atraviesan desde abajo y de lado. Si bajan sobre el jugador, lo aplastan. Saltar desde una plataforma horizontal conserva su impulso.
| `.` | Vacío |

## Terreno automático

No hay que pintar tiles a mano: cada `#` del mapa se dibuja solo. `TerrainBuilder` toma el bloque verde de 32×32 del tileset, lo corta en cuartos de 8×8 y elige para cada cuarto su pieza según los vecinos (esquina, borde, esquina interior o relleno). Así cualquier forma de nivel queda con bordes limpios.

El piso falso (`F`) usa exactamente la misma textura que el terreno de su posición: es indistinguible hasta que lo pisas.

Para usar otro bloque como base, cambia `terrainBlock` en `src/config/tileset.js`.

## Audio

Todo se configura en `src/config/audio.js`: qué archivo suena en cada evento, su volumen y la lista de pistas de música.

- Cada nivel elige su música con `music: 'coolsong1'` en su archivo. Solo se cargan las pistas que usa algún nivel.
- La música se carga en OGG (unas 10 veces más liviano); el WAV queda de respaldo para navegadores sin OGG. Si agregas una canción nueva en WAV, conviértela con:
  `ffmpeg -i cancion.wav -c:a libvorbis -q:a 5 cancion.ogg`
- La música no se reinicia al morir; al cambiar de nivel con otra pista hace un fundido.
- El láser y el aplastador suenan más bajo cuanto más lejos están de la cámara.
- Morir por una trampa oculta (pincho oculto, aplastador) dispara la risa.

## Efectos de impacto

Valores en `FX` dentro de `src/config/constants.js`. Cada trampa declara cómo mata con `static deathKind`:

| Muerte | Efecto |
|---|---|
| Cualquiera | Sacudida de 3 px que se calma en 10 frames (el HUD no tiembla) |
| Corte (pinchos, sierras) | 10 gotas saliendo del punto de contacto + estrella de impacto de 4 frames |
| Aplastador | 10 gotas hacia los lados |
| Láser | El robot se quema y queda en cenizas (`player-ash.png`) |
| Caída al vacío | Solo la sacudida |

## Transición entre niveles

Al tocar la salida, la pantalla se cierra en un círculo negro sobre el robot (`level_close`) y el siguiente nivel se abre desde su posición (`level_open`). Al morir no hay transición: el reinicio es inmediato. Los tiempos están en `TRANSITION` dentro de `src/config/constants.js`.

## Agregar una trampa nueva

1. Crea `src/traps/MiTrampa.js` extendiendo `Trap` (o `Spike`).
2. Regístrala con un carácter en `src/traps/index.js`.
3. Úsala en el mapa ASCII.
