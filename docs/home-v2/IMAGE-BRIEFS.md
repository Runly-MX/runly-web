# Ilustraciones para la escena "Inteligencia y conexiones"

Cuatro imágenes generadas (no capturas de producto). Sirven para que la escena no sea solo vectores.

Las cuatro ilustraciones se generaron con OpenAI ImageGen el 2026-11-09 y se instalaron como WebP de 1600 × 1200. Se usan en ambos temas sobre el fondo oscuro de la escena.

## Cómo se instalan

Guardar cada archivo en `src/assets/home-v2/slots/` con el ID como nombre: `HV2-AI-01.webp`, `HV2-AI-02.webp`, etc. (también `.png`/`.jpg`). `ShotSlot` los detecta y reemplaza el placeholder sin tocar código. Ese mismo mecanismo sirve para cualquier slot de `VISUAL-ASSETS.md` (por ejemplo `HV2-04.webp`).

## Especificación común

- Formato 4:3, 1600 x 1200 px, WebP calidad 85.
- Se muestra sobre fondo azul noche (`#070D1E`), con bordes redondeados pequeños: la imagen debe tener su propio fondo oscuro, sin transparencia.
- Paleta de marca: naranja `#FF5E14`, ámbar `#FF9F1C`, azul medianoche `#0B132B`, blancos fríos. Un acento secundario por imagen (indicado abajo).
- Estilo: ilustración 3D / isométrica suave, materiales mate, iluminación lateral cálida. Sin texto, sin logotipos de terceros, sin personas, sin marcas de OpenAI/Anthropic.
- No simular pantallas del producto ni datos: deben leerse como ilustración conceptual.
- Alt en la página: el nombre del nodo. Registrar la herramienta y fecha de generación.

## Briefs

| ID | Nodo | Concepto | Acento |
| --- | --- | --- | --- |
| HV2-AI-01 | MirAI (dentro de Runly) | Un panel de conversación flotante con burbujas abstractas y un destello tipo "chispa" que apunta a una tarjeta de registro; sugiere preguntar y confirmar. | violeta `#8B5CF6` |
| HV2-AI-02 | MCP de Runly | Un enchufe/conector que une una torre de módulos (bloques apilados) con un asistente externo representado por una esfera; un candado discreto en el cable (acceso autorizado). | naranja |
| HV2-AI-03 | MCP de Developer Hub | Un banco de trabajo con bloques de módulo en ensamblaje, una pieza encajando y una cinta de verificación; sensación de construir y validar. | teal `#0E7490` |
| HV2-AI-04 | Plugin para ChatGPT | Una ventana de chat genérica conectada por un cable a la esfera de Runly. Sin logotipos ni nombres de terceros; estado "en integración" (conexión parcial, un tramo punteado). | esmeralda `#059669` |

## Fuera de alcance

No generar imágenes que insinúen aprobación de OpenAI, tiendas de terceros ni integración general disponible. La disponibilidad se comunica con el texto de la escena, no con la ilustración.
