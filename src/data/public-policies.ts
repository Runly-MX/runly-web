import type { LegalPageDictionary } from "../i18n/types";

const lastUpdated = "Última actualización: 7 de octubre de 2026";

export const developerPage: LegalPageDictionary = {
  metaTitle: "Runly Developer | Módulos declarativos RME3",
  metaDescription: "Crea, modifica y valida módulos RME3 con Runly Developer. Conoce el portal, la conexión MCP con OAuth y las acciones que requieren aprobación humana.",
  eyebrow: "Runly Developer",
  title: "Desarrollo de módulos RME3",
  lastUpdated: "Última actualización: 23 de octubre de 2026",
  intro: "Runly Developer es el producto de Runly para crear, modificar, validar y preparar módulos declarativos RME3. Está dirigido a quienes desarrollan y mantienen módulos con acceso autorizado a sus espacios de trabajo.",
  sections: [
    {
      heading: "Qué puedes hacer",
      paragraphs: ["Puedes consultar documentación RME3 y trabajar con tenants (espacios de organización), proyectos y revisiones. El flujo incluye validaciones, builds (compilaciones), artifacts (artefactos), versiones y solicitudes de release o review (liberación o revisión)."],
      list: ["Crear y modificar módulos declarativos RME3.", "Validar cambios y preparar builds y sus artefactos.", "Preparar versiones y solicitudes para los procesos de revisión y liberación."],
    },
    {
      heading: "Portal y conexión MCP",
      paragraphs: ["El portal de Runly Developer está en devs.runly.mx. La integración MCP está disponible en https://mcp.devs.runly.mx/ y usa autenticación OAuth. Al conectarla, revisa la cuenta, el espacio de trabajo y los permisos que autorizas; las operaciones dependen de tus accesos."],
    },
    {
      heading: "Compatibilidad y documentación",
      paragraphs: ["Runly Developer MCP gestiona proyectos de desarrollo; el MCP de Runly ERP es una integración distinta para trabajar con datos empresariales autorizados. Conectar uno no concede acceso al otro.", "El compilador del Hub puede usar una revisión fijada de los contratos y librerías RME3. Consulta los contratos de la conexión activa antes de usar componentes nuevos del ERP: compilar, mostrar una vista previa y ejecutar un módulo son comprobaciones diferentes.", "Consulta las guías en /documentacion/desarrolladores y la guía MCP de esa sección para empezar. En clientes compatibles, como ChatGPT y Codex, la disponibilidad depende de la conexión autorizada, el paquete instalado y las herramientas descubiertas; no implica publicación o aprobación del plugin por OpenAI."],
    },
    {
      heading: "Aprobaciones y alcance",
      paragraphs: ["Algunas operaciones sensibles requieren aprobación humana. Una validación o un build no sustituyen la revisión de contenido, permisos, dependencias y resultados por una persona autorizada.", "Runly Developer no firma módulos, no aprueba reviews, no modera y no publica oficialmente por sí mismo. Preparar una solicitud de release o review no equivale a obtener una aprobación ni a publicar un módulo."],
    },
    {
      heading: "Datos y ayuda",
      paragraphs: ["Runly Developer opera con un backend self-hosted. Se minimizan los datos utilizados para sus funciones y se aplican políticas técnicas de ciclo de vida, borrado, respaldos cifrados y recuperación.", "Consulta la política de privacidad y los términos de servicio antes de conectar tu cuenta. Para ayuda con OAuth, MCP, módulos o acceso, escribe a developers@runly.mx."],
    },
  ],
};

export const supportPage: LegalPageDictionary = {
  metaTitle: "Soporte de Runly y Runly Developer",
  metaDescription: "Obtén ayuda con Runly Developer, conexión OAuth, MCP, módulos RME3 y tu cuenta. Contacto de soporte: support@runly.mx.",
  eyebrow: "Ayuda",
  title: "Soporte de Runly y Runly Developer",
  lastUpdated,
  intro: "Escribe a support@runly.mx para recibir ayuda con Runly y Runly Developer, reportar un problema o consultar sobre tu cuenta. Usa este mismo contacto para dudas de privacidad o seguridad.",
  sections: [
    {
      heading: "Conexión y autenticación OAuth",
      paragraphs: ["Si la conexión falla, verifica que hayas iniciado sesión con la cuenta correcta y que tengas acceso al tenant o proyecto. Revisa los permisos solicitados al autorizar OAuth. Si una autorización dejó de ser válida, puedes iniciar de nuevo el flujo de conexión.", "Para desconectar la integración, usa los controles de desconexión o revocación disponibles en el cliente que utilizas. Si necesitas ayuda para revocar el acceso en Runly, escríbenos. Desconectar la integración no elimina automáticamente tus proyectos o revisiones."],
    },
    {
      heading: "Problemas con MCP",
      paragraphs: ["Comprueba que tu cliente use el endpoint https://mcp.devs.runly.mx/ y permita autenticación OAuth. Al reportar un error, indica el cliente utilizado, la operación, la fecha y hora con zona horaria y el mensaje de error sin credenciales.", "Si la operación requiere aprobación humana o permisos adicionales, revisa ese estado antes de repetirla. Evita reintentar una operación de escritura sin comprobar si ya se completó."],
    },
    {
      heading: "Módulos, validaciones y builds",
      paragraphs: ["Para problemas con RME3, indica el proyecto, la revisión y el identificador de validación o build, cuando existan. Incluye los pasos para reproducir el problema y un ejemplo mínimo sin información confidencial.", "Podemos atender dudas del flujo de módulos, artefactos, versiones y solicitudes de release o review. Runly Developer no firma módulos, no aprueba reviews, no modera y no publica oficialmente por sí mismo."],
    },
    {
      heading: "Cuenta y espacios de trabajo",
      paragraphs: ["Para problemas de acceso, indica el correo de tu cuenta y el tenant o proyecto afectado. La administración de permisos corresponde a quienes estén autorizados en tu organización. También puedes solicitar orientación para dejar de usar el servicio, revocar autorizaciones o eliminar datos."],
    },
    {
      heading: "Qué incluir y qué proteger",
      paragraphs: ["Describe qué esperabas, qué ocurrió y cómo reproducirlo. Comparte únicamente la información necesaria para investigar el caso."],
      list: ["Oculta datos personales o confidenciales en capturas y archivos.", "No envíes contraseñas, tokens OAuth, claves API ni credenciales de terceros.", "Si sospechas una exposición de credenciales, revócalas o rótalas con su proveedor y reporta el incidente a support@runly.mx."],
    },
  ],
};

export const privacyPage: LegalPageDictionary = {
  metaTitle: "Política de privacidad | Runly y Runly Developer",
  metaDescription: "Cómo Runly y Runly Developer utilizan datos de cuenta, OAuth, proyectos y registros técnicos; retención, eliminación, respaldos cifrados y contacto.",
  eyebrow: "Privacidad",
  title: "Política de privacidad",
  lastUpdated,
  intro: "Esta política explica el tratamiento de información al visitar el sitio de Runly, contactar al equipo o utilizar Runly y Runly Developer, incluidos el portal y la integración MCP. Las funciones disponibles y los datos tratados dependen del servicio y de los permisos que utilices.",
  sections: [
    {
      heading: "Cuenta y autenticación",
      paragraphs: ["Tratamos la información de cuenta y contacto que proporcionas, los identificadores de usuario y organización, los permisos y los datos de sesión necesarios para autenticarte y controlar el acceso.", "Runly Developer utiliza OAuth. La autorización y los tokens asociados permiten ejecutar operaciones dentro del alcance concedido. No publiques esos tokens ni los incluyas en módulos, documentación pública o solicitudes de soporte."],
    },
    {
      heading: "Información enviada y resultados",
      paragraphs: ["Procesamos la información enviada a las herramientas de Runly Developer: instrucciones, contenido de módulos RME3, archivos y otros datos que decidas aportar para una operación. Esto puede incluir datos personales o información de tu organización si los incorporas al contenido.", "También tratamos tenants, proyectos, revisiones, validaciones, builds, artefactos, versiones y solicitudes de release o review, junto con los identificadores, estados y resultados necesarios para ejecutar sus funciones y mantener la trazabilidad."],
    },
    {
      heading: "Para qué utilizamos la información",
      paragraphs: ["Utilizamos estos datos para prestar las funciones solicitadas, administrar cuentas y permisos, validar y preparar módulos, dar seguimiento a operaciones, atender soporte y proteger el servicio. Minimizamos la información utilizada conforme a la función que se ejecuta.", "La información y los resultados de una herramienta pueden regresar al cliente desde el que la invocaste. Antes de enviar contenido, comprueba que tienes autorización para compartirlo y considera quién puede acceder a ese cliente o conversación."],
    },
    {
      heading: "Registros técnicos, seguridad y sitio web",
      paragraphs: ["Los registros técnicos pueden incluir identificadores de operación, fechas, estados, errores y datos de conexión, como dirección IP o información del cliente. Se utilizan para diagnosticar fallas, investigar incidentes y controlar accesos. No incluyas secretos en mensajes o campos que puedan quedar registrados.", "Al contactarnos, tratamos los datos del formulario y el contenido de tus comunicaciones para atenderte. El sitio integra funciones de analítica y chat cuya actividad depende de la configuración y disponibilidad del servicio. Las funciones de autenticación pueden usar almacenamiento de sesión o tecnologías similares para mantener el acceso."],
    },
    {
      heading: "Infraestructura, proveedores y terceros",
      paragraphs: ["Runly Developer utiliza un backend self-hosted. Cuando corresponda, proveedores de infraestructura, almacenamiento, comunicaciones o servicios técnicos pueden procesar los datos necesarios para operar y mantener el servicio. Puedes consultar información sobre los proveedores aplicables a tu uso escribiendo a privacy@runly.mx.", "Si utilizas Runly Developer desde un cliente de terceros, como ChatGPT, ese cliente trata la información que le compartes conforme a sus propias políticas. Esta política describe el tratamiento en Runly; no sustituye las políticas del cliente ni de otros servicios conectados.", "Los datos también pueden ponerse a disposición de usuarios autorizados de tu organización según sus permisos, o comunicarse cuando sea necesario atender un requerimiento legal aplicable."],
    },
    {
      heading: "Retención, eliminación y respaldos",
      paragraphs: ["Aplicamos políticas técnicas de ciclo de vida y borrado. La retención depende del tipo de dato, del estado del proyecto y de las necesidades de operación, seguridad y recuperación. Los proyectos y sus revisiones se conservan mientras sean necesarios para el trabajo autorizado; los registros técnicos y artefactos siguen el ciclo de vida aplicable a su función.", "Puedes solicitar la eliminación de datos o consultar la retención aplicable a tu cuenta en privacy@runly.mx. Verificamos tu identidad y autorización sobre el espacio afectado antes de tramitar solicitudes. Ciertos registros pueden requerir conservación por motivos de seguridad u obligaciones aplicables; si eso afecta tu solicitud, te explicaremos el alcance.", "Existen respaldos cifrados y mecanismos de recuperación. El borrado en los sistemas activos no implica la eliminación inmediata de todas las copias de respaldo: estas siguen su ciclo de retención y eliminación. No se establece aquí un plazo uniforme de conservación o recuperación."],
    },
    {
      heading: "OAuth, revocación y controles",
      paragraphs: ["Puedes dejar de usar la integración y revocar o desconectar su autorización mediante los controles disponibles en el cliente. Para ayuda con la revocación en Runly o con el acceso a tu cuenta, contáctanos.", "Revocar OAuth limita el acceso autorizado de la integración; no equivale a borrar proyectos, revisiones, artefactos o registros ya existentes. La eliminación se solicita y gestiona por separado."],
    },
    {
      heading: "Protección de credenciales",
      paragraphs: ["Las credenciales de terceros no deben exponerse públicamente. No incorpores contraseñas, tokens, claves API o secretos a módulos, artefactos públicos, capturas o documentación. Utiliza los mecanismos de secretos que correspondan a tu entorno y comparte solo los datos necesarios.", "Si una credencial se expuso, revócala o rótala con su proveedor y contacta a Runly para investigar la información que pudiera haberse enviado al servicio."],
    },
    {
      heading: "Solicitudes, contacto y cambios",
      paragraphs: ["Para consultar, corregir o solicitar la eliminación de tu información, revocar autorizaciones o plantear dudas sobre privacidad, escribe a privacy@runly.mx. Indica tu cuenta y la solicitud, sin enviar credenciales.", "Las actualizaciones de esta política se publicarán en esta página con su fecha. Puedes consultar al equipo si un cambio afecta al tratamiento de tu información."],
    },
  ],
};

export const termsPage: LegalPageDictionary = {
  metaTitle: "Términos de servicio | Runly y Runly Developer",
  metaDescription: "Condiciones de uso de Runly y Runly Developer: cuentas, contenido, módulos RME3, artefactos, aprobaciones humanas, disponibilidad y revocación.",
  eyebrow: "Términos",
  title: "Términos de servicio",
  lastUpdated,
  intro: "Estos términos regulan el acceso y uso de Runly y Runly Developer, incluido el portal y la integración MCP. Al utilizar los servicios aceptas estas condiciones. Si actúas en nombre de una organización, debes contar con autorización para hacerlo.",
  sections: [
    {
      heading: "Cuenta, permisos y autorización",
      paragraphs: ["Mantén actualizada la información de tu cuenta y protege tus credenciales. Utiliza únicamente tenants, proyectos y datos sobre los que tengas autorización. La administración de accesos de una organización corresponde a sus personas autorizadas.", "Al conectar Runly Developer por OAuth, revisa los permisos y la cuenta que autorizas. Eres responsable de las instrucciones que envías y de comprobar su alcance antes de solicitar una operación."],
    },
    {
      heading: "Alcance del servicio",
      paragraphs: ["Runly Developer permite consultar documentación RME3 y crear, modificar, validar y preparar módulos declarativos. Puede trabajar con tenants, proyectos, revisiones, validaciones, builds, artefactos, versiones y solicitudes de release o review según los permisos y funciones disponibles.", "Las condiciones comerciales o de servicio específicas que se acuerden contigo por separado se aplican a su alcance. Estos términos no establecen tarifas ni compromisos de soporte adicionales."],
    },
    {
      heading: "Uso aceptable",
      paragraphs: ["Utiliza el servicio de manera profesional, dentro de los permisos concedidos y respetando los derechos de otras personas y organizaciones."],
      list: ["No accedas a cuentas, tenants, proyectos o datos sin autorización.", "No eludas controles de seguridad, permisos, validaciones ni aprobaciones humanas.", "No introduzcas código malicioso ni uses módulos o herramientas para actividades ilícitas o para infringir derechos de terceros.", "No expongas credenciales o información confidencial ni publiques contenido que no tengas derecho a compartir.", "No interfieras deliberadamente con el servicio, sobrecargues su infraestructura ni alteres registros para ocultar acciones."],
    },
    {
      heading: "Contenido del usuario y propiedad",
      paragraphs: ["Conservas los derechos que te correspondan sobre el contenido que aportas. Debes contar con los derechos y autorizaciones necesarios para utilizarlo en el servicio.", "Autorizas a Runly a procesar, almacenar y transmitir ese contenido en la medida necesaria para ejecutar las funciones solicitadas, mantener su operación y atender soporte conforme a la política de privacidad. Esta autorización no transfiere la propiedad de tu contenido.", "El software, marca y documentación de Runly conservan sus derechos y licencias aplicables. El uso del servicio no transfiere su propiedad."],
    },
    {
      heading: "Módulos y artefactos generados",
      paragraphs: ["Los módulos, cambios y artefactos preparados pueden contener contenido que aportaste, componentes de Runly o dependencias de terceros. Su uso está sujeto a los derechos y licencias correspondientes; el servicio no concede derechos sobre material de terceros que no tengas.", "Revisa los resultados, las dependencias, los permisos y la seguridad antes de utilizarlos o distribuirlos. Una validación o compilación satisfactoria no garantiza que un módulo sea adecuado para producción, esté libre de errores o cumpla todos los requisitos de tu organización."],
    },
    {
      heading: "Acciones sensibles y aprobación humana",
      paragraphs: ["Algunas operaciones sensibles requieren aprobación de una persona autorizada. Debes respetar ese proceso y revisar el efecto de los cambios antes de aprobarlos.", "Runly Developer no firma módulos, no aprueba reviews, no modera y no publica oficialmente por sí mismo. Preparar una versión o una solicitud de release o review no constituye aprobación, firma ni publicación oficial."],
    },
    {
      heading: "Disponibilidad y servicios de terceros",
      paragraphs: ["El servicio puede experimentar interrupciones, mantenimiento o errores. No se promete disponibilidad ininterrumpida ni un plazo de recuperación en estos términos. Los compromisos específicos de disponibilidad, si existen, se acuerdan por separado.", "Los clientes y servicios de terceros que utilices para conectarte tienen sus propias condiciones. Su disponibilidad o cambios pueden afectar la integración."],
    },
    {
      heading: "Responsabilidad",
      paragraphs: ["Cada parte responde por sus obligaciones conforme a las condiciones aplicables y a la ley. Debes revisar las operaciones y resultados antes de usarlos, especialmente cuando afecten datos, permisos o entornos de producción.", "En la medida permitida por la ley aplicable, Runly no asume responsabilidad por daños indirectos derivados del uso del servicio. Esta disposición no excluye responsabilidades que no puedan limitarse legalmente ni derechos irrenunciables. Cualquier condición específica acordada por separado debe interpretarse dentro de esos límites."],
    },
    {
      heading: "Suspensión, terminación y revocación",
      paragraphs: ["Puedes dejar de utilizar Runly Developer y desconectar o revocar la autorización OAuth. La cancelación de otros servicios contratados se gestiona conforme a las condiciones acordadas.", "El acceso puede suspenderse o terminarse por uso no autorizado, incumplimiento de estas condiciones o riesgos para la seguridad. Cuando las circunstancias lo permitan, se comunicará el motivo para facilitar su atención.", "La revocación de acceso no elimina automáticamente los datos existentes. Para solicitar su eliminación o conocer la retención aplicable, consulta la política de privacidad y escribe a hola@runly.mx."],
    },
    {
      heading: "Cambios y contacto",
      paragraphs: ["Los cambios a estos términos se publicarán en esta página con su fecha de actualización. Revisa las condiciones antes de continuar utilizando las funciones afectadas.", "Para dudas sobre los términos, tu cuenta o el uso de Runly y Runly Developer, escribe a hola@runly.mx."],
    },
  ],
};
