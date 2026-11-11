# Guía de arte — Nerves

Reglas fijas para que todos los assets (los tuyos y los que generes con ChatGPT) se vean como un solo juego.
**Estilo:** sci-fi industrial oscuro. Paneles metálicos azul marino con bordes verdes y un pequeño robot protagonista.

## Reglas técnicas (no negociables)

| Regla | Valor |
|---|---|
| Resolución interna del juego | 480 × 270 (se escala ×2, ×3, ×4…) |
| Tamaño de tile | 16 × 16 px |
| Frame del jugador | 32 × 32 px; centro del robot en x=15, pies tocando la fila 22 |
| Tamaño del personaje dentro del frame | ~14 × 16 px |
| Formato | PNG con transparencia real (sin fondo blanco/cuadriculado) |
| Suavizado | Ninguno: píxeles duros, sin antialias |
| Contorno | 1 px, color tinta `#0e0b20` |
| Luz | Desde arriba (bordes superiores más claros) |
| Transparencia parcial | Solo para luces y hologramas (ej. el haz de la salida) |

## Paleta (extraída de tileset.png y player.png)

**Entorno**

| Uso | Hex |
|---|---|
| Tinta / contorno | `#0e0b20` |
| Azul marino (interior del terreno) | `#161731` |
| Pizarra (pared de fondo) | `#24283c` `#2a3150` `#38435b` |
| Acero | `#47547b` `#7488aa` |
| Acero claro / brillos de metal | `#a0b8d4` |
| Verde oscuro (líneas internas) | `#13443f` |
| Verde (bordes del terreno) | `#2d814f` |
| Verde claro | `#56af56` |
| Verde brillo (luz superior) | `#88d660` |
| Rojo peligro (láser) | `#ca3134` |
| Salmón (brillo del láser) | `#f18681` |
| Naranja (cinta transportadora) | `#dc7037` |
| Blanco | `#eaeaea` |

**Robot**

| Uso | Hex |
|---|---|
| Sombra | `#7a6964` |
| Medio | `#ad978f` |
| Claro | `#d4b9a7` |
| Brillo | `#eadcca` |
| Ojos | `#99e65f` |

Los mismos valores están en `src/config/constants.js` → `PALETTE`.

## Lenguaje visual

- **Terreno:** bloques con borde verde y relleno azul marino oscuro. Se arma automáticamente desde el bloque verde del tileset.
- **Fondo:** paneles pizarra, más claros y menos saturados que el terreno, para que el suelo se lea como silueta.
- **Peligro:** acero claro (pinchos) y rojo (láseres). El rojo se reserva solo para lo que mata.
- **Interactivo / meta:** luces y hologramas (haz de la salida).
- **Trampas ocultas:** idénticas al entorno. El piso falso usa exactamente la textura del terreno.
- **Hitbox siempre más pequeña que el dibujo** (tecla `B` en el juego).

## Plantilla de prompt para ChatGPT

Adjunta siempre `tileset.png` o `player.png` como referencia y copia este texto:

```
Pixel art 2D para un plataformero sci-fi, mismo estilo exacto que la imagen adjunta.
Objeto: [descripción, ej. "bloque aplastador metálico con ojos que cae del techo"].
Tamaño exacto: [16x16 / 32x32 / hoja de N frames de 32x32 en una fila].
Fondo transparente (PNG con canal alfa), sin sombra proyectada, sin texto.
Contorno de 1 px color #0e0b20. Luz desde arriba.
Usa solo esta paleta: #0e0b20 #161731 #24283c #2a3150 #38435b #47547b #7488aa #a0b8d4 #13443f #2d814f #56af56 #88d660 #ca3134 #f18681 #dc7037 #eaeaea.
Píxeles duros, sin antialias, sin degradados suaves. Vista lateral, sin perspectiva.
Alineado a una cuadrícula de 16 px.
```

Para personajes o enemigos, agrega la paleta del robot y:
`Frames de 32x32, personaje centrado horizontalmente, pies en la fila 22, mismo tamaño que el robot de referencia (~14x16 px).`

### Después de generar

ChatGPT casi nunca entrega el tamaño ni la cuadrícula exactos:

1. Reescala al tamaño objetivo con **vecino más cercano** (nearest neighbor), nunca bilineal.
2. Revisa que el fondo sea transparente de verdad.
3. Reduce los colores a la paleta (Aseprite: *Sprite > Color Mode > Indexed* con la paleta cargada).
4. Verifica que cada pieza caiga exacta en la cuadrícula de 16 px (las plataformas de la fila 7 del tileset actual no están alineadas).
