# Assets

Si falta algún archivo, el juego usa un placeholder y sigue funcionando.
Las rutas se configuran en `src/config/assets.js` y las piezas del tileset en `src/config/tileset.js`.

| Carpeta | Archivo | Estado |
|---|---|---|
| `sprites/player/` | `player.png` | ✅ 8×2 frames de 32×32 |
| `sprites/player/` | `player-ash.png` | ✅ 6 frames de 32×32 (muerte por láser) |
| `tilesets/` | `tileset.png` | ✅ tiles de 16×16 (288×160) |
| `backgrounds/` | | Capas de parallax 480×270 |
| `traps/` | `saw.png` | ✅ sierra, 2 frames de 16×16 |
| `traps/` | `spike.png` | ✅ pincho oculto, 4 frames de 16×16 (vacío → completo) |
| `traps/` | `moving-platform.png` | ✅ plataforma móvil, 3 piezas de 16×16 (izquierda, centro, derecha) |
| `enemies/` | | |
| `ui/` | | Íconos, botones |
| `fonts/` | | Fuente bitmap pixel |
| `audio/sfx/` | varios | ✅ asignados en `src/config/audio.js` |
| `audio/music/` | `coolsongN.ogg` + `.wav` | ✅ cada nivel elige con `music:`; se usa el OGG |
| `maps/` | | Mapas de Tiled `.json` |

## player.png

| Frames | Animación |
|---|---|
| 0–4 (fila 1) | idle |
| 8–15 (fila 2) | run |
| 11 | jump |
| 15 | fall |

Se cambia en `src/config/animations.js`. Si agregas frames de salto o muerte, ponlos en las columnas 5–7 de la fila 1.

## tileset.png — qué se usa (columna, fila en tiles de 16)

| Pieza | Posición | Uso en el juego |
|---|---|---|
| Bloque verde 2×2 | (3,1)–(4,2) | Base del auto-tile del terreno y del piso falso |
| Pinchos | (12,3) | Pincho visible y pincho oculto |
| Haz de luz | (12,1)–(13,2) | Salida del nivel |
| Láser, 4 estados | (12–15, 5–7) | Láser por ciclos: apagado, aviso, carga, encendido |
| Bloque con ojos | (9,1) | Aplastador |
| Panel oscuro 2×2 | (0,4)–(1,5) | Pared de fondo |

Disponibles para próximas iteraciones: cinta transportadora (8–10, 2), cajas (14–16, 0–1), bloque metálico 2×2 (5–6, 1–2), plataformas (filas 7 y 9), ventana con marco verde (0–2, 1–3).
