# Runly Marketplace & Solutions — Fase 0-C: auditoría de Runly Web

**Fecha:** 2026-11-07 · **Repositorio:** `runly-web`, rama `main` @ `fe6a512` (árbol limpio al inicio) · **Alcance:** solo lectura de `runly-web`.
**Estado:** propuesta para revisión. No se modificó código, autenticación, infraestructura ni despliegue; no hay migraciones, commits ni push; no se ejecutó ninguna suite ni E2E (el único cambio es este documento).

**Límites de esta auditoría.**
- Se recibió la auditoría ERP (0-B) completa. **El Plan Maestro v1.0 y la auditoría Developer Hub (0-A) no estaban adjuntos**; solo se conocen por las citas de 0-B (C-1..C-10, C-5, D-5, E-2). Los enunciados de **W-1..W-4** no estaban disponibles: están **inferidos** del encargo (ver §3) y deben confirmarse contra 0-A.
- No se inspeccionó `runly-developer-hub` ni `runly-erp` ni producción. Lo que dependa de ellos se marca **[verificar Hub]**. La configuración real de Nginx/CORS/CSP en la VPS no está en este repo: solo se conoce el bloque de ejemplo del README.
- Los conflictos con 0-A/0-B se señalan únicamente cuando se demuestran desde el código de este repo (§11).

---

## 1. Resumen ejecutivo

Runly Web **ya tiene el patrón correcto** para un marketplace público sobre un sitio estático, y ya está en producción para módulos: el Hub es la fuente de verdad, el build genera HTML indexable y el navegador refresca datos y marca lo retirado o revocado. Lo extensible es el *patrón*; el *código* hoy es específico de módulos (claves `custom.*`, un solo tipo, tarjetas duplicadas en Astro y en JS).

Conclusiones que cambian el plan:

1. **`/modulos` no debe tocarse.** La extensión debe ser **paralela** (endpoint nuevo del Hub + biblioteca nueva), porque `fetchDirectory` falla *todo el directorio* si el Hub sube `schemaVersion` (`marketplace.ts`, `schemaVersion !== 1` → "unavailable") y `normalizeModule` descarta en silencio cualquier entrada que no sea `custom.*`. Meter recursos en `modules[]` los haría invisibles; subir la versión rompería `/modulos` para todos (R1).
2. **La web no verifica firmas ni instala.** Muestra una *proyección de presentación* del Hub sin criptografía (ya está documentado en el código). Las páginas de Solutions son informativas; el camino de instalación es el ERP (0-B §5.4, R9). El sitio **no ofrece descarga directa de paquetes** en el MVP.
3. **El mayor riesgo operativo es la frescura del HTML estático**, no el diseño. El despliegue es manual en la VPS (`deploy-static.mjs`), sin CI ni disparador de reconstrucción; la meta documentada es "reconstruir en ≤24 h". Con 5 tipos de recurso y miles de páginas, un recurso revocado seguirá indexado hasta el próximo build. Hace falta un disparador de rebuild (propuesta §8.4) y que la señal de cambio la dé el Hub.
4. **La documentación de formatos tiene una cadena obligatoria `runly-erp → runly-web → Hub`**: cualquier doc de Marketplace debe nacer en `runly-erp/docs/developers`; el sync rechaza páginas "solo web" (W-3). Además el sync copia solo `*.md`: el JSON Schema de Studio **no** se publica en la web.
5. **Panel privado:** solo enlaces salientes a `https://devs.runly.mx`. Cero estado de sesión en la web (W-2/W-4).

**Ruta del documento:** `docs/architecture/MARKETPLACE_SOLUTIONS_PHASE0_WEB_AUDIT.md`.

---

## 2. Arquitectura actual y evidencia

### 2.1 Plataforma y despliegue

| Tema | Evidencia | Hallazgo |
|---|---|---|
| Framework | `package.json`, `astro.config.mjs` | Astro 7, `output: "static"`, Tailwind 4, React 19 **solo** para `ChatWidgetIsland` (SDK). Sin adaptador ni runtime Node en producción |
| i18n | `astro.config.mjs`, `src/i18n/{es,en}.ts`, `SiteHead.astro` | `es` por defecto sin prefijo, `en` bajo `/en`. Páginas duplicadas a mano en `src/pages/en/*`. Textos del Marketplace viven en `src/lib/marketplace.ts` (`MARKETPLACE_TEXT`), **no** en los diccionarios i18n. Slugs en español también en EN (`/en/modulos`) |
| SEO | `SiteHead.astro`, `astro.config.mjs` | canonical/hreflang/OG por página; `noindex` opcional; JSON-LD **idéntico en todas las páginas** (Organization + SoftwareApplication del sitio). Sitemap con `filter: !page.includes("/modulos/detalle/")` |
| Despliegue | `scripts/deploy-static.mjs`, README "Deploy" | En la VPS: `git pull`, `pnpm build`, `rsync --delete-after` con respaldo en `<target>.releases/`, health check (`/`, `/modulos/`, `/en/modulos/`) y restauración automática. Elimina páginas que ya no existen (clave para revocaciones). **No hay CI ni cron** |
| Contenido protegido | `deploy-static.mjs` (`P /catalog/**`, `REQUIRED_BUILD`) | `catalog/v1/index.json` es espejo de compatibilidad (vacío en el repo) y nunca se borra. `REQUIRED_BUILD` y el health check **están acoplados a `/modulos/`**: mover o renombrar esa ruta rompe el deploy |
| Cabeceras | README (bloque Nginx) | Solo `charset`; **no hay CSP** ni cabeceras de seguridad documentadas. README: "si Nginx añade CSP, `connect-src` debe permitir el Hub" |
| Configuración | `.env.example`, `src/lib/runly-sdk.ts` | Todo `PUBLIC_*`, inlineado en el build. `PUBLIC_RUNLY_HUB_URL` (default `https://devs.runly.mx`), `RUNLY_CATALOG_BUILD_FETCH`, `RUNLY_CATALOG_REQUIRED` |
| Integración ERP | `runly-sdk.ts`, README | Formulario de contacto, analytics y chat contra `app.runly.mx/api` por SDK. Es un canal distinto del Marketplace y no debe mezclarse |
| Pruebas | `src/lib/__tests__`, `scripts/*.test.js` | Hay pruebas del normalizador/fetch del Marketplace y del deploy. No hay E2E en el repo |

### 2.2 Qué es reutilizable hoy

| Pieza | Archivo | Reutilizable | Nota |
|---|---|---|---|
| Normalización defensiva de datos no confiables | `marketplace.ts` (`text`, `list`, regex de icon/color/sha, `CONTROL`) | **Sí**, patrón | La lógica de confianza (`official`/`community`/`community-verified`/`revoked`) es de módulos |
| Cliente con timeout, paginación y estado `unavailable` honesto | `fetchDirectory`, `fetchModule` | **Sí**, patrón | Tope silencioso: `limit=100` × `maxPages=20` = 2000 entradas |
| `hubBaseUrl` (solo HTTPS o loopback) | `marketplace.ts` | Sí, tal cual | |
| Fetch en build con cache por proceso y modos offline/requerido | `marketplace-build.ts` | Sí, patrón | Una sola petición por build, compartida por todas las páginas |
| Página estática por recurso + shell dinámico `noindex` | `modulos/[key].astro`, `modulos/detalle.astro`, `*Detail.astro` | Sí, patrón | El shell dinámico usa `?key=`; hay que generalizar a tipo+id |
| Tres estados de datos (fresco / instantánea con fecha / no disponible) | `MarketplaceDirectorySection.astro` | Sí | `status` con `role="status"` |
| Insignias de confianza, tarjetas | `components/marketplace/*` | Parcial | Acopladas a módulos y duplicadas (Astro + `renderCard` en JS) |
| Búsqueda en cliente con atributos `data-*` | `DocsSearch.astro`, `MarketplaceDirectorySection.astro` | Sí | Sin estado en la URL |
| Layout, Header (menús desplegables), Footer, `SectionHeading`, `PublicInfoLayout` | `components/layout`, `layouts` | Sí | Header no tiene entrada de Marketplace |
| Pipeline de docs de desarrolladores | `content.config.ts`, `docs-content.ts`, `pages/documentacion/*` | Sí | Solo ES |

### 2.3 Brechas demostrables en el código actual

| # | Hallazgo | Evidencia | Efecto para el Marketplace ampliado |
|---|---|---|---|
| G1 | Filtros sin estado en URL (no compartibles ni indexables como vistas) | `applyFilters` solo toca el DOM | Con 5 tipos hace falta `?tipo=&q=&…` |
| G2 | Lógica de tarjeta duplicada (Astro SSR + `renderCard` JS) | `MarketplaceCard.astro` y script de `MarketplaceDirectorySection.astro` | Multiplicar por tipo = deriva garantizada |
| G3 | Controles de búsqueda/filtro visibles sin JS pero inertes | HTML estático + script | Mejorar con `noscript`/ocultar sin JS |
| G4 | `aria-label` del grupo de filtros = "Todos" (el de una opción) | `aria-label={t.filters.all}` | Etiqueta de grupo incorrecta |
| G5 | Texto auxiliar `text-slate-400` a `text-xs` (≈2,6:1 de contraste calculado, por debajo de AA 4,5:1) | `MarketplaceModuleDetail.astro` (clave, SHA, fecha) | Arreglar antes de ampliar el patrón (calculado, no medido con herramienta) |
| G6 | Sitemap excluye sólo `"/modulos/detalle/"` | `astro.config.mjs` | Un nuevo shell dinámico quedaría **en el sitemap pese a ser `noindex`** si no se generaliza |
| G7 | `SiteHead` supone equivalente EN salvo `/documentacion/*` | `hasEnglish` | Rutas nuevas sin traducción real deben pasar `hasEnglish` |
| G8 | Las secuencias de snapshot (`snapshots.official/community`) se leen pero no se usan | `fetchDirectory` | Señal ya disponible para decidir "¿hay que reconstruir?" (§8.4) |
| G9 | La versión de la release (historial `versions[]`) no se muestra | `fetchModule` usa `current ?? versions[0]` | Las fichas de recursos necesitan historial y estado por versión |
| G10 | Defaults de sync y README hablan de `../runly`; AGENTS.md y 0-B hablan de `runly-erp` | `sync-help-content.mjs`, README, AGENTS.md | Nomenclatura ambigua; confirmar la ruta real antes de documentar flujos (W-3) |

---

## 3. Respuestas W-1 … W-4

> Los enunciados no estaban disponibles; se responden las preguntas tal como se infieren de las secciones 2, 5 y 7 del encargo. **Confirmar contra 0-A.**

### W-1 — ¿Cómo incorporar recursos nuevos sin alterar el catálogo de módulos?

**De forma aditiva y paralela, sin cambiar una línea del camino de módulos.**

- `/modulos`, `/modulos/<key>/`, `/modulos/detalle/`, `/en/modulos/*` y el endpoint `GET /api/v1/marketplace/directory` quedan **intactos** (el health check del deploy ya depende de ellos).
- El Hub expone endpoints **nuevos y versionados por separado** (§9). La web añade una biblioteca nueva (`marketplace-resources.ts`, unión discriminada por `type`) que **reutiliza los helpers** de `marketplace.ts` (`text`, `list`, `hubBaseUrl`, `CONTROL`) en vez de modificar `normalizeModule`.
- Razones demostradas: (a) `schemaVersion !== 1` ⇒ el directorio entero queda "unavailable"; (b) `normalizeModule` exige `^custom\.` y `trust ∈ {official, community}` y devuelve `null` para todo lo demás, por lo que mezclar tipos produce **invisibilidad silenciosa**; (c) alinea con E-2/C-5 (feed paralelo).
- "Módulos Community" en el nuevo Marketplace es una **vista/enlace** a `/modulos/#marketplace`, no una copia del catálogo.
- Mecanismos de actualización existentes (reutilizables tal cual): HTML de build + refresco en navegador + marca de retirado/revocado + shell dinámico para no listados + `RUNLY_CATALOG_REQUIRED`.

### W-2 — ¿Cómo enlazar el panel Creator/Admin sin duplicar autenticación?

**Enlaces salientes simples a `https://devs.runly.mx`**, y nada más.

- Sin OAuth/OIDC, sin cookies compartidas, sin `fetch` con credenciales, sin iframes, sin botón "iniciar sesión" en runly.mx, sin lectura de estado de sesión. La web seguirá siendo 100 % anónima y estática.
- Precedente ya existente: `PublicInfoLayout.astro` enlaza "Portal de Runly Developer" a `https://devs.runly.mx`, y `hubModuleUrl()` enlaza a la ficha pública del Hub.
- Puntos de entrada propuestos: "Publicar en el Marketplace" (Header → *Documentación/Desarrolladores* y pie de página) que lleva a la guía (generada, `catalogo-comunitario`) y de ahí al portal; en las fichas, "Ver en Developer Hub" (ya existe).
- Rutas internas del panel (p. ej. `/publisher`, `/admin`) **no** se codifican en la web: se enlaza a la raíz y a docs hasta que el Hub publique URLs estables **[verificar Hub]**.
- Las rutas administrativas **nunca** se mencionan bajo los endpoints anónimos (§9).

### W-3 — ¿Cuál es la fuente de la documentación y qué dependencias hay con ERP y Hub?

| Contenido | Fuente única | Mecanismo | Dirección |
|---|---|---|---|
| `src/content/developers/*.md` | `runly-erp/docs/developers/*.md` | `node scripts/sync-help-content.mjs` (manual) | ERP → Web |
| `src/content/help/**`, `src/data/help-navigation.json` | `runly-erp/apps/api/src/manifests/official/help` y manifiestos | mismo script | ERP → Web |
| Docs MCP del Hub | copia de `runly-web` | `node scripts/sync-mcp-docs.mjs ../runly-web` (en el Hub) | **Web → Hub** |

Implicaciones para el Marketplace:
1. **Cadena obligatoria `ERP → Web → Hub`**: el Hub depende de la copia de la web. Una doc de publicación escrita en la web o en el Hub rompe el principio de fuente única.
2. El sync **rechaza** páginas editadas a mano o "solo web" (`--force-dev` las borra). Por tanto el copy comercial del Marketplace (landing, textos de Solutions) **debe vivir fuera de `src/content/developers/`** (p. ej. `src/data/` o diccionarios); la documentación de formatos y de publicación debe escribirse en `runly-erp/docs/developers`.
3. El sync copia solo `*.md`. `studio-template-package-v1.schema.json` vive en el ERP y **no llega a la web**. Si se quiere publicar el esquema (`/schemas/...`), hay que ampliar el script (decisión D-W9).
4. Ya existe doc pública de Studio (`studio-template-package.md`) y del flujo comunitario (`catalogo-comunitario.md`). **No existe** doc pública de los formatos de automatización ni de plantilla Website (0-B §6.4 los define como contratos nuevos) ni de Solutions: dependen de ERP E1.
5. La documentación es solo ES. Las fichas EN enlazarán a docs ES con aviso.
6. Todo es manual y sin CI: cada cambio de contrato exige sync + commit + deploy; riesgo de deriva ya aceptado por el proyecto, pero crece con más tipos.

### W-4 — ¿Cómo se vincula identidad/sesión entre runly.mx y el Hub?

**No se vincula.** runly.mx no conoce al usuario del Hub ni del ERP; no hay "volver a la web tras iniciar sesión" ni insignias personalizadas. El flujo "descubrir en la web → usar en mi Runly" se resuelve con **datos públicos** (nombre, `releaseId`, pasos) y, opcionalmente, un enlace al ERP del propio usuario (§7.4, D-W3). Esto respeta C-1..C-10 y no añade superficie de sesión.

---

## 4. Funcionalidades existentes y faltantes

| Capacidad | Estado | Nota |
|---|---|---|
| Catálogo público de módulos (build + navegador) | **Existe** | `/modulos`, `/en/modulos`, ficha estática y dinámica |
| Marcado de retirado/revocado en vivo | **Existe** | `fetchModule` en la ficha |
| Páginas no listadas | **Existe** (`noindex`, fuera del sitemap) | Shell `detalle` |
| Documentación de formatos Studio | **Existe** (generada) | |
| Entrada "Marketplace" en navegación | **Falta** | Hoy cuelga de *Producto → Módulos* |
| Hub de Marketplace multi-tipo | **Falta** | |
| Páginas por tipo (Studio, Website, Automatizaciones, Solutions) | **Falta** | |
| Páginas de publicador | **Falta** | |
| Previews | **Falta** | No hay modelo de imágenes en el directorio de módulos |
| Filtros en URL, facetas por tipo/licencia/compatibilidad | **Falta** | G1 |
| Historial de versiones, estado por versión | **Falta** | G9 |
| Disparador de rebuild | **Falta** | §8.4 |
| JSON-LD por recurso, `ItemList` | **Falta** | |
| CSP / cabeceras | **Falta** (no documentado) | §8.3 |
| Pruebas E2E | **Falta** | solo si cambian rutas críticas |

---

## 5. Propuesta de rutas y navegación

### 5.1 Principios
1. **Mantener** `/modulos*` (deploy y SEO existentes).
2. **Un solo prefijo nuevo** `/marketplace/`, con subrutas por tipo. Slugs en español, también bajo `/en/` (convención actual).
3. Páginas estáticas solo para recursos `indexable`; el resto, shell dinámico `noindex`.
4. Cada tipo aparece en el hub **solo si el Hub tiene ≥1 recurso publicado** (D-W2): sin catálogos vacíos "próximamente".

### 5.2 Mapa

| Ruta (ES; `/en/…` espejo) | Contenido | Generación |
|---|---|---|
| `/marketplace/` | Hub: buscador global, tarjetas por tipo, Solutions destacadas, "publicar" | Build + refresco |
| `/modulos/` (existente) | **Módulos Community** + módulos incluidos | Sin cambios |
| `/marketplace/plantillas-studio/` · `…/<slug>/` | Catálogo y ficha | Build + refresco |
| `/marketplace/plantillas-website/` · `…/<slug>/` | Ídem. *Bloqueado por contrato ERP E1* | |
| `/marketplace/automatizaciones/` · `…/<slug>/` | Ídem (ficha con resumen de riesgos) | |
| `/marketplace/soluciones/` · `…/<slug>/` | Catálogo y ficha de kits | |
| `/marketplace/publicadores/<handle>/` | Perfil público y sus recursos | Build + refresco |
| `/marketplace/detalle/?tipo=…&id=…` | Shell dinámico (no listados, releases nuevas) | `noindex`, **fuera del sitemap** (G6) |
| Tipos futuros (`documentos`, `proyectos`, `dashboards`) | Se añaden solo con contrato ERP + Hub | |

Identidad de URL: `slug` estable por recurso (no por versión). Cuál sea (`resourceKey` de 0-B §5.2 u otro) **[verificar Hub]**. Las versiones se muestran *dentro* de la ficha, sin URL propia en el MVP.

### 5.3 Navegación
- **Header:** nuevo grupo **"Marketplace"** (junto a *Producto* y *Documentación*): Explorar, Módulos, Plantillas Studio, Plantillas Website, Automatizaciones, Soluciones, "Publicar" (enlace a docs). En móvil, drill-down como los demás menús (el `mobileRoot` ya soporta submenús).
- **Producto → Módulos** permanece (misma URL).
- **Footer:** columna "Ecosistema" con Marketplace y Soluciones.
- **Migas:** Marketplace › Tipo › Ficha. La ficha conserva el patrón "← Volver" actual.
- **Migración sin romper enlaces:** ninguna URL existente cambia.

---

## 6. Catálogos públicos: búsqueda, filtros y fichas

### 6.1 Búsqueda y filtros

| Aspecto | Propuesta | Razón |
|---|---|---|
| Búsqueda | Cliente, sobre el listado en memoria (patrón actual), con `?q=` | Basta hasta cientos de recursos. Más allá, el Hub debe ofrecer `q` + paginación (§9) |
| Facetas globales | Tipo, confianza, licencia, compatibilidad (versión de Runly), idioma, publicador | Datos ya previstos en 0-B §5.2 (`license`, `compatibility`, `publisher`) |
| Facetas por tipo | Studio: páginas, formato. Website: bloques/formularios. Automatizaciones: disparador, servicios. Solutions: nº componentes, tipos incluidos | Solo si el Hub las emite |
| Categorías | Un campo `categories[]` controlado por el Hub (no texto libre) **[verificar Hub]** | Evita facetas contaminadas |
| Estado en URL | Sí (`?tipo=&q=&licencia=`) y `history.replaceState` | G1 |
| Ordenación | Relevancia/recientes/nombre. **Sin ratings ni conteos de instalaciones** en el MVP (los recibos son opt-in y mínimos, 0-B §6.6) | No inventar señales sociales |
| Sin JS | Listado completo del build visible; controles ocultos o `noscript` | G3 |

### 6.2 Contenido de cada ficha

| Elemento | Fuente | Aviso |
|---|---|---|
| Nombre, publicador (@handle, verificado), confianza, versión, fecha | Hub | Texto escapado; nunca `set:html` |
| Compatibilidad `runly` min/max y "formato requerido" | Hub (0-B §5.2) | La web no conoce la versión del usuario del ERP |
| Licencia (SPDX o texto corto) y enlaces a texto | Hub | Declarativa; la web no la verifica |
| Requisitos (módulos, fuentes, permisos) | Hub | Fuentes desconocidas en Studio **bloquean** en el ERP: mostrar antes de instalar |
| Previews | Hub (URLs propias, §8.3) | Imágenes estáticas |
| SHA-256 (corto) y tamaño | Hub | Informativo |
| Historial de versiones y estado | Hub | G9 |
| Aviso de revocación/retirada | Hub + comprobación en vivo | Patrón existente |
| "Usar en Runly" | Web (estático) | §7.4 |
| "Ver en Developer Hub" | Web | Patrón existente |

Fichas específicas:
- **Studio:** galería de `previews/*.png`, nº de páginas, fuentes (con disponibilidad), licencias de recursos, advertencia de datos personales en texto/imágenes si el Hub la emite.
- **Website:** capturas por página (**nunca** vista previa viva/iframe), formularios requeridos (`@contact`, `@newsletter`), tokens de tema, versión mínima del builder (0-B §5.6).
- **Automatizaciones:** resumen legible disparador → pasos y **informe de riesgos** (servicios que se autorizarán, llamadas HTTP, correos, adjuntos). La web **no parsea** el archivo `.runly-automation.json` (el parser hoy es código de navegador del escritorio, 0-B §2.2): el Hub debe emitir `riskSummary` ya calculado.

---

## 7. Runly Solutions: experiencia pública

### 7.1 Estructura de la ficha `/marketplace/soluciones/<slug>/`

1. **Cabecera:** nombre, publicador, confianza, versión, estado, compatibilidad global.
2. **Qué incluye:** lista agrupada por *alcance* (instancia → empresa → usuario → sitio), cada componente con icono de tipo, nombre enlazado a su ficha, versión, **obligatorio/opcional** y licencia.
3. **Orden de instalación y dependencias:** lista ordenada (no grafo interactivo) en el orden recomendado por 0-B §6.4 (módulos → Studio → documentos → Website → automatizaciones) con "depende de".
4. **Requisitos:** versión de Runly, módulos requeridos (enlace al módulo), fuentes, permisos que necesita la persona que instala (por componente: `core.modules.manage`, `studio.templates.manage`, `automations.manage`, `website.pages.create`…), alcance (instancia vs empresa).
5. **Qué pasará y qué no:** "no publica tu sitio", "las automatizaciones se importan pausadas", "los correos externos se descartan" (según decisiones D-E4/D-E6 del ERP), "los módulos requieren administrador de la instancia". Texto fijo de la web, redactado desde 0-B.
6. **Licencias:** tabla por componente.
7. **Previews:** carrusel/galería por componente.
8. **Versiones y cambios**, aviso de revocación.
9. **CTA "Usar en Runly"** (§7.4).

### 7.2 Estados
`disponible` · `parcialmente disponible` (algún componente opcional retirado) · `no instalable` (obligatorio revocado/retirado) · `revocada`. Estados y avisos reutilizan el patrón de `availability`.

### 7.3 Integridad
Cada componente se identifica por `releaseId + sha256` (0-B §6.1); la web muestra un hash corto y deja la verificación al ERP. Si el Hub devuelve una solución con un componente que no resuelve, la ficha lo marca "no disponible" y no se indexa.

### 7.4 Acciones para usarlo en Runly (sin que el sitio instale)
- **MVP:** bloque de pasos ("En Runly: Marketplace › Soluciones › buscar «…»") + botón **Copiar identificador** (`releaseId`) + enlace a la guía. Funciona para cualquier instancia (nube o auto-alojada).
- **Opcional (D-W3):** "Abrir en mi Runly" con URL de instancia que la persona escribe; se valida (`https:` o loopback, sin credenciales; misma regla que `hubBaseUrl`), se guarda **solo en `localStorage`** y nunca se envía a ningún servidor. Requiere que el ERP defina una ruta de recepción (ERP E5); no antes.
- **Prohibido en la web:** `fetch` hacia el ERP del usuario con credenciales, descargar/subir paquetes, abrir `blob:` con bytes del Marketplace, cualquier "instalar".

---

## 8. Consumo de API, SEO, caché y operación

### 8.1 Estático vs navegador

| Datos | Build | Navegador |
|---|---|---|
| Listados por tipo | Sí (instantánea con `fetchedAt`) | Refresco y reemplazo (patrón actual) |
| Ficha de recursos `indexable` | Página estática | Re-verifica `availability` |
| No listados / releases nuevas | No | Shell dinámico por `tipo+id` |
| Historial de versiones | Resumen | Completo en vivo |
| Revocación | Desaparece en el siguiente deploy (rsync `--delete`) | Aviso inmediato |

### 8.2 Estados y degradación
Se conservan: **fresco**, **instantánea con fecha ("puede estar desactualizada")**, **no disponible**. Además: sin conexión ⇒ la instantánea del build sigue legible y la UI lo indica; `RUNLY_CATALOG_REQUIRED=1` ya permite exigir datos en builds de producción (se recomienda **activarlo en el pipeline de release** para no publicar un sitio sin catálogo por una caída momentánea del Hub).

### 8.3 Seguridad (CORS, CSP, contenido)

| Control | Propuesta |
|---|---|
| CORS | El Hub responde `Access-Control-Allow-Origin: https://runly.mx` (y `www`) solo para `GET` anónimos, sin credenciales **[verificar Hub: hoy funciona para el directorio]** |
| CSP (a decidir con ops) | `connect-src 'self' https://devs.runly.mx` + orígenes ya usados por el SDK (`app.runly.mx`, Supabase, Turnstile si aplica); `img-src 'self' data: https://devs.runly.mx` para previews. **Riesgo:** Astro puede incrustar scripts pequeños en línea; una CSP estricta exige hashes/nonces (no implementar aquí) |
| Datos del Hub | Siempre texto (`textContent`/escape de Astro); sin Markdown→HTML. Si se quiere formato en descripciones, requiere sanitizador y decisión explícita (D-W7) |
| Imágenes | Solo `<img>` de PNG/WebP/JPEG servidas por el origen del Hub; **sin SVG**, sin hotlinking a dominios de publicadores; `alt` obligatorio desde el Hub; `width/height` para evitar CLS |
| Enlaces salientes | `rel="noopener"`; no se renderiza ninguna URL libre del publicador (solo las del Hub) |
| Previews de Website | Capturas estáticas, jamás iframes ni ejecución de plantillas |
| No listados | Solo accesibles por enlace; `noindex, nofollow` ya aplicado; no se incluyen en llms.txt ni sitemap |
| Anónimo | Ninguna ruta `/admin`, `/moderation` ni `/internal` bajo `/api/v1/marketplace/*` (§9) |

### 8.4 Frescura: disparador de reconstrucción (propuesta)
Hoy: build manual en VPS, meta "≤24 h". Propuesta (requiere autorización de ops, no implementada): un temporizador en la VPS que consulta el directorio ya existente, compara `catalogs.*.sequence` (G8) con la secuencia del último build y, si cambió, ejecuta el flujo **ya existente** `deploy-static.mjs` (con su dry-run, respaldo, health check y rollback). Alternativa: webhook del Hub que dispare el mismo script. La decisión depende de D-W5.

### 8.5 SEO

| Tema | Propuesta |
|---|---|
| Sitemap | Generalizar el filtro a cualquier ruta `/detalle/` (G6); fichas indexables entran, shells y no listados no |
| Canonical/hreflang | Por ficha; `hasEnglish` explícito según haya traducción real (G7) |
| JSON-LD | `ItemList` en catálogos; `SoftwareApplication` en módulos/solutions; `CreativeWork` para plantillas. Sin `aggregateRating` ni reseñas inventadas. El JSON-LD global del sitio puede coexistir pero no debe contradecir |
| Revocados/retirados | Fuera del build (404 tras el deploy); durante la ventana, aviso en vivo |
| `llms.txt` | Opcional: listar catálogos públicos indexables |
| Duplicados | Mismo recurso en dos locales con contenido de un solo idioma: usar `hreflang` con el mismo contenido y `lang` por campo si el Hub lo emite |

---

## 9. Contratos necesarios con Developer Hub

Todos **[verificar Hub]**: se proponen para que 0-A los confirme; ninguno modifica endpoints existentes.

| # | Contrato | Contenido mínimo |
|---|---|---|
| H1 | `GET /api/v1/marketplace/resources?type=&limit=&offset=&q=` | Propio `schemaVersion`, `total`, `catalogs.resources.sequence`, items: `type`, `slug`, `title`, `summary`, `publisher`, `trustLevel`, `availability`, `listed`, `indexable`, `license`, `compatibility`, `categories[]`, `locales[]`, `previews[]`, `updatedAt` |
| H2 | `GET /api/v1/marketplace/resources/:type/:slug` | `current` + `versions[]` (con estado), `requirements`, `provenance` (declarada), `riskSummary` (automatizaciones), `formatVersion` |
| H3 | `GET /api/v1/marketplace/solutions/:slug` | Manifiesto con componentes `{releaseId, sha256, type, scope, required, dependsOn[]}`, requisitos, licencias, estado agregado |
| H4 | `GET /api/v1/marketplace/publishers/:handle` | Perfil público y recursos |
| H5 | Activos de preview | URL inmutable en el origen del Hub, `contentType`, `width`, `height`, `alt`; solo PNG/WebP/JPEG |
| H6 | Cabeceras | CORS (arriba), `Cache-Control` corto + `stale-while-revalidate`, `ETag`, `404` (no existe) vs `410` (retirado), límites de tasa para anónimos |
| H7 | Señal de cambio | `sequence` por feed (ya existe para módulos) y/o webhook de publicación para el rebuild (§8.4) |
| H8 | Reglas de normalización | Mismos límites de longitud y sin control chars; campos desconocidos **ignorados**, no fatales |

**No negociable:** ninguna ruta administrativa bajo estos endpoints; el directorio actual (`/directory`, `/modules/:key`) y su `schemaVersion: 1` no cambian.

---

## 10. Experiencia visual: propuesta conceptual

- **Jerarquía:** Marketplace → tipo → ficha. El hub abre con búsqueda global y cuatro tarjetas grandes por tipo (icono, descripción de una línea, nº de recursos), **Solutions** destacadas arriba porque son lo que más vende; "Módulos Community" enlaza a `/modulos`.
- **Lenguaje visual:** reutilizar el sistema actual (tarjetas redondeadas, badge de confianza, gradiente `runly-gradient-btn`). No es un rediseño.
- **Insignias de confianza:** mismas cuatro (Oficial/Verificado/Comunidad/Revocado) para todos los tipos; un recurso de comunidad nunca se presenta como oficial (regla ya probada en tests).
- **Móvil:** filtros en una hoja inferior (`<dialog>`), tarjetas en una columna, galería con deslizamiento y botones accesibles, CTA fija "Usar en Runly" al pie de la ficha.
- **Accesibilidad:** etiqueta correcta del grupo de filtros (G4), contraste ≥4,5:1 (G5), anuncio de resultados con `role="status"`, foco gestionado tras filtrar, `alt` en previews, navegación por teclado en galería, `prefers-reduced-motion` respetado (ya existe), estados no dependientes del color.
- **i18n ES/EN:** cadenas nuevas en `MARKETPLACE_TEXT` (consistente con lo actual) o migradas a los diccionarios en W1; contenido del publicador tal cual (con `lang` si se conoce); documentación solo ES (aviso en EN).
- **Fichas:** ancho de lectura limitado (`max-w-4xl`, como hoy), `dl` de metadatos, secciones plegables para versiones y licencias.

---

## 11. Conflictos demostrables con 0-A / 0-B

| # | Conflicto o tensión | Evidencia en `runly-web` | Resolución propuesta |
|---|---|---|---|
| X1 | "Añadir recursos al feed/directorio existente" (si 0-A lo propusiera) | `schemaVersion !== 1` ⇒ `unavailable`; `normalizeModule` descarta no-`custom.*` | Endpoints paralelos (§9). Coherente con E-2/C-5 |
| X2 | 0-B R9: el ERP debe descargar y verificar en servidor | Web no verifica firmas | La web **no** ofrece descarga de paquetes en el MVP |
| X3 | 0-B §6.3 muestra "plan de instalación" con permisos | La web no conoce permisos ni versión del ERP del usuario | La web muestra requisitos **declarados**; la validación real es del ERP |
| X4 | 0-B asume contratos de cable vendorizados en el ERP desde el Hub | La web consume JSON del Hub **sin vendorizar** ni test de vectores | Añadir tests de contrato (fixtures) en la web, sin copiar esquemas de firma |
| X5 | 0-B §6.4 / docs: Website y automatizaciones sin formato público | La web no tiene doc de esos formatos | Las fichas Website/Automatización se publican solo cuando exista doc generada |
| X6 | Rutas del deploy acopladas a `/modulos/` | `REQUIRED_BUILD`, `health()` | Mantener `/modulos/`; si se añaden rutas críticas, ampliar `REQUIRED_BUILD` (cambio futuro, con aprobación) |
| X7 | Nomenclatura del repo ERP | `../runly` en script/README vs `runly-erp` en AGENTS/0-B | Aclarar antes de documentar (G10) |

---

## 12. Riesgos

| # | Riesgo | Sev. | Mitigación |
|---|---|---|---|
| R1 | Subir `schemaVersion` del directorio o mezclar tipos en `modules[]` rompe/oculta `/modulos` | Alta | Endpoints paralelos; test que fija el comportamiento actual |
| R2 | HTML estático desfasado: recurso revocado sigue indexado hasta el próximo deploy | Alta | Disparador de rebuild (§8.4), aviso en vivo, `RUNLY_CATALOG_REQUIRED=1` en release |
| R3 | Build sin catálogo por caída del Hub publica un sitio vacío | Media | `RUNLY_CATALOG_REQUIRED=1` en el pipeline de release |
| R4 | Contenido del publicador renderizado como HTML | Alta | Solo texto; sin Markdown→HTML hasta decidir sanitizador |
| R5 | Previews con SVG o hotlinking a dominios de terceros | Media | Solo origen del Hub; PNG/WebP/JPEG; CSP `img-src` |
| R6 | La web sugiere confianza que no verificó | Media | Texto "Runly verifica al instalar"; badges solo desde campos estructurados |
| R7 | Sitemap incluye shells `noindex` nuevos | Media | Generalizar filtro (G6) y añadir test |
| R8 | CSP estricta rompe scripts en línea de Astro / widget de chat / SDK | Media | Probar en staging; hashes/nonces; despliegue gradual |
| R9 | Deriva de duplicación Astro/JS de tarjetas al multiplicar tipos | Media | Una sola plantilla de tarjeta (G2) antes de añadir tipos |
| R10 | Docs fuera de la cadena ERP→Web→Hub rompen el sync | Media | Docs de formato siempre en `runly-erp/docs/developers` |
| R11 | Tope silencioso de 2000 entradas por directorio | Baja | Paginación/`q` en el Hub; aviso en consola si se trunca |
| R12 | Alcance de privacidad: URL de instancia guardada en `localStorage` | Baja | Solo local, validada, sin envío; opcional (D-W3) |
| R13 | Crecimiento del build (miles de páginas × 2 locales) | Baja-Media | Indexable selectivo; medir; shell dinámico para el resto |
| R14 | Expectativa de "instalar desde la web" | Media | Copy claro: se instala desde Runly; sin botón de instalar |

---

## 13. Decisiones pendientes del propietario del producto

| ID | Pregunta | Recomendación |
|---|---|---|
| D-W1 | ¿Prefijo único `/marketplace/` o `/soluciones/` en la raíz como alias de marketing? | `/marketplace/soluciones/` ahora; alias raíz después si hay campaña |
| D-W2 | ¿Mostrar tipos sin recursos ("próximamente")? | No; solo tipos con ≥1 recurso publicado |
| D-W3 | ¿"Abrir en mi Runly" con URL de instancia local? | No en el MVP; copiar identificador + pasos |
| D-W4 | ¿Páginas de publicador indexables? | Sí si hay ≥1 recurso público; si no, `noindex` |
| D-W5 | ¿Cómo se dispara el rebuild: temporizador, webhook o manual? | Temporizador por `sequence` + deploy existente; webhook en una segunda fase |
| D-W6 | ¿Descarga directa de paquetes públicos desde la web? | No (pierde procedencia y el ERP verifica en servidor) |
| D-W7 | ¿Formato en descripciones (Markdown)? | Texto plano en MVP |
| D-W8 | ¿Contenido bilingüe de recursos o un solo idioma por recurso? | Un idioma declarado (`locales[]`); UI bilingüe |
| D-W9 | ¿Publicar JSON Schemas (Studio, etc.) en `runly.mx/schemas/`? | Sí, ampliando el sync del ERP; no en este repo a mano |
| D-W10 | ¿Ratings, instalaciones, reseñas? | Fuera del MVP |
| D-W11 | ¿Hub de Marketplace con búsqueda global desde el Header? | Sí, reutilizando el modal de búsqueda de docs como patrón |
| D-W12 | ¿Entrada "Publicar" en el Header o solo en Docs/Footer? | Docs y Footer; sin CTA primario para no competir con "Solicitar demo" |

---

## 14. Fases recomendadas para Runly Web

Cada fase termina con un solo expediente de verificación (SHA, pruebas dirigidas, riesgos residuales). **Ninguna incluye despliegue ni cambios de infraestructura sin autorización posterior.**

| Fase | Contenido | Depende de |
|---|---|---|
| **W0** (esta) | Auditoría | — |
| **W1 — Cimientos sin cambio visible** | Extraer tarjeta única y cliente genérico `marketplace-resources.ts` (unión por `type`); URL-state de filtros; generalizar filtro de sitemap a `/detalle/`; arreglar G3–G5; tests de contrato con fixtures; **`/modulos` byte-igual** | Nada del Hub |
| **W2 — Hub de Marketplace** | `/marketplace/`, entrada en Header/Footer, enlace a `/modulos`, estados vacíos honestos | Hub H1 |
| **W3 — Plantillas Studio** | Catálogo y ficha con previews | Hub H1/H2/H5; ERP formato ya documentado |
| **W4 — Soluciones** | Catálogo y ficha de kits | Hub H3; W3 para enlaces entre componentes |
| **W5 — Automatizaciones** | Ficha con `riskSummary` | Hub H2 (`riskSummary`); ERP E1/E3 |
| **W6 — Plantillas Website** | Catálogo y ficha | ERP E1 (contrato Website) |
| **W7 — Publicadores, SEO y operación** | Perfil de publicador, JSON-LD, `llms.txt`, disparador de rebuild, propuesta de CSP con ops | Hub H4/H7; autorización de ops |
| **W8 — Gate previo a producción** | E2E de navegador (filtros, shell dinámico, revocación), revisión de accesibilidad, prueba de carga del build | Todo lo anterior |

---

## 15. Anexo: evidencia consultada

`package.json` · `astro.config.mjs` · `.env.example` · `README.md` · `AGENTS.md` · `src/lib/{marketplace,marketplace-build,runly-sdk}.ts` · `src/lib/__tests__/marketplace.test.ts` · `src/pages/{modulos.astro,modulos/[key].astro,modulos/detalle.astro,llms.txt.ts}` · `src/pages/en/modulos/*` · `src/pages/api/modules/*` · `src/components/marketplace/*` · `src/components/layout/{Header,SiteHead}.astro` · `src/components/docs/DocsSearch.astro` · `src/layouts/{BaseLayout,PublicInfoLayout}.astro` · `src/i18n/es.ts` · `src/content.config.ts` · `src/content/developers/{catalogo,catalogo-comunitario,studio-template-package,mcp}.md` y `.sync-manifest.json` · `scripts/{deploy-static,prepare-catalog-v2,sync-help-content}.mjs` · `public/{robots.txt,catalog/v1/index.json}` · `src/consts.ts`.

**No verificado:** Plan Maestro y auditoría 0-A (no adjuntos); enunciados exactos de W-1..W-4; configuración real de Nginx/CORS/CSP en producción; contratos y rutas del Hub más allá de `/api/v1/marketplace/directory` y `/modules/:key`; contraste medido con herramienta (G5 es cálculo); tiempo de build con miles de recursos; si `dist/` local corresponde al HEAD; que las suites pasen (no se ejecutó ninguna).
