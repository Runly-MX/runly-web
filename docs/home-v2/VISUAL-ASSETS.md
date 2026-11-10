# Recursos visuales — inventario y manifiesto de captura

Fecha: 2026-11-09. No se generaron mockups ni se modificaron imágenes. Las dos referencias del usuario sirven para dirección artística, no para reutilización de sus interfaces o activos.

## Estado de acceso y evidencia

Se intentó abrir `https://runly.mx` en el navegador integrado: el host de acceso no está disponible. No se capturó ni verificó visualmente la home actual en navegador. La lectura web devolvió contenido público, que sirve para investigación editorial, no para certificar layout, interacción, accesibilidad o tiempos de carga. La consulta pública de Marketplace falló en la herramienta; no inferir que el servicio esté caído.

No se identificó ni se abrió una instancia demo autenticada y saneada. No se evadió autenticación ni se usaron sesiones de clientes. Las capturas existentes inspeccionadas abajo son referencias históricas del repositorio, no nuevas pruebas de ejecución de esta auditoría.

## Inventario existente

Todos los archivos de `src/assets/` encontrados corresponden al tour. `public/brand/` contiene logos, isotipos, iconos de app, OG y preview MirAI. Tamaños aproximados del archivo fuente, no del recurso final servido.

| Archivo o familia | Observación y decisión |
| --- | --- |
| `src/assets/tour/inicio.png` — 344 KB, 1912 × 942 | Inspeccionado. Inicio con catálogo visual legible en escritorio; saludo/avatar identificables y fecha histórica. Útil para entender producto, reemplazar por demo saneada para publicar. No es un dashboard de indicadores empresariales. |
| `src/assets/tour/calendario.png` — 107 KB, 1915 × 941 | Inspeccionado. Calendario mensual con muy poco contenido y encabezado identificable. Rehacer con agenda ficticia que explique trabajo real. La presencia de un botón de integración no acredita conexión activa. |
| `src/assets/tour/empresa.png` — 192 KB, 1914 × 941 | Inspeccionado. Perfil de empresa con campos identificativos y de contacto. **No reutilizar sin reemplazo seguro.** No reproducir sus valores en notas o fixtures. Tampoco es una captura del selector multiempresa. |
| `public/brand/mirai-chat-preview.png` — 151 KB, 1916 × 941 | Inspeccionado. Pantalla inicial del asistente con saludo genérico, sin respuesta operativa ni confirmación. Encabezado identificable. Rehacer para demostrar la capacidad que acompañará el texto. |
| `public/brand/og-cover-es.png`, `og-cover-en.png` — 78 KB cada uno | ES inspeccionado: combina marca y captura histórica de inicio. EN no inspeccionado visualmente. Mantener dimensiones 1200 × 630 y rutas; renovar imágenes al aprobar nueva narrativa y captura saneada. |
| `runly-logo-light.png`, `runly-logo-dark.png` — 477/412 KB | Reutilizar identidad; nombres corresponden al uso actual en Header claro/Footer oscuro. Verificar contraste y transparencia de cada variante sobre el fondo final. No asumir variante por nombre sin abrirla. |
| `runly-logo-horizontal-light.png`, `runly-logo-horizontal-dark.png` — 568/526 KB | Variantes disponibles, no inspeccionadas individualmente. Elegir lockup según espacio, sin deformarlo ni sustituir tipografía del logotipo. |
| `runly-isotipo-light.png`, `runly-isotipo-dark.png` — 540/572 KB | Identidad reutilizable. Evitar repetir el isotipo como relleno en muchas escenas. Preparar derivados optimizados al implementar; conservar fuentes. |
| `runly-app-icon-light.png`, `runly-app-icon-dark.png` — 1.19/1.12 MB | Iconos existentes, no fondos decorativos de gran formato. Revisar peso servido para favicon/apple-touch-icon y generar derivados de tamaño adecuado sin reemplazar las fuentes indiscriminadamente. |
| `runly-isotipo-alter-blue.svg` — 2.5 KB | Variante vectorial existente. Revisar uso y coherencia antes de elegirla como protagonista; no convertir una variante secundaria en rebranding implícito. |

El tour del hero ya usa `astro:assets`, WebP y anchos responsivos. MirAI se carga desde `public/` como PNG. Preparar variantes responsivas de capturas nuevas, con relación de aspecto explícita y recortes que conserven la función relevante. No aplicar filtros CSS para simular una captura oscura.

## Manifiesto de capturas recomendadas

**Todos los IDs siguientes están PENDIENTES.** Son placeholders documentales: no existen archivos de demostración nuevos y no deben resolverse silenciosamente a una imagen ajena. Cada ruta es destino propuesto bajo `src/assets/home-v2/`, aún sin crear. Si una capacidad no está habilitada, conservar el ID y registrar bloqueo y versión, sin fabricar UI.

Preparación común: instancia demo autorizada; dos empresas ficticias, usuario ficticio y datos sintéticos; no clonar producción. Capturar 1440 × 1000 para escritorio y 390 × 844 para móvil, DPR 1 o 2 consistente, con fuentes y UI estables. Los sufijos `-light`/`-dark` representan temas reales del producto, no inversiones de color.

| ID / archivo propuesto | Estado y escena | Instrucciones exactas de obtención |
| --- | --- | --- |
| `HV2-01` / `inicio-light.webp` | Pendiente; apertura | Entrar a la demo → Inicio → mostrar módulos instalados y widgets existentes. Usar saludo/avatar ficticios; no crear KPIs que el producto no ofrece. Capturar primero pantalla completa y luego derivado editorial. |
| `HV2-02` / `multiempresa-light.webp` | Pendiente; contexto | Desde Inicio abrir el selector de empresa de la barra superior → mostrar dos empresas demo y selección activa. Sin listas de clientes reales. Segunda captura tras cambiar de empresa para verificar continuidad y permisos. |
| `HV2-03` / `modulos-light.webp` | Pendiente; modularidad | Administración de módulos de la demo → mostrar módulos reales y estados instalados/habilitados. Ocultar cualquier ID técnico o destino de infraestructura; no activar ni instalar para crear la toma. |
| `HV2-04` / `studio-dark.webp` | Pendiente; crear | Abrir Studio → diseño sintético de etiqueta o publicación → seleccionar texto/forma y mostrar inspector/capas. Usar recursos propios/CC0 o con atribución conservada. Registrar versión y qué herramientas están habilitadas. Exportación opcional de prueba, sin publicar plantillas. |
| `HV2-05` / `automatizaciones-light.webp` | Pendiente; coordinar | Abrir Automatizaciones → flujo demo en pausa → mostrar disparador, condición y acción autorizada legibles. No usar URLs, correos o webhooks reales. Para mostrar historial, ejecutar solo sobre entorno y destinatarios de prueba autorizados. |
| `HV2-06` / `website-light.webp` | Pendiente; presencia web | Abrir Website → sitio demo → borrador/editor → vista previa. Capturar estado de borrador y revisión. No pulsar publicar ni conectar dominio. Si se muestra resultado público, usar sitio demo ya autorizado y marcarlo como tal. |
| `HV2-07` / `developer-hub-dark.webp` | Pendiente; extender | Portal Hub → proyecto ficticio → revisión → Playground con datos de prueba. Mostrar definición/preview o diagnóstico existente, sin tokens, tenant real o ZIP privado. No encolar builds ni releases para obtener la toma. |
| `HV2-08` / `marketplace-light.webp` | Pendiente; descubrir | Abrir `/marketplace/` y catálogo de módulos comunitarios → capturar recursos realmente publicados y su nivel de confianza. Si no hay catálogo, capturar el estado «en preparación»; no importar fixtures como si fueran publicaciones. |
| `HV2-09` / `mirai-chat-dark.webp` | Pendiente; asistencia | Chat → MirAI → consulta sintética sobre un proyecto demo autorizado. Capturar respuesta con registro verificable. Segunda toma de propuesta pendiente de confirmar, sin ejecutar una mutación solo por la captura. Si IA no está configurada, registrar bloqueo. |
| `HV2-10` / `pos-light.webp` | Pendiente; operación | POS demo → caja con productos ficticios y, si existe, mesas/comandas de prueba. No cobrar ni imprimir datos reales. Alternativa: Proyectos → tablero con tareas y responsables ficticios si POS no está disponible. |
| `HV2-11` / `proyecto-light.webp` | Pendiente; hilo operativo | Proyectos demo → proyecto y tarea → conversación o vínculo que el producto realmente soporte. Repetir el mismo nombre ficticio en las tomas relacionadas; si el enlace no existe, no crear la relación editorial. |

Cada captura necesita registro al obtenerse: ID, archivo, fecha, revisión/versión, entorno demo, tema, viewport, idioma, acción representada, estado de capacidad, revisión de privacidad, licencia y alt ES/EN. No guardar direcciones privadas del entorno en este manifiesto.

## Capturas de la home que faltan para cerrar la auditoría visual

1. `AUDIT-01`: home ES, primer viewport y página completa, 1440 px; verificar navegación, legibilidad y aparición del producto.
2. `AUDIT-02`: home ES a 390 px, menú abierto y cerrado; teclado/foco y solapamiento con chat.
3. `AUDIT-03`: recorrido por producto, MirAI y formulario; comprobar que las animaciones no oculten contenido ni cambien el foco.
4. `AUDIT-04`: home EN con las mismas dimensiones; paridad, desbordamiento de textos y destinos solo ES.
5. `AUDIT-05`: cuando se implemente el tema, repetir light/dark, sistema y movimiento reducido.

Guardar y abrir cada archivo antes de aceptarlo; descartar carga incompleta, bloqueo o captura de ventana equivocada. Anotar hallazgos por ID. Sin esas tomas, no declarar auditoría visual completa ni cumplimiento WCAG.

## Criterios de uso en diseño

- Revisar captura completa, incluyendo barras, avatares, notificaciones y tooltips. Rehacer con datos ficticios es preferible a ocultar media interfaz. No copiar las capturas históricas a archivos nuevos.
- Capturas demuestran UI; diagramas explicativos deben distinguirse de la UI real. No usar un render generado con IA como evidencia de una función.
- Conservar una toma completa y una derivada para composición. En móvil usar acercamiento significativo o captura móvil real; no reducir un escritorio de 1900 px a una miniatura ilegible.
- Alt propuesto por contenido: «Proyecto de demostración con tareas agrupadas por estado», no «dashboard revolucionario». Traducir por locale y no incrustar titulares comerciales dentro del bitmap.
- Una captura oscura no implica que toda la web tenga dark mode. La web y el producto son superficies diferentes.
