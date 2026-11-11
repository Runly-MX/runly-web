# Distribución de recursos: contrato frontend

## Diagnóstico y alcance

H7 ya exporta releases, snapshots firmados y paquetes originales por hash. El ERP ya consume ese feed con claves fijadas, límites, compatibilidad, estado y antirollback. Studio ya tiene selección por nombre, inspección, preparación y confirmación con nueva verificación de la release. Se conservan esos contratos.

`RuntimeCatalog` consultaba datos actuales, pero enviaba a la ruta de consulta; los perfiles y detalles estables dependían de `getStaticPaths`. Un publicador posterior al build producía un 404 antes de consultar el Hub. `ResourceDetailView` exigía copiar el UUID y confundía publicador con procedencia institucional. `PreviewGallery` ya admite selección por teclado, ampliación y errores; sus imágenes son vistas previas, nunca archivos fuente.

## Componentes que puede rediseñar Claude

| Superficie | Entrada y responsabilidad |
| --- | --- |
| `RuntimeCatalog` / `ResourceCatalog` / `ResourceCard` | `ResourceSummary`: identidad, título, resumen, licencia, compatibilidad, portada y enlace estable `resourcePath(type, slug)`. La portada usa exclusivamente `previewUrl`. |
| `ResourceDetailView` | `ResourceDetail`, `hubUrl`, `checkLive`. `liveView` oculta acciones y previews durante comprobación, error, retirada o revocación. |
| `ResourceActions` | `resource`, `hubUrl`. Descargar sólo Studio disponible; Usar en Runly explica la importación integrada, sin UUID. Expone `data-resource-actions` y `data-use-in-runly`. |
| `PreviewGallery` | `previews: Preview[]`, `hubUrl`. Hasta seis previews publicadas ordenadas, con texto alternativo y estado de fallo. No garantiza representar todas las páginas: el paquete conserva el documento completo. |
| Perfil | `/marketplace/publicadores/:handle/`. Nombre registrado, verificación del publicador, antigüedad y recursos públicos. Nunca inferir autoría institucional de `verified`. |
| `resourceIdentity` | `origin`, `publisher`, `creator`, `contributors`, `organization`. Creador desconocido = `null`, contribuidores desconocidos = `[]`; no inferirlos del nombre del publicador ni exponer identidades privadas. |
| Versiones | `latest` y `versions` conservan versión, tamaño, fecha, estado y compatibilidad. La descarga visible corresponde a la release actual; no seleccionar silenciosamente otra versión. |
| Errores | `ResourceStateBlock`, `LiveNotice` y error local de descarga. No habilitar acciones ante estados no confirmados. |

`origin` es `official`, `community-verified`, `community` o `revoked`, derivado del veredicto existente. Sólo una atestación institucional verificada permite `organization: {name: 'Runly', basis: 'signed-institutional-attestation'}`. `publisher` conserva el nombre y handle registrados. El emisor firmado y el contrato de publicación no cambian. No hay información pública verificable adicional de creador o contribuidores en la proyección actual.

## Descargar

Se reutiliza `GET /api/v1/marketplace/catalog/resources/packages/:sha256`. El Hub sólo lee `mk-artifacts` para una release del último snapshot exportado, disponible y pública; comprueba firmas con las claves de recursos fijadas, caducidad, tamaño y hash. Revisa disponibilidad de nuevo después de leer Storage. Nunca lee borradores ni cuarentena. Responde con `Content-Disposition: attachment` y nombre `<resourceKey>-<version>.runlystudio`, sin caché ni credenciales.

`downloadStudioPackage` vuelve a resolver la identidad actual, rechaza cambios de release, descarga sin redirecciones ni credenciales, limita el stream al tamaño publicado y comprueba SHA-256 antes de producir un Blob. `studioFilename` da al usuario `<slug>-<version>.runlystudio`. No se reconstruye el ZIP. Una retirada entre la ficha y el clic se bloquea en servidor. Una copia ya descargada no puede revocarse a distancia.

La licencia publicada aparece antes de descargar. La descarga permite obtener el archivo original bajo esa licencia; Studio aplica además los diagnósticos existentes de redistribución y licencia antes de importar. Una importación local de archivo usa el lector `.runlystudio` y no sustituye la verificación de procedencia del consumidor Marketplace.

## Usar en Runly

No existe en este alcance un protocolo autorizado para abrir y autenticar una instancia arbitraria desde Web. No se inventa un deep link, no se transmiten sesiones ni se aceptan URLs de descarga del navegador.

El usuario accede a su instancia, inicia sesión y selecciona la empresa activa autorizada. En Studio: **Importar diseño o plantilla → Desde Marketplace**, búsqueda por nombre, selección de release, revisión del diagnóstico, elección de destino, preparación y confirmación explícita **Crear copia**. El ERP descarga mediante E2 y confirma mediante E3a; sólo crea una copia nueva y conserva páginas, capas y recursos. `studio.view`, permisos del destino y `files.assets.create` siguen comprobándose en servidor. La confirmación vuelve a obtener un snapshot válido actual; sin verificación actual no crea nada.

## Hosting y rutas posteriores al build

Se añade el adaptador oficial Node de Astro con `output: static`. Las páginas `[tipo]/[slug].astro`, `publicadores/[handle].astro` y el endpoint `sitemap.xml` se resuelven por petición; el resto se sirve estático. El servidor consulta sin el caché de listado del build. Mantiene URL y canonical; 404 desconocido, 410 retirado/revocado, 503 Hub inaccesible, siempre noindex en errores. Se conserva la autorización explícita `MARKETPLACE_SITEMAP=1` para indexar y la prohibición de indexar fixtures. El sitemap actual incluye sólo recursos disponibles con indexación autorizada y sus publicadores, sin requerir otro build.

Artefactos: `dist/client` para el sitio estático y `dist/server` para Node. El script estático se adapta a `dist/client`; **no publica ni inicia el runtime**. Antes de autorizar el despliegue hay que preparar una release completa con sus dependencias, iniciar `HOST=127.0.0.1 PORT=4398 node dist/server/entry.mjs` bajo el supervisor del host y activar el bloque acotado de `infra/marketplace-runtime.nginx.conf`. Las demás rutas conservan el manejo estático y los 404 actuales. No usar `try_files ... /index.html` ni servir `dist/server` como archivos públicos. Probar las rutas tras el proxy y conservar el runtime anterior para rollback junto con sus assets.

No se ejecutó push ni despliegue. El 404 público seguirá existiendo hasta activar este cambio en el hosting.

## Aceptación reproducible

- `pnpm test`: contrato, parser, disponibilidad, identidad, descarga alterada/sobredimensionada y despliegue estático.
- `pnpm exec astro check` y `pnpm build`.
- Hub: `node --test tests/resource-download.test.js`; integración dirigida `tests/integration/marketplace-publication.test.js`: bytes originales, paquete desconocido/privado, firmas, integridad, retirada y revocación.
- ERP: pruebas de catálogo/importación y `scripts/verify-marketplace-imports.mjs`. Para la plantilla pública real, configurar `RUNLY_MARKETPLACE_ACCEPTANCE_URL` con el índice HTTPS y `RUNLY_MARKETPLACE_ACCEPTANCE_RESOURCE` con su clave. El script usa exclusivamente DB/Auth/Storage desechables; verifica claves de producción, importa, edita, compara páginas/capas y conserva bytes originales. No usa ni modifica la instancia del usuario.
- Navegador: catálogo → ficha → galería → descargar → comprobar nombre y hash; Usar en Runly sin UUID; enlace de publicador. Solicitar identidad desconocida y comprobar HTTP 404; simular Hub 410/caída y comprobar HTTP 410/503 y ausencia de acciones.
- No revocar ni retirar la Cumbre real como prueba. Los negativos se ejecutan con releases de laboratorio.

Resultado real de Cumbre 1.0.0: 500632 bytes, SHA-256 `4daa6093877e2d965bd1a1cabb40ec1583e27b7220857a1410a3be23cea77c2f`, 2 páginas, 55 capas y 2 recursos; importación y edición guardadas en entorno desechable. La verificación visual en un Studio autenticado se registra aparte de esta prueba de servicios.

## Registro de validaciones

- Web: suite completa 86/86; descarga/identidad/sitemap dirigidos 4/4 tras agregar el sitemap; Astro Check sin errores; build correcto.
- Hub: unitarios 624 aprobados, uno omitido; lint y build correctos; prueba de descarga 3/3; publicador H4 con SQL/Auth/Storage/signer reales 12/12. Se aplicó exclusivamente en la base local la migración ya existente de independencia entre miembros del espacio.
- ERP: 42 casos dirigidos de consumidor y puerta de importación aprobados; prueba adicional de identidad 4/4; lint de archivos modificados correcto. Cumbre real descargada, importada, editada y reexportada en entorno desechable, con hashes de recursos conservados.
- Chromium, Firefox y WebKit: descarga real desde la ficha del build local e instrucciones de uso aprobadas; Chromium también comprobó galería y nombre registrado del publicador. No se ejecutó la suite E2E general ni una sesión visual autenticada completa del editor de Studio.
- La suite amplia de integración del Hub se detuvo tras detectar expectativas antiguas en `marketplace-resources.test.js` (taxonomía) y `marketplace-validation.test.js` (moderación): esperan `COMMUNITY_MODERATOR_REQUIRED`, reciben `PLATFORM_AUTHORITY_REQUIRED`. Esos archivos y el contrato de permisos no se modificaron.
- `pnpm check:privacy` global del ERP: 72 hallazgos en archivos ajenos al cambio. Los cinco archivos modificados/nuevos del ERP pasan el mismo analizador sin hallazgos.

Referencia de la modalidad elegida: [renderizado bajo demanda de Astro](https://docs.astro.build/en/guides/on-demand-rendering/).
