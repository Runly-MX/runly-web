# Home V2: corrección móvil

## Cambios

- Las ilustraciones 4:3 conservan su proporción completa: se eliminó el marco móvil 16:9 con recorte `cover`.
- Las capturas conservan su proporción, usan WebP de calidad 95 y no generan variantes mayores que la fuente. La presentación tampoco supera el ancho nativo.
- Las capturas no son controles interactivos. Se retiraron los enlaces e iconos de ampliación; el cambio de imagen sigue la preferencia de tema del sistema o manual.
- Parallax móvil limitado a ±18 px, con una inclinación máxima de 0.45° en ilustraciones. Usa el ciclo de scroll existente y observa solo imágenes cercanas al viewport; no ejecuta un bucle permanente.
- Entradas progresivas de las capas y transiciones al cambiar de pestaña. El movimiento se desactiva con `prefers-reduced-motion`, también al cambiar la preferencia durante la sesión.
- Ajustados la superposición de MirAI y el espaciado móvil. Corregido un desbordamiento real en inglés a 320 px causado por un CTA largo y el tamaño mínimo de las columnas.

## Verificación local

- `pnpm astro check`: 0 errores, 0 warnings, 9 hints de deprecación preexistentes en la configuración de contenido.
- `pnpm test`: 82 tests aprobados.
- `pnpm build`: 78 páginas.
- `scripts/qa-home-mobile.mjs`: 22 casos aprobados en Chrome headless, DPR 2. Anchos 320, 390, 430, 768 y 1440; ambos idiomas y temas, más ES/EN sin JavaScript. Comprueba proporciones, ausencia de desbordamiento, fuentes sin ampliación, ausencia de controles de ampliación, composición de empresas, teclado, transiciones, parallax y reducción de movimiento.
- Comprobaciones específicas existentes: tema manual/sistema, recarga, navegación, historial, almacenamiento bloqueado y entre pestañas; cambios de movimiento en vivo y ausencia de IntersectionObserver. Aprobadas sin errores de página.
- CLS de arranque medido en escritorio local: ES 0; EN 0.00051. No representa métricas de producción ni una medición de INP.

Las capturas y resultados locales se generan en `.artifacts/mobile-visual/` (ignorado por Git): `final-{ancho}-{tema}-{hero|illustration|create|companies}.png` y `results.json`. Se revisaron visualmente hero, creación e ilustraciones en móvil, tableta y escritorio. Para ejecutar el script, configurar `RUNLY_QA_URL` con el servidor local y, si Playwright no está instalado aquí, `RUNLY_QA_PLAYWRIGHT_MODULE` con una instalación existente.

## Límites

La captura del selector de empresa de 224 px se retiró. La escena usa ahora una composición conceptual con texto HTML y superficies con profundidad; no pretende ser una pantalla real. MirAI conserva su fuente de 390 px: para nitidez retina a mayor tamaño hace falta una captura de mayor resolución.

Validación en Chrome emulado; pendiente comprobar dispositivos físicos y Safari móvil. No se repitió Lighthouse completo ni se midió INP. No se realizó despliegue a producción.
