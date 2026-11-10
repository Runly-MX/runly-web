# Criterios de aceptación y entrega de fase 1

Fecha: 2026-11-09. Estos criterios separan la investigación entregada de las verificaciones necesarias para una futura home. No significan que el rediseño esté implementado o aprobado.

## Entrega documental actual

- [x] Cinco documentos bajo `docs/home-v2/`, sin cambios propios en interfaz, dependencias o documentación generada.
- [x] Matriz con fuentes, estados, alcance de comprobación y restricciones por capacidad; distinción entre MirAI, MCP ERP, MCP Hub y plugin ChatGPT.
- [x] Narrativa por escenas y dirección de continuidad de identidad; referencias tratadas como inspiración, sin imponer layout final.
- [x] Inventario de activos y evaluación de capturas existentes; placeholders identificables e instrucciones para todas las superficies solicitadas.
- [x] Arquitectura Astro para temas, animación progresiva, móvil, movimiento reducido, SEO y bilingüismo.
- [x] Contratos de rutas, anclas, Marketplace, formulario, SDK, analytics y chat identificados.
- [ ] Auditoría visual de la home en navegador: bloqueada por host integrado no disponible. No se declara cerrada ni se deduce desde imágenes históricas.
- [ ] Capturas nuevas de producto: no hay instancia demo saneada verificada. Pendientes con IDs `HV2-01` a `HV2-11`.
- [ ] Acreditación comercial de las capacidades marcadas 2/3 y listing público del plugin: requiere evidencia de lanzamiento o decisión de producto.

## Condiciones para empezar diseño e implementación

- [ ] Dirección visual seleccionada conserva logotipo/isotipo y continuidad navy/naranja; cualquier cambio de tipografía base o identidad se acuerda explícitamente.
- [ ] Cada escena tiene pregunta, prueba, texto ES/EN y CTA. No repite una grilla por inercia ni necesita animación para entenderse.
- [ ] Cada capacidad mostrada tiene estado comercial acordado. «En preparación» es visible donde corresponda; las demostraciones no parecen disponibilidad universal.
- [ ] Al menos un caso operativo es reproducible en demo y sus vínculos coinciden con el producto. No flechas que inventen automatización o sincronización.
- [ ] Capturas completas revisadas por privacidad y licencias; datos sintéticos, sin identidades de clientes, direcciones privadas ni cifras financieras reales. No reutilizar el perfil de empresa histórico.
- [ ] Las dos referencias se usan por principios de jerarquía, espacio y profundidad; no se copian sus marcas, layouts, patrones o métricas.

## Aceptación funcional del futuro rediseño

- [ ] Astro sigue generando estáticos; no runtime servidor nuevo ni migración de framework.
- [ ] Preferencia `system/light/dark` persiste, sigue al sistema cuando corresponde, funciona con storage bloqueado, sincroniza pestañas y evita destello de tema al cargar.
- [ ] Ambos temas funcionan en shell, home, menús, formulario y páginas compartidas; las escenas intencionalmente oscuras conservan contraste. Chat/Turnstile no quedan ilegibles.
- [ ] Sin JS, las escenas y FAQ siguen legibles y los enlaces navegan. No hijos de bento transparentes ni primera escena oculta.
- [ ] Movimiento reducido, activado antes o durante la visita, desactiva desplazamiento animado, parallax, autoplay y scrub sin perder contenido.
- [ ] Desktop/móvil usan scroll nativo; ninguna escena bloquea rueda, teclado, foco o CTA. Sticky termina de forma predecible.
- [ ] Teclado: navegación, menús, tema, tabs si existen, FAQ y formulario con foco visible; Escape y devolución de foco correctos. Autoplay tiene pausa accesible si se conserva.
- [ ] Contraste de texto normal ≥ 4.5:1, texto grande ≥ 3:1, controles/foco distinguibles; evaluación manual con lector de pantalla en el recorrido principal. No declarar WCAG solo por Lighthouse.
- [ ] Sin overflow horizontal a 320/390/768/1440 px, zoom 200 % y landscape. Pruebas visuales con textos EN largos; menú y chat no tapan acciones.
- [ ] Formulario mantiene mapping Growth, validación, consentimiento, honeypot, Turnstile opcional, idempotencia y estados accesibles. En entorno demo: éxito, error, reintento y falta de configuración. No lead real de prueba.
- [ ] Analytics conserva modo off/anonymous/consent_required y no concede consentimiento por cambiar tema. SDK único compartido con chat y formulario.
- [ ] Rutas y anclas del plan resuelven. Marketplace conserva kill switch, estados, confianza, política de indexación y destinos solo ES.
- [ ] ES/EN tienen paridad de escena y traducciones completas, sin alternates a páginas inexistentes ni UI ES accidental en la home EN.
- [ ] Canonical, hreflang, sitemap, OG y JSON-LD siguen coherentes; no datos estructurados de precios, ratings o funcionalidades no comprobadas.

## Aceptación de calidad y rendimiento posterior

- [ ] Guardar baseline antes de implementar y comparación con mismo viewport/perfil de red; incluir home ES/EN, temas y movimiento reducido.
- [ ] Medir peso total y JS nuevo; justificar presupuestos excedidos del plan. Solo recurso LCP prioritario, imágenes dimensionadas, sin saltos por fuentes/capturas.
- [ ] Objetivos de campo: LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms en p75 cuando haya tráfico suficiente. Laboratorio documentado aparte, sin inventar métricas actuales.
- [ ] `pnpm build` y pruebas dirigidas de diccionario/catálogo/rutas afectadas pasan durante implementación; usar los scripts reales de Web, que actualmente usa Vitest. No trasladar por costumbre los comandos Node del ERP a este repositorio.
- [ ] Si se modifica React, aplicar la revisión React correspondiente. No suite E2E global de los tres repositorios por una home.
- [ ] Revisar capturas finales, errores de consola y regresión de páginas que comparten shell/estilos. Abrir cada captura antes de aceptarla.
- [ ] Privacidad y whitespace sin hallazgos nuevos. Solo cambios propios incluidos en commit; sin push, deploy o publicación en esta fase.

## Decisiones y riesgos que debe respetar quien implemente

1. La identidad debe evolucionar desde Runly; no hay rebranding autorizado ni composición final aprobada.
2. Marketplace no es sinónimo de módulos oficiales. Studio/automatizaciones del feed, Website templates y Solutions tienen distintos estados de avance.
3. Una conexión MCP no prueba listing público ni aprobación de un plugin por OpenAI. No presentar a MirAI como ChatGPT embebido.
4. La evidencia local no demuestra release productiva. Antes de cambiar un estado comercial, registrar versión, fecha y verificación del responsable.
5. Los archivos compartidos afectan todo el sitio. No borrar lógica de menú, sitemap, consentimiento, chat o formularios para facilitar una animación.
6. Los activos históricos necesitan saneamiento o sustitución. Que ya estén versionados no acredita permiso para una nueva campaña.

## Registro de verificaciones de esta sesión

| Comprobación | Resultado |
| --- | --- |
| Cinco Markdown, enlaces relativos y UTF-8 sin carácter de sustitución | Correcto; cinco documentos, sin hallazgos en el chequeo dirigido. |
| Inspector de privacidad del ERP aplicado a los cinco documentos nuevos | Correcto; cero hallazgos. |
| `git diff --check` / revisión del contenido preparado | Correcto al cierre documental. |
| `pnpm check:privacy` en ERP | Falló: 72 hallazgos en archivos ajenos a esta tarea. No se copian valores detectados ni se modifican esos archivos. |
| Inspector del ERP ejecutado sobre todo Web (`node ../runly/scripts/check-repository-privacy.mjs`) | Falló: 28 hallazgos en archivos ajenos a esta tarea. Web no tiene script `check:privacy` propio. |
| Navegador integrado | Bloqueado: host no disponible; sin auditoría visual completa. |
| Builds, suites unitarias y E2E | Omitidos: solo se agregaron documentos; no hay cambio de aplicación que justifique ejecutarlos. |

Los cambios de otra sesión se preservaron. La rama documental solicitada por el brief es `feature/home-v2-audit`; no se hizo push ni deploy. Las verificaciones completas de privacidad no están aprobadas: el resultado dirigido no debe interpretarse como aprobación global del repositorio. Una primera invocación del chequeo dirigido falló por quoting del shell antes de analizar archivos; se corrigió la invocación y el chequeo efectivo pasó.
