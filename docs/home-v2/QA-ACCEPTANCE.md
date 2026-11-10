# Home v2 — aceptación de QA local

Fecha: 2026-11-09. Rama: `feature/home-v2-audit`. Revisión de entrada: `70533c2338cb82ec74372863808d5c60e45246dc`.

**Resultado:** validación funcional local con correcciones; la salida a producción queda condicionada a los recursos y verificaciones externas indicados abajo. No hubo push, cambios en main ni despliegue. El sitio sigue siendo Astro estático; no se atribuye al build ninguna evidencia de publicación en Nginx.

El SHA final se entrega al cerrar el commit en el recibo local `.artifacts/home-v2-qa/final-receipt.json` y en el resumen de entrega. El reporte local de esa misma carpeta incluye el SHA completo; el documento versionado no intenta contener su propio hash.

## Verificaciones

| Área | Resultado y alcance |
| --- | --- |
| `pnpm astro check` | 0 errores, 0 warnings, 10 hints. Batería general ejecutada una vez. |
| `pnpm test` | 82 pruebas aprobadas en 15 archivos. Ejecutado una vez; no se repitió la suite por cambios posteriores de CSS/assets. |
| `pnpm build` | 78 páginas estáticas. Tras la batería se reconstruyó únicamente al corregir contrastes, movimiento, assets y CLS demostrados en navegador. |
| Diagnósticos posteriores dirigidos | Último pase: 7 archivos, 0 errores, 0 warnings, 0 hints. Configuración temporal acotada al shell, encabezados y controlador de escenas modificados; no otra batería general. |
| Playwright | 8 grupos aprobados con Chrome 157. Matriz ES/EN en 390, 768 y 1440 px, ambos temas; recorridos adicionales a 1024 × 600 y 1350 × 940. Sin excepciones JS ni recursos locales solicitados con 404 en los recorridos aceptados. |
| Temas | Sistema, claro/oscuro manual, retorno a sistema, recarga, navegación, atrás, cambios del sistema, sincronización entre pestañas y storage bloqueado. El head selecciona el tema incluso bloqueando scripts externos. |
| Menús y teclado | Drawer abierto al final de la página, submenús, Escape, devolución y contención de foco, cambio de tema móvil; tabs con flechas/Home/End y paneles asociados. |
| Movimiento | Progreso hacia delante/atrás, fallback cuando el contenido no cabe, movimiento reducido inicial/dinámico, cancelación del parallax heredado, navegación sin IntersectionObserver. |
| Sin JavaScript | FAQ, contenido de escenas, hijos del bento y navegación alternativa legibles. Formulario deshabilitado con alternativa de contacto; Enter no añade datos a la URL. El tema sin JS usa el fallback claro. |
| Formulario | Éxito, error, reintento, reset, anuncios accesibles y mapping comprobados contra un backend interceptado de prueba. No hubo solicitudes comerciales reales. Configuración sintética de QA en el build local, no configuración de producción. |
| Rutas y regresión compartida | Targets internos de la home y anclas comprobados. Smoke de módulos ES/EN, MirAI ES/EN, arquitectura ES/EN, Marketplace, Developer, documentación, privacidad, términos y soporte. No es comparación visual exhaustiva de las 78 páginas. |
| SEO/i18n | Un H1, `lang`, títulos propios de home v2, canonical ES/EN, metadatos, alternates y enlaces existentes preservados. Traducción de placeholders, etiquetas de menú e indicación de destinos Developer solo ES. OG existente conserva ruta y tamaño; pendiente actualización editorial/saneamiento. |
| AGENTS.md | Sin edición de documentación, help o capacidades generadas. Sin dependencias nuevas en package.json/lockfile. Trabajo en la rama existente. |

## Problemas demostrados y corregidos

| Problema | Evidencia y corrección |
| --- | --- |
| Títulos casi invisibles en oscuro | Los selectores de hover sin escapar invalidaban las listas CSS que aclaraban `text-slate-800/900`. Se escaparon correctamente, conservando superficies y paleta. |
| Menú móvil fuera de pantalla al abrir después de scroll | Reproducido con menú en coordenada negativa. `overflow-x-hidden` en body establecía un contenedor de scroll incompatible con el bloqueo del drawer; `overflow-x-clip` conserva el header sticky. Se añadieron `inert`, contención de foco y cancelación del reset pendiente. |
| Sistema inaccesible desde el control compacto | El control de escritorio solo alternaba claro/oscuro. Ahora recorre sistema/claro/oscuro, anuncia la siguiente elección y mantiene una elección manual aunque storage esté bloqueado. |
| Flash potencial con storage bloqueado | El `catch` del script temprano omitía también la lectura de la preferencia del sistema. Se aisló la lectura del storage para resolver el tema antes de cargar el JS externo. |
| Nodos y líneas descentrados durante reveal | El transform del reveal sobrescribía el centrado de nodos/chips. El centrado usa `translate` independiente, conservando la animación y la composición. |
| Sticky con texto más alto que la pantalla | Las escenas pasan a flujo normal cuando las columnas más padding no caben; el pin respeta la altura del header. Se verificó también escritorio bajo. |
| CLS alto durante inicialización de sticky | Lighthouse de escritorio registró 0.68. El controlador activaba temporalmente el layout para medirlo y lo retiraba, incluso durante la carga de fuentes. Ahora mide columnas sin activar ese layout transitorio; se añadió regresión de CLS antes de cualquier interacción. |
| Movimiento reducido incompleto | El parallax heredado solo consultaba la preferencia al iniciar. Ahora limpia transforms al cambiarla; también se desactiva smooth scroll. Los reveals ya mostrados no vuelven a ocultarse al restaurar movimiento. |
| Degradación sin JS y formulario nativo GET | FAQ e hijos del bento podían quedar ocultos. Se restauró su lectura y navegación alternativa. El submit nace deshabilitado y se habilita al instalar el handler; sin JS hay instrucciones y alternativa, sin fuga de campos por URL. |
| Contraste de texto pequeño | Se corrigieron pestañas activas, controles de idioma/tema, textos secundarios, encabezados compartidos, botones sobre naranja y enlace WhatsApp. Se conservan color de marca, estructura, imágenes y gradientes. |
| Metadatos antiguos y texto ES en EN | Las páginas no utilizaban `homeV2.meta` ya definido. Ahora lo usan; los placeholders y avisos hacia Developer ES están localizados. |
| Promesas comerciales no acreditadas | Se retiraron uptime numérico, backups diarios y plazos fijos de la FAQ/footer. La nueva home mantiene las reservas de disponibilidad de Studio, automatizaciones, Website, Marketplace y plugin. MirAI, MCP ERP y MCP Hub conservan alcances distintos. |
| Marca con tamaño de descarga excesivo | Medición inicial: favicon 1.19 MB y logos 0.48/0.41 MB transferidos. Astro genera favicon 32 px, touch icon 180 px y logos PNG a 280 px; no se reemplazaron ni modificaron los originales. |

## Rendimiento medido

Lighthouse 13.6.0, navegación fría contra preview local, con configuración sintética. No tráfico real ni certificación de Nginx, TLS, caché o compresión productivos. Móvil usa el perfil predeterminado; escritorio usa `--preset=desktop` y preferencia oscura. Ejecuciones secuenciales, sin otras pruebas de navegador en paralelo.

| Ejecución final | Performance / accesibilidad / SEO | LCP | CLS | TBT | Transferencia total |
| --- | --- | --- | --- | --- | --- |
| Home ES, móvil | 100 / 100 / 100 | 1.351 s | 0.000009 | 48 ms | 324,989 B |
| Home EN, escritorio oscuro | 100 / 100 / 100 | 0.327 s | 0.000520 | 0 ms | 324,471 B |

Ambas mediciones finales cumplen los objetivos **de laboratorio** de LCP y CLS. La primera medición móvil transfería 2,371,819 B; la reducción es aproximadamente 86 %. El CLS de escritorio previo a corregir la inicialización era 0.679782. La regresión Playwright de arranque observó 0.000464 (ES) y 0.000362 (EN), antes de interacción.

Reportes locales: [Lighthouse móvil](../../.artifacts/home-v2-qa/lighthouse-final-es-mobile.report.html), [Lighthouse escritorio](../../.artifacts/home-v2-qa/lighthouse-final-en-desktop.report.html) y sus `.report.json`. Best Practices es 96 en ambos: el preview estático no sirve los endpoints de la API sintética y Lighthouse registra sus respuestas 404. Los recorridos Playwright interceptan esos endpoints; no se trata de imports, capturas o recursos estáticos rotos. No se ocultó ese resultado ni se confundió con fallo de producción.

**INP no está medido.** TBT es un indicador de laboratorio diferente y no demuestra INP ≤ 200 ms. LCP ≤ 2.5 s y CLS ≤ 0.1 son objetivos contrastados con cada ejecución, no garantías de p75 en producción. La regresión automatizada comprueba además CLS de arranque en ambas home de escritorio.

El SDK y React siguen siendo los mayores paquetes JS: aproximadamente 61.6 KB y 65.8 KB gzip respectivamente en el build inspeccionado. Lighthouse inicial sugirió unos 85 KiB de JS no usado en ese recorrido; gran parte corresponde al chat/SDK compartidos. No se retiró funcionalidad para mejorar un score. El chat conserva hidratación `client:idle`.

Scroll usa un único rAF pendiente por controlador, con listeners pasivos; las escenas miden como máximo dos contenedores animados por evento en escritorio y no mantienen un loop JS en reposo. La inicialización/resize mide columnas fuera del handler de scroll. El parallax heredado queda acotado a decoraciones y respeta movimiento reducido; posible consolidación futura solo si una traza de dispositivo real lo justifica.

## Evidencia visual local

Capturas PNG generadas por Playwright y revisadas en esta sesión, bajo `.artifacts/home-v2-qa/` (ignorado por Git):

- [Home ES escritorio claro](../../.artifacts/home-v2-qa/after-es-1440-light.png) y [oscuro](../../.artifacts/home-v2-qa/after-es-1440-dark.png).
- [Home EN tableta](../../.artifacts/home-v2-qa/after-en-768-light.png) y [móvil oscuro](../../.artifacts/home-v2-qa/after-en-390-dark.png).
- [Formulario oscuro](../../.artifacts/home-v2-qa/after-1440-dark-contacto.png), [drawer oscuro](../../.artifacts/home-v2-qa/after-mobile-menu-dark.png) y [escena Crear](../../.artifacts/home-v2-qa/after-1440-light-crear.png).
- [Sin JavaScript](../../.artifacts/home-v2-qa/after-no-js.png).

La carpeta contiene también capturas `before-*`, logs, JSON de navegador, diagnóstico de assets y reportes Lighthouse. No se publicaron estos archivos: algunas capturas de producto heredadas muestran identidades de perfil. Los enlaces locales no estarán disponibles en un clon del PR; adjuntar únicamente evidencia saneada cuando se comparta fuera de este workspace.

axe se ejecutó tras revelar el contenido en cuatro combinaciones ES (móvil/escritorio × claro/oscuro), además de Lighthouse. Los números grandes de implementación son decorativos, de bajo contraste y `aria-hidden`; sus flags se conservan en el JSON y se separan explícitamente de hallazgos de contenido funcional. No se afirma conformidad WCAG completa ni se altera su apariencia para eliminar un aviso automático.

## Condiciones antes de producción

1. **Recursos:** completar las capturas `HV2-*` pendientes y sustituir/sanear las imágenes históricas de Inicio/MirAI/OG. Los placeholders actuales están identificados y no simulan producto, pero no constituyen una entrega visual terminada para campaña pública.
2. **Integración real:** comprobar Growth, consentimiento, Turnstile si se configura y chat en una demo autorizada con sus servicios reales; el pase local intercepta las solicitudes. No se verificaron DNS, OAuth de terceros ni publicación del plugin.
3. **Producto:** confirmar disponibilidad comercial de capacidades de la matriz antes de ascender sus etiquetas. No hay listing/aprobación de terceros acreditado en esta fase.
4. **Operación:** revisar configuración de Nginx/CSP/cache, publicar solo tras autorización y ejecutar smoke en el destino. INP y p75 de Core Web Vitals requieren datos de campo o sesiones representativas; no están certificados aquí.

Pendientes no bloqueantes para revisión de código: 10 hints del checker general; cuatro números decorativos señalados por axe por cada combinación revisada; evaluación manual con lector de pantalla, touch físico, Safari y Firefox; optimización futura del SDK si una traza real justifica separarlo. La evidencia de regresión visual se limita a los viewports/páginas indicados. La auditoría global de privacidad preexistente de fase 1 no se repitió: el inspector aplicado a 22 archivos cambiados detectó **0 hallazgos introducidos y 1 conservado** en una línea de atribución preexistente de SiteHead, comparada con la revisión de entrada. Esto no equivale a aprobación global de privacidad. UTF-8 y `git diff --check` correctos.

## Archivos modificados en QA

- Home y mensajes: `src/components/home/HomeScenes.astro`, `SceneCreate.astro`, `src/i18n/home-v2.ts`, `es.ts`, `en.ts`, `src/pages/index.astro`, `src/pages/en/index.astro`.
- Shell/tema/assets: `src/components/layout/Header.astro`, `Footer.astro`, `SiteHead.astro`, `ThemeToggle.astro`, `src/layouts/BaseLayout.astro`, `src/styles/theme.css`, `global.css`, `home-v2.css`.
- Accesibilidad compartida: `src/components/sections/ContactSection.astro`, `FaqSection.astro`, `ImplementationSection.astro`, `src/components/ui/SectionHeading.astro`.
- Scroll y regresión: `src/lib/scenes.ts`, `scripts/qa-home-v2.mjs`.
- Entrega: este reporte. No se modificaron fuentes generadas ni originales gráficos.

## Reproducción y preparación de PR

El script de navegador usa Playwright existente, sin añadir dependencia al sitio. Configurar `RUNLY_QA_PLAYWRIGHT_MODULE` con el archivo de entrada del paquete si no está instalado en Web; `RUNLY_QA_AXE_PATH` permite usar axe existente. `RUNLY_QA_URL` acepta solo loopback (por defecto puerto 4322); `RUNLY_QA_FILTER` selecciona grupos dirigidos separados por `|`.

Para el build de prueba, configurar `PUBLIC_RUNLY_API_URL` al mismo origen local con ruta `/__qa-api`, `PUBLIC_RUNLY_COMPANY=qa-demo`, `PUBLIC_RUNLY_CONTACT_FORM_ID=qa-contact`, y dejar vacías las integraciones opcionales externas. Son fixtures: no publicar ese `dist` ni guardar credenciales reales en el script. Iniciar `pnpm preview --host 127.0.0.1 --port 4322` después del build y ejecutar `node scripts/qa-home-v2.mjs`. El script bloquea servicios externos e intercepta el backend; el objetivo es probar UI y contrato, no persistencia ERP.

Título sugerido de PR: **Home v2 con temas, accesibilidad y validación estática**.

Descripción sugerida: La home ES/EN presenta la plataforma mediante escenas, conserva las rutas comerciales y añade preferencia de tema persistente. QA corrige menú móvil, lectura sin JS, contraste, control de movimiento, estabilidad de sticky y tamaño de assets; mantiene el formulario y el SDK compartidos. Validación: checker general sin errores/warnings, 82 tests, build de 78 páginas y recorridos Playwright/Lighthouse documentados. La publicación queda condicionada a capturas seguras, verificación de servicios reales y autorización de despliegue.
