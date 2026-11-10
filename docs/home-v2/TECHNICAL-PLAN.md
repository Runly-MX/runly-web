# Auditoría técnica y arquitectura propuesta

Fecha: 2026-11-09. No cambia la interfaz, dependencias, contratos, documentación generada ni despliegue. Es investigación estática y editorial; la auditoría visual está bloqueada según [VISUAL-ASSETS.md](VISUAL-ASSETS.md).

## Estado actual y dependencias

| Superficie | Hallazgo comprobado en código | Reutilización o acción futura |
| --- | --- | --- |
| `src/pages/index.astro` y `src/pages/en/index.astro` | Composición estática de secciones compartidas con `dict`. ES incluye `MarketplaceTeaserSection`; EN no. Ambas inicializan `contactForm.dataset.renderedAt`. | Mantener SSG y equivalencia editorial. No introducir una segunda aplicación React para el marketing. Conservar inicialización de formulario. |
| `src/layouts/BaseLayout.astro` | Importa cinco pesos de Plus Jakarta Sans, estilos, `SiteHead`, reveal con IntersectionObserver, parallax, analytics y chat `client:idle`. Body fija fondo claro. | Conservar shell y singleton SDK; revisar alcance global antes de cambiar. Las páginas de catálogo, legales, documentación y MirAI comparten infraestructura. |
| `Header.astro` | Sticky, menú desktop con viewport animado, móvil por niveles, `inert`, Escape y manejo de foco. Mezcla textos del diccionario con etiquetas fijas ES. | Aprovechar lógica existente. Traducir etiquetas residuales cuando se trabaje navegación; verificar teclado real y contraste por tema. `focus:outline-none` exige indicador alternativo verificable. |
| `Footer.astro` | Links legales, catálogo, Developer, docs solo ES y Marketplace con flag. Uptime proviene de texto del diccionario, no de un monitor en vivo. | Conservar destinos y kill switch. No presentar el indicador como telemetría sin una fuente real. |
| `SiteHead.astro` | Canonical con slash, hreflang, OG por idioma, Twitter, JSON-LD y `noindex`. `hasEnglish` exceptúa documentación por defecto. | Reutilizar. Para páginas nuevas o solo ES declarar disponibilidad de traducción explícita; no inventar alternates. |
| `src/styles/global.css` | Tokens de marca y utilidades glass, gradientes, puntos, reveal, float, bento y menús; estilos `.doc-prose`/`.mod-*` comparten archivo. No sistema de tema claro/oscuro global. | Añadir tokens semánticos y aislar estilos de escenas; no reemplazar global.css ni cambiar documentación accidentalmente. |
| `Hero.astro` | Tour con tres capturas, WebP responsivo, ratio reservado, autoplay WAAPI de 5 s, teclado izquierda/derecha, pausa hover/visibilidad y selección manual que detiene autoplay. Las tres imágenes son eager; solo primera tiene prioridad alta. | Conservar asset pipeline y ratio; evaluar sustituir carrusel por relato. Si sigue autoplay, pausa explícita accesible y pausa por foco; comprobar Home/End y relación tab/panel. No asumir que lo existente ya cumple todo el patrón ARIA. |
| Secciones de argumentos | About tiene isotipo decorativo; Flexibility, Implementation y WhyChoose repiten cards, badges, colores y bento. MultiCompany dibuja una maqueta HTML. | Reusar contenido útil y `SectionHeading`, evitar repetir el mismo argumento. Maqueta no es captura real. |
| Catálogos | `ModulesCatalogSection` usa `ModuleFlipCard`, seis IDs y `src/data/modules.ts`. `ModulesFullCatalogSection`, clasificación y arquitectura alimentan otras páginas. | No eliminar componentes compartidos por retirar una sección de la home. No convertir datos comerciales estáticos en inventario vivo ni hardcodear cifras. |
| Marketplace | Teaser ES tiene copy fijo; páginas `src/pages/marketplace/` consumen proyecciones al build, controlan estados, confianza y `noindex`. `src/lib/marketplace-nav.ts` permite ocultar navegación con `PUBLIC_MARKETPLACE_NAV=0`. | Mantener rutas, filtros de sitemap y estados honestos. Revisar coherencia del teaser con disponibilidad real, sin tocar instalación desde marketing. |
| FAQ | Botones con `aria-expanded` y paneles ocultos, script de acordeón. Sin JS, las respuestas siguen ocultas. | Mejorar progresivamente en implementación: contenido legible sin JS (por ejemplo con patrón nativo adecuado), manteniendo traducciones. Asociar región y título. |
| Contacto | `ContactSection` usa singleton `runlySdk.forms.submit`, campos mapeados a claves Growth, honeypot, Turnstile opcional, idempotencia, estados y reset. | Preservar contrato. Mensajes de resultado necesitan anuncio accesible; comprobar `aria-live`/alert y foco. No enviar un lead real en esta fase. |
| SDK, chat y analytics | `src/lib/runly-sdk.ts` crea `createStorefrontClient` solo con configuración. Chat `ChatWidgetIsland.tsx` comparte cliente; analytics respeta configuración y no otorga consentimiento automáticamente. | Mantener una instancia, `client:idle` y estado sin configuración. Verificar posteriormente integración de tema con API real del widget; no atribuirle props no comprobadas. |
| i18n | `src/i18n/index.ts`, `types.ts`, `es.ts`, `en.ts`, pruebas de diccionario. | Añadir mensajes de home y tema a ambos diccionarios y tipos. No traducir documentos generados a mano. |

Durante la auditoría otra sesión consolidó `66b6943` y sustituyó el archivo local de capacidades por `src/data/module-capabilities.json`, generado desde el ERP. El `AGENTS.md` actualizado prohíbe editar ese JSON a mano; su fuente es `../runly/apps/api/src/manifests/official/help/capabilities.json` y se sincroniza con `scripts/sync-help-content.mjs`. No introducir una nueva copia de capacidades para la home ni modificar la generada en este rediseño. `src/data/modules.ts` sigue siendo el catálogo editorial local.

Se inspeccionaron las secciones de la home y los recursos de las páginas relacionadas. No se ejecutaron recorridos interactivos. Los hallazgos de jerarquía y repetición son editoriales/estructurales, no mediciones visuales de un render actual.

## Deuda prioritaria

1. **Bloqueante comercial:** copy más amplio que la evidencia de lanzamiento, en particular Marketplace, Website y garantías operativas. Resolver con matriz y dueño de producto.
2. **Bloqueante de recursos:** capturas históricas con datos identificativos y prueba pobre de flujos. Rehacer antes de publicar nuevas piezas.
3. **Alta:** tema inexistente como sistema; colores directos en body, cards, menús y documentación impiden resolverlo con un solo `dark:`.
4. **Alta:** fallback sin JS incompleto: FAQ oculta respuestas; `.bento-stagger > *` inicia oculto y el `noscript` actual solo restaura `.reveal-on-scroll`, no necesariamente sus hijos. Probar contenido real con JS desactivado.
5. **Media:** parallax lee geometría de todos los elementos en cada actualización; transform inline puede sustituir transforms de posicionamiento. Separar capa de posición y capa animada; medir antes de ampliar efectos.
6. **Media:** interrupción por foco, cambio de preferencia de movimiento en vivo, smooth scroll y contraste no quedan cubiertos por la mera presencia de una media query. Hay reducción de movimiento parcial, no certificación completa.
7. **Media:** divergencia ES/EN, etiquetas fijas y cantidades/comentarios históricos. No deducir número actual de módulos del texto de un botón ni del comentario de una sección.

## Tema claro/oscuro real

Propuesta sin dependencias nuevas:

- Modelo de preferencia: `system | light | dark`. Guardar solo la elección local bajo una clave de sitio, por ejemplo `runly.theme`. Resolver `system` con `matchMedia('(prefers-color-scheme: dark)')`.
- Pequeño script inline en el head, antes de pintar, aplica `data-theme` y `color-scheme` al elemento raíz. Validar el valor leído; envolver storage en `try/catch`; sin storage, seguir sistema. Respetar CSP existente al implementar, sin relajar políticas para ejecutar el script.
- Control accesible con las tres opciones, nombre localizado y selección perceptible. Escuchar cambios del sistema solo cuando esté en `system`; sincronizar otras pestañas con `storage`. Evitar transiciones globales durante el primer paint.
- Definir tokens semánticos para fondo, superficie, superficie elevada, texto, texto tenue, borde, acento, foco y overlay en ambos temas. Conservar tokens de marca como referencias, no como equivalentes de superficie.
- Migrar colores directos de home y shell a tokens. Revisar después páginas consumidoras del layout, documentación, Marketplace, formularios, menus, Turnstile y widget. Una escena oscura intencional necesita su propio alcance de contraste, no invertir todos sus colores al cambiar tema.
- Seleccionar logo adecuado por tema conservando tamaño. Las capturas usan tema auténtico; no filtros de inversión. Recurso sin versión oscura puede mostrarse dentro de su marco claro, con contraste correcto.

## Scroll y animación progresiva

Contenido semántico y estático primero. El HTML debe incluir todo el mensaje, CTA y alternativa textual de cada prueba. Solo después de inicializar la animación se habilitan estados de entrada; una excepción no puede dejar contenido transparente.

Usar IntersectionObserver para activar escenas próximas y CSS/WAAPI para transiciones de `opacity` y `transform`. Animación ligada al progreso con CSS scroll-driven solo como mejora bajo detección de soporte; el fallback muestra secuencia estática. Si hace falta JS de progreso, un único controlador con rAF, listeners pasivos, medidas al resize y trabajo limitado a la escena activa. No incorporar GSAP, smooth-scroll, WebGL o canvas sin necesidad demostrada y aprobación de alcance.

Sticky puede usarse en escritorio para una prueba acotada si aporta comprensión; debe terminar antes de atrapar la lectura. Sin secuestro de rueda, sin convertir scroll en paginación obligatoria y sin CTA fuera de alcance. Animación de textos no debe duplicar contenido accesible ni alterar el orden de foco.

En `prefers-reduced-motion: reduce`: todo visible, sin parallax, float, scrub, autoplay ni smooth scroll. Capturar cambio de preferencia durante la sesión y cancelar/reiniciar animaciones correctamente. Hacer el mismo recorrido como lectura lineal; no ocultar escenas por falta de soporte.

## Móvil y rendimiento

En móvil preferir secuencia en flujo normal, titulares cortos y capturas enfocadas. No arrastrar una ventana de escritorio de 1900 px a 320 px. Evitar pinned stages altos en landscape, `100vh` rígido y capas que compitan con menú/chat. Comprobar zoom 200 %, ancho de 320 px, safe areas y targets cómodos de al menos 44 px cuando sea posible.

Reusar `astro:assets`/Sharp para tamaños y formatos. Priorizar una sola imagen LCP y cargar las siguientes de forma diferida; reservar dimensiones. Evitar cargar variantes light/dark y todos los cuadros de una secuencia en eager. Reducir blur y sombras de gran superficie en móvil. Mantener fuentes locales y justificar pesos realmente usados.

Objetivos de aceptación, no resultados medidos: LCP ≤ 2.5 s, CLS ≤ 0.1 e INP ≤ 200 ms en p75 cuando exista RUM suficiente. Antes de publicar, medir laboratorio móvil con configuración reproducible y comparar con baseline del mismo entorno; Lighthouse/TBT no sustituye INP de campo. Presupuesto inicial propuesto: JS adicional de relato+tema ≤ 15 KB gzip y primera prueba visual ≤ 250 KB servidos; medir y justificar cualquier excepción. SDK/chat se registran aparte y también cuentan en el peso total.

## Astro, SEO, idiomas y contratos que deben conservarse

- Mantener Astro SSG, `prerender`, `output: 'static'`, integración sitemap y React solo donde ya se necesita interactividad de producto. No instalar dependencias en esta fase.
- Un H1 por home, jerarquía H2/H3, landmarks, enlaces reales y texto indexable fuera de imágenes. Mantener canonical `/` y `/en/`, OG 1200 × 630, JSON-LD sin reseñas ni precios inventados.
- Conservar `#hero`, `#acerca-de`, `#modulos`, `#marketplace` donde exista, `#implementacion` y `#contacto`; si se fusionan escenas mantener anclas equivalentes sin IDs duplicados y scroll-margin para header sticky.
- Conservar `/modulos`, `/en/modulos`, `/arquitectura`, `/en/arquitectura`, `/mirai`, `/en/mirai`, `/runly-developer`, `/documentacion/**`, `/marketplace/**`, `/privacy`, `/terms`, `/data-security`, `/en/data-security`, `/support` y destinos actuales. No añadir `/en/marketplace/` o docs EN inexistentes; avisar destino ES.
- Mantener `noindex`, páginas runtime/unlisted y filtros Marketplace del sitemap. No hacer indexables fixtures o recursos pendientes mediante el rediseño.
- Formulario: preservar nombres HTML y mapping `fullname`, `companyname`, `email`, `phone`, `teamsize`, `interest`, `needs`, `consent`, `locale`; `data-form-id`, `renderedAt`, honeypot `website`, Turnstile opcional e idempotency key. No simular éxito si falta SDK/configuración. Datos de prueba solo en destino demo.
- Conservar variables públicas de configuración, lógica de consentimiento y enlaces de contacto existentes. No copiar valores reales del entorno a documentación.

## Secuencia de implementación posterior

1. Resolver disponibilidad comercial y elegir caso demo; obtener capturas seguras. Capturar baseline visual y de rendimiento cuando vuelva el navegador.
2. Proponer la dirección visual con marca actual y pruebas reales; validar encuadre, tono y recorrido antes de codificar la experiencia final.
3. Implementar tokens/tema y shell con regresión acotada en otras páginas; después escenas y animación progresiva.
4. Completar ES/EN y revisar SEO, anclas, Marketplace, formulario y chat. Cotejar todos los claims contra la matriz actualizada.
5. Aplicar [criterios de aceptación](ACCEPTANCE-CRITERIA.md). No desplegar, publicar ni hacer push sin la solicitud correspondiente.

## Verificación apropiada a esta fase

Solo revisión de documentos, enlaces internos, UTF-8, whitespace y privacidad; no suites de UI ni build de aplicación por cambios exclusivamente documentales. La sesión no ejecuta las pruebas históricas citadas como evidencia de otras entregas. El informe de ejecución de estos checks queda en `ACCEPTANCE-CRITERIA.md`.
