# Narrativa e identidad — evolución de Runly

Fecha: 2026-11-09. Leer junto con [capacidades](CAPABILITIES.md), [recursos](VISUAL-ASSETS.md) y [arquitectura](TECHNICAL-PLAN.md). Alcance: briefing; no diseño implementado.

## Decisión central

Runly es una plataforma empresarial extensible para operar, colaborar, crear, automatizar e integrar procesos. ERP modular es una base concreta para entenderla; Studio, Website y el ecosistema de desarrollo amplían esa base con distintos niveles de disponibilidad.

El visitante principal es quien organiza una empresa y evalúa una implementación. El desarrollador tiene un recorrido secundario hacia Runly Developer. No comenzar con RME3, MCP, toolchains o firmas: introducirlos cuando explican cómo se adapta el producto.

Resultado buscado: entender qué trabajo puede reunir Runly, ver pruebas concretas y solicitar una demostración con alcance realista. No hay evidencia para convertir el CTA en registro gratuito o prueba inmediata.

## Identidad propia, reconocible y mejorada

La petición del usuario exige continuidad de marca. Conservar el logotipo y su isotipo, el azul profundo, el naranja característico, la familia Plus Jakarta Sans y la idea «Business in motion». Mejorar jerarquía, contraste, ritmo, espacio y calidad de las pruebas de producto. No redibujar la marca ni introducir otra identidad por parecer más novedosa.

Base existente en `src/styles/global.css`: navy `#070d1e`, midnight `#0b132b`, darkcard `#111b38`, naranja `#ff5e14`, ámbar `#ff9f1c`, azul `#0e3a8c`, superficie `#f8fafc`. Son anclas de continuidad, no una paleta final ya aprobada. El naranja debe señalar avance, selección y acción; el azul debe sostener claridad y profundidad. Los colores de módulos ayudan a identificarlos sin convertir cada escena en un arcoíris.

Idea de dirección para explorar: **el movimiento de una operación entre herramientas conectadas**. El hilo visual puede acompañar un registro, una tarea o una pieza de trabajo a lo largo de las escenas. El desplazamiento revela relaciones verificadas; no dibuja integraciones inexistentes. La forma final de ese hilo, encuadres, materiales y transiciones queda al criterio de la dirección artística.

### Lectura de las dos referencias aportadas

| Referencia | Principio aprovechable | Traducción propia para Runly |
| --- | --- | --- |
| Accretion, fondo claro y gran ventana de producto | Mensaje de gran jerarquía, espacio para respirar y producto protagonista. | Dar espacio a una prueba real y a un mensaje preciso. No copiar su marco exterior negro, malla de túnel, composición ni navegación como receta. |
| Oringo, fondo oscuro y acento naranja | Profundidad, foco y contraste entre mensaje y pequeñas pruebas operativas. | Trabajar desde el navy y naranja Runly. No adoptar el titular serif, patrón de cruces, brillos extensos ni métricas de ejemplo como identidad. |

Los mockups de las referencias son inspiración visual, no evidencia de funciones Runly. No usar sus paneles, personas, cifras o marcas dentro de la home. El buen resultado debe reconocerse como Runly incluso sin mostrar el nombre en el primer segundo.

## Propuesta de mensajes

Son borradores de contenido, no layouts ni titulares definitivos. Toda frase secundaria depende de los estados de `CAPABILITIES.md`.

| Uso | Español | English |
| --- | --- | --- |
| Titular candidato | Tu operación conectada. Espacio para crear lo que sigue. | Your operations, connected. Room to build what comes next. |
| Bajada | Reúne la operación y la colaboración de tu empresa en una plataforma modular que puedes ampliar con herramientas y procesos propios. | Bring your business operations and collaboration into a modular platform you can extend with your own tools and processes. |
| CTA principal | Solicitar una demostración | Request a demo |
| CTA de exploración | Explorar la plataforma | Explore the platform |
| Acceso técnico | Conocer Runly Developer | Explore Runly Developer |

«Espacio para crear» debe apoyarse en ejemplos de extensibilidad y, cuando se muestre Studio/Website, indicar su disponibilidad correspondiente. Evitar «todo conectado» como garantía de cualquier combinación. Explicar conexiones específicas demostradas.

## Relato por escenas

El orden siguiente es editorial y adaptable. No exige una sección, un componente o una altura de pantalla por escena. Elegir pocas transiciones significativas; evitar ocho estaciones idénticas.

| Escena | Pregunta y mensaje | Prueba y revelación al desplazarse | Salida útil |
| --- | --- | --- | --- |
| 1. Un lugar para trabajar | ¿Qué es Runly? Operación y colaboración reunidas, con capacidad de ampliarse. | Inicio real limpio: una acción o módulo legible tiene más valor que una cuadrícula enorme reducida. El producto aparece temprano y conserva su UI real. | Explorar o pedir demo. |
| 2. El contexto de tu empresa | ¿Quién trabaja y con qué acceso? Cada empresa tiene sus miembros y permisos. | Selector multiempresa real; cambio entre dos empresas ficticias. Mantener visible el contexto, sin sugerir acceso cruzado. | Explicar multiempresa con lenguaje cotidiano. |
| 3. Del trabajo al seguimiento | ¿Qué puedo resolver hoy? Elegir un caso demostrable: proyecto → tarea → conversación o compra → recepción → activo. | Capturas del mismo caso y registros ficticios. La conexión se muestra solo si se reproduce en demo; de otro modo, escenas de tareas independientes sin flecha causal. | Catálogo de módulos y documentación. |
| 4. Crear desde el negocio | ¿Puedo producir mis materiales y presencia web? Introducir Studio y Website como superficies distintas. | Un diseño editable y su salida; un sitio en borrador y su revisión. Un cambio de escala/encuadre puede conectar ambas ideas, sin fingir sincronización automática entre ellas. | Demo según disponibilidad. |
| 5. Pasar de pasos a procesos | ¿Qué tareas puedo coordinar? Un flujo legible con disparador, condición y acción. | Mostrar el editor real y el resultado de una ejecución de prueba autorizada. No reproducir todo el grafo ni vender «automatización total». | Comprender revisión, activación y control. |
| 6. Asistencia con contexto | ¿Cómo ayuda la IA? MirAI consulta información autorizada y puede preparar acciones. | Pregunta sintética, respuesta verificable y propuesta pendiente de confirmar. No mostrar ejecución autónoma si requiere confirmación. | Más información sobre MirAI. |
| 7. Lo que Runly puede llegar a ser para tu empresa | ¿Cómo crece conmigo? Módulos propios, recursos reutilizables e integración con asistentes externos. | Developer Hub y catálogo con estados reales. Distinguir visual/editorialmente capacidad pública, demostración y «en preparación». No dar protagonismo comercial a Solutions hasta completar su flujo. | Developer, Marketplace o implementación. |
| 8. Empezar con alcance claro | ¿Cuál es el siguiente paso? Revisar procesos, módulos y adaptación con el equipo de Runly. | Proceso de implementación conciso, preguntas frecuentes relevantes y formulario existente. | Solicitar demo/propuesta. |

En móvil, el relato conserva orden y significado como contenido lineal. Los titulares deben explicar cada escena aun sin animación. Un recorrido sin scroll animado debe permitir tomar la misma decisión.

## Qué cambiar del relato actual

- El hero, About, Flexibility y WhyChoose repiten modularidad, conexión y crecimiento. Asignar a cada escena una sola pregunta y una prueba distinta.
- El catálogo destacado se centra en seis módulos y deja Studio, Website y automatizaciones fuera del núcleo del relato. Introducirlos por trabajos concretos, respetando disponibilidad, sin ampliar simplemente el grid.
- MultiCompany usa una maqueta HTML. Reemplazarla en implementación por captura segura o marcar claramente una explicación conceptual; no presentarla como UI actual.
- Mantener la conversión consultiva. Conservar `#modulos`, `#implementacion`, `#contacto` y enlaces existentes aunque cambie la composición.
- La home ES incluye un teaser Marketplace que EN no tiene; decidir paridad editorial y traducir el texto. Enlaces hacia destinos solo ES deben advertir el idioma.

## Reglas de honestidad editorial

MirAI es el asistente dentro de Runly. MCP es un protocolo/servidor de acceso autorizado para asistentes externos. El paquete/plugin de ChatGPT es una forma de conexión/distribución, con revisión y disponibilidad propias. Developer Hub gestiona proyectos; el ERP gestiona datos empresariales. No fusionar estos conceptos en «una IA que hace todo».

No publicar cifras de módulos, clientes, ingresos, ahorro, uptime o rendimiento sin fuente vigente y responsable. Revisar especialmente las promesas heredadas de escalado, plazos de implementación, backups y precio. No inventar testimonios, logos de clientes, disponibilidad de pagos o integraciones.

## Libertad de dirección artística y pendientes

Claude puede explorar composición, ritmo, encuadres, transiciones y uso de luz/oscuridad sin repetir los layouts actuales. Debe conservar marca, realidad del producto, accesibilidad, rutas y el contrato de conversión. No hay mockup final seleccionado en esta fase.

Pendientes de producto: versión comercial por capacidad; caso operativo que se puede reproducir de extremo a extremo; disponibilidad/listing del plugin; recursos Marketplace publicados; capturas demo seguras. Mientras falten, el prototipo debe usar los IDs de recursos pendientes y estados explícitos del manifiesto, sin convertirlos en prueba comercial.
