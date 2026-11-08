# Runly Web — Marketplace de recursos: cierre de la primera implementación (W1)

**Fecha:** 2026-11-08 · **Alcance:** `/marketplace/*` en `runly-web`. Sin cambios en Hub, ERP, infraestructura ni despliegues. `/modulos` y su catálogo no se tocaron.

## 1. Acuse técnico de Web a los contratos

Contratos leídos: `PUBLIC_PROJECTIONS_CONTRACT_V1` y `DEC-X1` (`runly-developer-hub/docs/architecture/marketplace-solutions/contracts/`, revisión E1a). Resultado:

| Punto | Acuse |
|---|---|
| DEC-X1: `resourceKey = <ns>.<slug>`, `type + slug` reconstruyen la clave | **Aceptado.** La URL es `/marketplace/<segmento-del-tipo>/<slug>/`; el parser rechaza un payload cuya clave no coincide con `type`+`slug` y un payload de otro recurso |
| Proyecciones v1 (`resources`, `resources/{type}/{slug}`, `solutions/{slug}`, `publishers/{handle}`) | **Aceptadas.** Se consumen con parsers cerrados que ignoran campos desconocidos (§1.3) |
| Trust / Availability / `indexable` | **Aceptado.** Se verifican cruzados, nunca se promueven: `revoked` solo con `trust:"revoked"`, `community-verified` exige publicador verificado, `indexable` exige `listed` y `available` |
| Previews | **Aceptado.** Solo `/api/v1/marketplace/previews/<sha256>`, solo PNG/WebP/JPEG; SVG o URLs ajenas se descartan |
| Sin conteos, reseñas ni descargas (D-W10, D-W6) | **Aceptado.** La ficha no ofrece descargas; la guía «Usar en Runly» solo copia el `releaseId` |
| Hueco de contrato | El `{type}` de `resources/{type}/{slug}` no está especificado: se asume el valor del enum (`studio_template`, …). Pedir confirmación al Hub |
| Pendiente (no bloquea) | `riskSummary` (E1a §8) no ratificado por ERP: la web lo muestra tal como lo entrega el Hub, sin parsear archivos |

## 2. Rutas (todas en español, `output: static`)

| Ruta | Contenido |
|---|---|
| `/marketplace/` | Inicio: tipos con recursos, buscador, filtros (tipo, confianza, categoría), publicadores, aviso «se instala desde Runly» |
| `/marketplace/{plantillas-studio,automatizaciones,plantillas-website,soluciones}/` | Listado por tipo. **Solo se genera para tipos con al menos un recurso disponible** |
| `/marketplace/<tipo>/<slug>/` | Ficha estática (production: solo `listed` + `indexable` + `available`) |
| `/marketplace/publicadores/<handle>/` | Perfil del publicador (solo con recursos) |
| `/marketplace/detalle/?type=&slug=` | Resolución en el navegador (releases nuevas u ocultas): estados cargando, error, no encontrado, retirado y revocado. `noindex`, nunca en el sitemap |

## 3. Origen de datos

- `MARKETPLACE_SOURCE=hub` (por omisión en `build`): `createHubSource` contra `PUBLIC_RUNLY_HUB_URL`. Mientras el Hub no implemente los endpoints, el sitio muestra «no pudimos cargar el catálogo» / «aún no hay recursos»; nunca datos inventados. `RUNLY_CATALOG_BUILD_FETCH=0` omite la consulta; `RUNLY_CATALOG_REQUIRED=1` falla el build si no hay catálogo.
- `MARKETPLACE_SOURCE=fixtures` (por omisión en `astro dev`): datos de ejemplo tipados (`src/lib/marketplace-resources/fixtures.ts`), todos con prefijo «[Ejemplo]», banner permanente, `noindex`, fuera del sitemap. Un `build` con fixtures exige `MARKETPLACE_ALLOW_FIXTURE_BUILD=1`.
- Sitemap: las URLs `/marketplace/` solo se publican con `MARKETPLACE_SITEMAP=1`, sin fixtures y sin la página de detalle en tiempo de ejecución (`scripts/marketplace-sitemap-filter.mjs`). Activarlo cuando el Hub tenga recursos reales.

## 4. Componentes

`src/components/marketplace/resources/`: `CatalogShell`, `ResourceCatalog` (búsqueda + filtros), `ResourceCard`, `PublisherCard`, `ResourceDetailView` (todos los tipos, riesgo de automatización, componentes de Solution), `ResourceStateBlock` (cargando, vacío, no disponible, no encontrado, retirado, revocado, ejemplo), `RuntimeResource`, `parts`. Capa de datos en `src/lib/marketplace-resources/`.

## 5. Verificación (local)

`vitest` 63/63 (13 nuevas: parsers, cliente del Hub con mocks, filtros, rutas, política de fixtures y sitemap, estados), `astro check` 0 errores, builds de producción (sin catálogo) y con fixtures (94 páginas), capturas y comprobaciones con Playwright en 1280, 820 y 390 px (sin desbordamiento horizontal ni errores de página), búsqueda/filtros/limpiar, botón copiar y estados del detalle en tiempo de ejecución (Hub caído, 404, 410 revocado, lento, parámetros inválidos).

## 6. Dependencias que faltan del backend

1. Endpoints H4 de `PUBLIC_PROJECTIONS_CONTRACT_V1` (`resources`, `resources/{type}/{slug}`, `solutions/{slug}`, `publishers/{handle}`, `previews/{sha256}`) con CORS `*` y `schemaVersion: 1`.
2. Confirmar el valor de `{type}` en la ruta de detalle.
3. Taxonomía curada de categorías (hoy se muestra el slug capitalizado).
4. Disparador de rebuild por `feed.sequence` (D-W5) y activar `MARKETPLACE_SITEMAP=1` al publicar recursos reales.
5. Pendientes de producto: entrada «Marketplace» en el Header (no se añadió para no anunciar un catálogo vacío), versión en inglés (la documentación ya es solo español) y D-W1 (alias `/soluciones/`).
