// src/i18n/es.ts
import type { SiteDictionary } from "./types";

export const es: SiteDictionary = {
  meta: {
    title: "RUNLY ERP - Business in motion | Software modular y multiempresa",
    description:
      "RUNLY es el ERP modular, multiempresa y colaborativo de Racoon Devs. Elige los módulos que necesitas, conecta a tu equipo y haz crecer tu negocio.",
  },
  nav: {
    platform: "Plataforma",
    product: "Producto",
    modules: "Módulos",
    rm3: "Arquitectura RM3",
    mirai: "MirAI",
    marketplace: "Marketplace",
    docs: "Documentación",
    docsHome: "Inicio de la documentación",
    docsGuides: "Guías paso a paso",
    docsModules: "Módulos",
    docsDevelopers: "Desarrolladores",
    docsApi: "API de los módulos",
    descriptions: {
      modules: "Elige solo los módulos que tu negocio necesita.",
      rm3: "Cómo se construye y escala la plataforma.",
      mirai: "Inteligencia artificial integrada en tu operación.",
      marketplace: "Plantillas y automatizaciones listas para usar en Runly.",
      docsHome: "Todo lo que necesitas para empezar a usar RUNLY.",
      docsGuides: "Tutoriales para tareas del día a día.",
      docsModules: "Referencia funcional de cada módulo.",
      docsDevelopers: "Flujos, integración y buenas prácticas.",
      docsApi: "Endpoints y contratos de los módulos.",
    },
    implementation: "Implementación",
    contact: "Contacto",
    requestDemo: "Solicitar una demostración",
    back: "Volver",
  },
  footer: {
    tagline:
      "RUNLY - Business in motion. El sistema operativo modular, multiempresa y colaborativo para empresas que avanzan rápido.",
    platformHeading: "Plataforma",
    ecosystemHeading: "Ecosistema",
    legalHeading: "Legal y Empresa",
    uptime: "Implementación y soporte según tu proyecto",
    copyright: "RUNLY ERP - runly.mx. Todos los derechos reservados.",
    builtBy: "Desarrollado con pasión por",
    links: {
      modulesCatalog: "Catálogo de Módulos",
      rm3Architecture: "Arquitectura RM3",
      mirai: "MirAI (Inteligencia Artificial)",
      marketplace: "Marketplace de recursos",
      customImplementation: "Implementación a Medida",
      officialModules: "Módulos Oficiales",
      customDevelopment: "Desarrollo con código",
      docsHome: "Documentación",
      guides: "Guías paso a paso",
      apiDocs: "Documentación de API",
      privacyNotice: "Aviso de Privacidad",
      termsOfService: "Términos de Servicio",
      dataSecurity: "Seguridad de Datos",
      supportContact: "Contacto de Soporte",
    },
  },
  hero: {
    imageAlt: "Interfaz principal de RUNLY ERP",
    badge: "Tu empresa. Tu manera de trabajar.",
    titleLine1: "Tu empresa en movimiento.",
    titleLine2: "Todo conectado con RUNLY.",
    subtitle:
      "Gestiona tus operaciones desde una sola plataforma. Elige los módulos que necesitas, conecta a tu equipo y haz crecer tu negocio con un ERP que se adapta a ti.",
    ctaPrimary: "Descubre RUNLY",
    ctaSecondary: "Solicitar una demostración",
    badgeModular: "Modular",
    badgeMultiCompany: "Multiempresa",
    badgeCustomizable: "Personalizable",
    windowUrl: "app.runly.mx/dashboard",
    floatingMultiBranchTitle: "Multisucursal conectada",
    floatingMultiBranchSubtitle: "2 empresas sincronizadas",
    floatingMiraiTitle: "MirAI asistente listo",
    floatingMiraiSubtitle: "100% contextual activo",
    tourTabs: [
      { label: "Inicio", alt: "Pantalla de inicio de RUNLY ERP con los módulos instalados" },
      { label: "Calendario", alt: "Calendario de RUNLY ERP en vista de mes" },
      { label: "Empresa", alt: "Resumen del perfil de empresa en RUNLY ERP" },
    ],
  },
  about: {
    eyebrow: "Acerca de RUNLY",
    title: "¿Qué es RUNLY?",
    paragraphs: [
      "RUNLY es una plataforma de gestión empresarial (ERP) modular, desarrollada por Racoon Devs, que permite a las empresas administrar sus operaciones, proyectos, finanzas, inventarios, empleados y comunicación interna desde un mismo lugar.",
      "La plataforma integra herramientas de colaboración, mensajería, reuniones y gestión de calendarios para organizar el trabajo entre los miembros de una empresa.",
    ],
  },
  flexibility: {
    eyebrow: "Flexibilidad sin ataduras",
    title: "No cambies tu forma de trabajar para adaptarte a un software.",
    description:
      "RUNLY se adapta a tus procesos, tu equipo y tus necesidades. Comienza con las herramientas que necesitas y amplía tu plataforma conforme evoluciona tu empresa.",
    cards: [
      {
        icon: "PuzzlePiece",
        color: "orange",
        title: "Modular por naturaleza",
        description:
          "Instala y utiliza solo lo que necesitas. Activa o desactiva módulos con un clic sin alterar la estabilidad del sistema.",
      },
      {
        icon: "Zap",
        color: "blue",
        title: "Todo conectado",
        description:
          "Información sincronizada en tiempo real. Un contacto creado en el chat se refleja inmediatamente en cotizaciones y proyectos.",
      },
      {
        icon: "Building2",
        color: "purple",
        title: "Un espacio para cada empresa",
        description:
          "Multiempresa con aislamiento estricto y roles definidos. Alterna entre razones sociales sin cerrar sesión.",
      },
      {
        icon: "TrendingUp",
        color: "emerald",
        title: "Crece a tu ritmo",
        description:
          "Escalabilidad sin fricciones. Pasa de 3 a 300 colaboradores sin costos desproporcionados ni migraciones dolorosas.",
      },
    ],
  },
  modulesCatalog: {
    eyebrow: "Catálogo RUNLY Core",
    title: "Un ecosistema completo para hacer funcionar tu empresa.",
    description:
      "Desde la colaboración de tu equipo hasta la organización de tus recursos y operaciones, RUNLY reúne diferentes herramientas en un mismo lugar.",
    viewAllCta: "Ver los 27 módulos",
    roadmapTitle: "Y esto es solo el comienzo. RUNLY evoluciona constantemente.",
    roadmapDescription:
      "Nuestro equipo en Racoon Devs despliega nuevos módulos y mejoras mensualmente. Todos los clientes con soporte activo reciben acceso inmediato a las actualizaciones.",
    comingSoonLabel: "Próximamente",
  },
  modulesPage: {
    metaTitle: "Catálogo de módulos — RUNLY ERP",
    metaDescription: "Explora los 27 módulos de RUNLY ERP: identidad, contactos, finanzas, inventario, punto de venta y más.",
    eyebrow: "Catálogo completo",
    title: "Todos los módulos de RUNLY, en un solo lugar.",
    description:
      "Filtra por categoría y da clic (o pasa el cursor) sobre cada tarjeta para conocer qué resuelve cada módulo.",
    backToHome: "Volver al inicio",
  },
  architecturePage: {
    metaTitle: "Arquitectura RM3 — RUNLY ERP",
    metaDescription: "Como funciona el motor modular RM3 de RUNLY: core, modulos oficiales, desarrollo a medida y modulos de la comunidad.",
    backToHome: "Volver al inicio",
  },
  miraiPage: {
    metaTitle: "MirAI — Asistente de IA de RUNLY ERP",
    metaDescription: "MirAI, el asistente de inteligencia artificial integrado en RUNLY ERP: que puede hacer y como te ayuda en el dia a dia.",
    backToHome: "Volver al inicio",
  },
  rm3: {
    badge: "Arquitectura de vanguardia",
    title: "Una plataforma. Infinitas posibilidades de adaptación.",
    description:
      "RUNLY está construido sobre el motor modular RM3, diseñado para desacoplar procesos, permitir microservicios estables y garantizar actualizaciones sin interrupciones operativas.",
    coreTitle: "RUNLY CORE",
    coreSubtitle: "Motor Modular RM3",
    coreDescription: "Orquestador de eventos, autenticación federada, control de acceso RBAC y sincronización global.",
    leftNodes: [
      { icon: "Boxes", label: "Inventario Core", tag: "Micro-app" },
      { icon: "MessageCircle", label: "Chat en Tiempo Real", tag: "Websockets" },
      { icon: "BuildingComplex", label: "Multi-Tenant Hub", tag: "Aislamiento" },
    ],
    rightNodes: [
      { icon: "Sparkles", label: "Motor MirAI", tag: "LLM Context" },
      { icon: "GitBranch", label: "Módulos Custom", tag: "A la medida" },
      { icon: "CloudUpload", label: "APIs Externas", tag: "Bancos / SAT" },
    ],
    pillars: [
      {
        icon: "Boxes",
        title: "Módulos independientes integrables",
        description:
          "Cada módulo funciona como un componente desacoplado. Puedes actualizar o migrar un área específica sin riesgo de caídas generales.",
      },
      {
        icon: "Split",
        title: "Ampliación dinámica",
        description:
          "Incorpora campos personalizados, reportes específicos y nuevos flujos sin romper la compatibilidad con futuras versiones de RUNLY.",
      },
      {
        icon: "ShieldCheck",
        title: "Flexibilidad operativa segura",
        description:
          "Garantía de rendimiento óptimo con control minucioso sobre permisos, trazabilidad de accesos y auditoría de cambios.",
      },
    ],
  },
  classification: {
    eyebrow: "Ecosistema de soluciones",
    title: "Tu negocio es único. Tu software también puede serlo.",
    description:
      "Amplía RUNLY con herramientas desarrolladas para diferentes necesidades y construye una plataforma que realmente se ajuste a tu operación.",
    official: {
      badge: "Certificados Racoon",
      title: "Módulos Oficiales",
      description:
        "Desarrollados, mantenidos y soportados directamente por el equipo de ingeniería de Racoon Devs. Máxima estabilidad, actualizaciones automáticas y compatibilidad garantizada.",
      bullets: [
        "Actualizaciones sin costo adicional",
        "Soporte prioritario en español",
        "Integración nativa inmediata",
      ],
    },
    custom: {
      tag: "Hecho a la medida",
      badge: "Flujos específicos",
      title: "Módulos Personalizados",
      description:
        "¿Tu industria tiene una regla de negocio o cálculo único? Diseñamos y programamos módulos custom que se integran con fluidez exacta a tu pantalla de RUNLY.",
      bullets: [
        "Levantamiento técnico de procesos",
        "Adaptación a tu software heredado",
        "Exclusivo para tu organización",
      ],
    },
    community: {
      badge: "Ecosistema en construcción",
      title: "Módulos Community",
      description:
        "Estamos sentando las bases para que desarrolladores y partners certificados puedan aportar extensiones y conectores en el futuro, bajo revisión de seguridad de nuestro equipo.",
      bullets: [
        "Estándares abiertos y SDK en desarrollo",
        "Revisión de seguridad y código",
        "Aún no disponible públicamente",
      ],
    },
    bannerTitle: "¿Tienes una idea para un módulo que todavía no existe?",
    bannerDescription: "Construimos la herramienta exacta para resolver la fricción de tu operación diaria.",
    bannerCta: "Hablemos de tu proyecto",
  },
  mirai: {
    badge: "Inteligencia Artificial Práctica",
    title: "Conoce a MirAI.",
    titleHighlight: "Inteligencia que acompaña tu trabajo.",
    description:
      "RUNLY incorpora herramientas impulsadas por inteligencia artificial para facilitar tareas repetitivas, interpretar información desestructurada y ayudarte a tomar mejores decisiones en segundos. MirAI es un solo asistente que te acompaña en todo Runly: tiene su conversación en Chat y una pestaña lateral en cada pantalla que entiende el registro que estás viendo (un artículo, un colaborador, un proyecto) y puede proponer acciones que tú confirmas.",
    capabilities: [
      {
        icon: "MessageCircle",
        color: "purple",
        title: "Asistente conversacional integrado",
        description: "Pregunta sobre el inventario, solicita resúmenes de reuniones o consulta el estatus de proyectos usando lenguaje natural en español.",
      },
      {
        icon: "FileText",
        color: "orange",
        title: "Interpretación de tickets y facturas",
        description: "Sube fotos de tickets o comprobantes desde tu teléfono; MirAI extrae monto, fecha, RFC y categoría contable de forma automática.",
      },
      {
        icon: "Brain",
        color: "blue",
        title: "Apoyo contextual por módulo",
        description: "Si estás en Proyectos, MirAI te ayuda a redactar criterios de aceptación. Si estás en CRM, sugiere follow-ups comerciales.",
      },
      {
        icon: "ShieldCheck",
        color: "emerald",
        title: "Privacidad y base extensible",
        description: "Tus datos empresariales permanecen estrictamente confidenciales y aislados dentro de tu entorno privado.",
      },
    ],
    demoLabel: "MirAI Asistente",
    demoContext: "Ejemplo ilustrativo - no es una conversación en vivo",
    demoDisclaimer: "Vista de ejemplo de cómo responde MirAI dentro de Runly ERP",
    demoScenarios: [
      {
        userMessage: "¿MirAI, cuál es el saldo proyectado para nómina a fin de mes entre las dos empresas?",
        assistantIntro: "Analizando los libros de cuentas de Racoon Devs y Grupo Aurora:",
        lines: ["Racoon Devs (8 colaboradores): $148,500 MXN", "Grupo Aurora (12 colab.): $210,000 MXN"],
        highlightLine: "Compromiso total estimado: $358,500 MXN",
        confirmation: "Tienes liquidez suficiente registrada con los cobros de clientes programados para el 25 de septiembre.",
      },
      {
        userMessage: "MirAI, dame un resumen de tareas pendientes de la semana",
        assistantIntro: "Revisando tus proyectos activos:",
        lines: ["Runly Development: 3 tareas en 'En revisión'", "Sitio web Q4: 1 tarea vencida (ayer)"],
        highlightLine: "5 tareas requieren tu atención esta semana",
        confirmation: "La tarea vencida es 'Ajustar SEO del blog' — ¿quieres que te lleve directo a ella?",
      },
      {
        userMessage: "MirAI, lee el ticket de combustible que adjunté",
        assistantIntro: "Analizando la foto del recibo:",
        lines: ["Comercio: Gasolinera Insurgentes", "Monto: $850.00 MXN — 09/sep/2026"],
        highlightLine: "Categoría sugerida: Transporte",
        confirmation: "Gasto registrado en tu cartera 'Efectivo' — puedes revisarlo en Finanzas personales.",
      },
    ],
    demoPromptsLabel: "Prueba preguntar:",
    demoPrompt1: "Resumen de tareas pendientes de la semana",
    demoPrompt2: "Leer ticket de combustible adjunto",
    teaserCta: "Conoce a MirAI a fondo",
    previewAlt: "MirAI respondiendo dentro de una conversación de Chat en RUNLY",
  },
  multiCompany: {
    eyebrow: "Multitenancy Nativo",
    title: "Un solo lugar para conectar a todo tu equipo.",
    description:
      "Trabaja con tus colaboradores desde una plataforma que reúne información, comunicación y herramientas para las diferentes áreas de tu organización.",
    mockActiveCompany: "Racoon Devs",
    mockActiveInstance: "Instancia Activa",
    mockAdminUser: "Raúl (Admin)",
    mockSwitcherLabel: "Cambiar de razón social / sucursal",
    mockCompanyA: "Racoon Devs S.A.S.",
    mockCompanyB: "Grupo Aurora",
    mockChangeLabel: "Cambiar",
    mockAddCompany: "Crear o vincular nueva empresa",
    mockRoleFinance: "Finanzas",
    mockRoleFinanceAccess: "Acceso Restringido",
    mockRoleWarehouse: "Almacén",
    mockRoleWarehouseAccess: "Lectura/Escritura",
    mockRoleDirection: "Dirección",
    mockRoleDirectionAccess: "Auditoría Global",
    pillars: [
      {
        icon: "Users",
        color: "orange",
        title: "Equipos verdaderamente conectados",
        description: "Evita la dispersión en 5 aplicaciones no conectadas. En RUNLY los chats de proyectos, archivos adjuntos y estados de pago conviven bajo el mismo techo.",
      },
      {
        icon: "Flag",
        color: "blue",
        title: "Diferentes empresas en una plataforma",
        description: "¿Manejas un grupo empresarial o diversas marcas? Administra cada empresa con catálogo, cuentas bancarias e inventarios completamente independientes.",
      },
      {
        icon: "UserCog",
        color: "emerald",
        title: "Accesos y permisos organizados",
        description: "Control granular por rol. Tus vendedores solo acceden a cotizaciones y catálogo, mientras los contadores gestionan libros y facturas con total seguridad.",
      },
    ],
  },
  implementation: {
    badge: "Transparencia y honestidad comercial",
    title: "No vendemos paquetes. Construimos la solución que necesitas.",
    description:
      "Cada empresa tiene necesidades diferentes. Por eso, en RUNLY ofrecemos implementaciones personalizadas que se ajustan a tu operación, tus objetivos y tu presupuesto.",
    steps: [
      { number: "01", title: "Cuéntanos sobre tu empresa", description: "Analizamos tus procesos actuales, dolores operativos y las herramientas que tu equipo ya utiliza en el día a día." },
      { number: "02", title: "Diseñamos tu solución", description: "Seleccionamos los módulos precisos y definimos las adaptaciones a la medida requeridas, sin módulos innecesarios." },
      { number: "03", title: "Implementamos RUNLY", description: "Configuramos tu instancia cloud, migramos catálogos base y capacitamos a tus líderes de área de forma práctica." },
      { number: "04", title: "Evolucionamos contigo", description: "Acompañamiento continuo, soporte directo con desarrolladores e incorporación ágil de nuevos módulos cuando tu negocio crezca." },
    ],
    valueTitle: "Software empresarial accesible, sin pagar por lo que no necesitas.",
    valueDescription:
      "Buscamos que la tecnología empresarial de alto nivel esté al alcance de más negocios en México y Latinoamérica. Olvídate de licencias prohibitivas de miles de dólares por usuario de los ERPs tradicionales.",
    valueCta: "Solicitar una propuesta personalizada",
  },
  whyChoose: {
    eyebrow: "Diferenciadores Clave",
    title: "Tecnología empresarial que trabaja a tu favor.",
    description: "Diseñado desde cero para erradicar la complejidad innecesaria y dar agilidad real a equipos en constante crecimiento.",
    cards: [
      { icon: "Boxes", color: "orange", title: "Modular y adaptable", description: "Paga e instala solo los módulos que tu operación necesita hoy." },
      { icon: "HandCoins", color: "emerald", title: "Sin costos inflados", description: "Cero sobrecostos por funciones que tu equipo nunca va a abrir." },
      { icon: "BuildingComplex", color: "blue", title: "Multiempresa nativo", description: "Administra diferentes empresas o sucursales con aislamiento estricto." },
      { icon: "Headset", color: "purple", title: "Soporte directo por devs", description: "Atención en español de México directa de los creadores en Racoon Devs." },
      { icon: "Sparkles", color: "pink", title: "IA práctica no decorativa", description: "MirAI automatiza lectura de comprobantes y consultas de stock reales." },
      { icon: "CloudUpload", color: "amber", title: "Innovación continua", description: "Nuevas funciones y optimizaciones mensuales sin costes ocultos." },
      { icon: "Smartphone", color: "cyan", title: "100% Cloud y Responsive", description: "Accede desde tu computadora, tablet o smartphone con alta fluidez." },
      { icon: "ShieldCheck", color: "indigo", title: "Seguridad y Respaldo", description: "Backups automáticos diarios y cifrado de datos en reposo y tránsito." },
    ],
  },
  faq: {
    eyebrow: "Dudas habituales",
    title: "Preguntas Frecuentes",
    description: "Todo lo que necesitas saber antes de implementar RUNLY en tu empresa.",
    items: [
      {
        question: "¿RUNLY funciona para empresas pequeñas o solo para grandes organizaciones?",
        answer: "RUNLY está diseñado con una arquitectura modular precisamente para adaptarse a cualquier tamaño. Una empresa de 3 personas puede comenzar únicamente con Chat, Calendario y Finanzas, mientras que una compañía consolidada puede operar inventarios complejos multialmacén y múltiples razones sociales.",
      },
      {
        question: "¿Tengo que contratar todos los módulos obligatoriamente?",
        answer: "No. En RUNLY no creemos en los paquetes forzosos. Tú eliges exactamente qué módulos habilitar en tu instancia. Si en el futuro necesitas un módulo adicional, lo activas con un clic sin necesidad de reinstalar ni migrar el sistema.",
      },
      {
        question: "¿Puedo solicitar módulos o funcionalidades personalizadas para mi empresa?",
        answer: "Sí, es una de nuestras principales fortalezas comerciales. Nuestro equipo en Racoon Devs puede desarrollar módulos personalizados exclusivos basados en la arquitectura RM3 que se adaptan exactamente a los cálculos, aprobaciones o regulaciones de tu negocio.",
      },
      {
        question: "¿Cómo funciona la gestión multiempresa?",
        answer: "Puedes dar de alta múltiples entidades o marcas bajo un mismo acceso maestro. Cada empresa tiene bases de datos lógicamente aisladas (inventario, empleados, cuentas bancarias), permitiendo que los administradores alternen entre una y otra con un solo clic.",
      },
      {
        question: "¿Mis datos están protegidos y respaldados?",
        answer: "La configuración de seguridad, los respaldos y los procedimientos de recuperación se definen y verifican para tu implementación. Revisamos estos requisitos con tu equipo antes de la puesta en marcha.",
      },
      {
        question: "¿Cómo se calcula el costo de RUNLY si no hay precios fijos publicados?",
        answer: "Cotizamos de forma justa basándonos en: los módulos exactos requeridos, el número de usuarios activos concurrentes y si requieres desarrollo personalizado. Esto evita que pagues por características infladas que no aportan valor a tu giro.",
      },
      {
        question: "¿Cuánto tiempo toma la implementación y puesta en marcha?",
        answer: "El plazo se acuerda después de revisar los módulos, las adaptaciones, la migración de datos y la capacitación que requiere tu proyecto. Definimos las etapas de entrega con tu equipo antes de implementar.",
      },
    ],
  },
  contact: {
    eyebrow: "Comienza hoy",
    title: "Hagamos que tu empresa avance.",
    description: "Cuéntanos qué necesita tu negocio y descubre cómo podemos adaptar RUNLY a tu manera de trabajar. Sin compromisos forzosos.",
    whatsappTitle: "¿Prefieres hablar de inmediato?",
    whatsappDescription: "Atención ágil con uno de nuestros consultores.",
    whatsappCta: "Contáctanos por WhatsApp",
    whatsappMessage: "Hola, me gustaría solicitar una demostración de RUNLY ERP",
    emailLabel: "hola@runly.mx",
    locationLabel: "México. Cobertura y despliegue para toda Latinoamérica",
    ndaLabel: "Acuerdo de Confidencialidad (NDA) disponible para empresas",
    formTitle: "Solicitud de propuesta o demostración",
    fields: {
      fullName: "Nombre completo *",
      fullNamePlaceholder: "Ej. Raúl Gómez",
      company: "Nombre de la empresa *",
      companyPlaceholder: "Ej. Grupo Aurora",
      email: "Correo empresarial *",
      emailPlaceholder: "raul@miempresa.com",
      phone: "Teléfono o WhatsApp *",
      phonePlaceholder: "+52 55 1234 5678",
      teamSize: "Tamaño aproximado del equipo",
      teamSizeOptions: [
        { value: "1_5", label: "1 a 5 personas" },
        { value: "6_20", label: "6 a 20 personas" },
        { value: "21_50", label: "21 a 50 personas" },
        { value: "50_plus", label: "Más de 50 personas" },
      ],
      interest: "Principal interés *",
      interestOptions: [
        { value: "virtual_demo", label: "Solicitar demostración virtual" },
        { value: "modules_scope", label: "Conocer módulos y alcances" },
        { value: "enterprise_impl", label: "Implementación empresarial" },
        { value: "custom_module", label: "Desarrollo de módulo personalizado" },
        { value: "tech_questions", label: "Resolver dudas técnicas" },
      ],
      needs: "¿Qué procesos necesitas gestionar con RUNLY? *",
      needsPlaceholder: "Ej. Inventario multialmacén, control de gastos entre dos empresas y chat de soporte integrado...",
      consent: "Acepto el Aviso de Privacidad y el tratamiento de mis datos para ser contactado por Racoon Devs.",
    },
    submit: "Enviar solicitud",
    submitting: "Procesando solicitud...",
    successMessage: "¡Gracias por tu interés! Un consultor de Racoon Devs se pondrá en contacto contigo en breve.",
    errorMessage: "No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.",
    privacyNotice: "Al enviar este formulario aceptas nuestro Aviso de Privacidad. Tu información nunca será compartida.",
  },
  legal: {
    privacy: {
      metaTitle: "Aviso de Privacidad | RUNLY",
      metaDescription:
        "Aviso de privacidad de RUNLY conforme a la LFPDPPP: qué datos recabamos, para qué los usamos y cómo ejercer tus derechos ARCO.",
      eyebrow: "Legal",
      title: "Aviso de Privacidad",
      lastUpdated: "Última actualización: 21 de septiembre de 2026",
      intro:
        "Este Aviso de Privacidad describe cómo Racoon Devs recaba, usa y protege los datos personales de quienes visitan este sitio, solicitan información sobre RUNLY o utilizan la plataforma, de conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México.",
      sections: [
        {
          heading: "Identidad y domicilio del responsable",
          paragraphs: [
            "El responsable del tratamiento de tus datos personales es [RAZÓN SOCIAL LEGAL DE RACOON DEVS], con domicilio en [DOMICILIO FISCAL COMPLETO], México, y RFC [RFC].",
          ],
        },
        {
          heading: "Datos personales que recabamos",
          paragraphs: [
            "Recabamos datos personales que nos proporcionas directamente al solicitar una demostración, contactarnos o usar RUNLY, así como datos técnicos generados por el uso de la plataforma.",
          ],
          list: [
            "Datos de identificación y contacto: nombre, correo electrónico, teléfono, empresa y puesto.",
            "Datos de la solicitud: tamaño de equipo, interés principal y necesidades descritas en el formulario de contacto.",
            "Datos de la cuenta: credenciales de acceso y configuración de la instancia de RUNLY contratada.",
            "Datos de uso: registros de actividad dentro de los módulos que utilizas.",
            "Datos técnicos: dirección IP, tipo de dispositivo y navegador, recabados de forma automática.",
            "Comunicaciones: el contenido de los mensajes que nos envías por correo, WhatsApp o el chat de soporte.",
          ],
        },
        {
          heading: "Finalidades del tratamiento",
          paragraphs: [
            "Finalidades primarias, necesarias para la relación contigo: responder tu solicitud de información o demostración, proveer y dar soporte a la plataforma RUNLY, gestionar tu cuenta y cumplir obligaciones legales y contractuales.",
            "Finalidades secundarias, no indispensables: enviarte comunicaciones comerciales sobre nuevos módulos o funcionalidades. Puedes negar el tratamiento para estas finalidades secundarias en cualquier momento escribiendo a privacy@runly.mx, sin que esto afecte los servicios que ya contrataste.",
          ],
        },
        {
          heading: "Transferencia de datos",
          paragraphs: [
            "Tus datos personales pueden compartirse únicamente con los siguientes terceros, y solo en la medida necesaria para operar el servicio:",
          ],
          list: [
            "Proveedores de infraestructura y hosting que alojan la plataforma RUNLY.",
            "Proveedores de procesamiento de pagos, cuando aplique, para la facturación del servicio.",
            "Autoridades competentes, cuando exista un requerimiento legal válido.",
          ],
        },
        {
          heading: "Derechos ARCO y cómo ejercerlos",
          paragraphs: [
            "Tienes derecho a Acceder, Rectificar y Cancelar tus datos personales, así como a Oponerte a su tratamiento (derechos ARCO), y a revocar el consentimiento que en su caso nos hayas otorgado. Para ejercer cualquiera de estos derechos, escríbenos a privacy@runly.mx indicando tu nombre completo y el derecho que deseas ejercer; te responderemos en un plazo máximo de 20 días hábiles.",
          ],
        },
        {
          heading: "Uso de cookies y tecnologías de rastreo",
          paragraphs: [
            "Este sitio utiliza cookies y tecnologías similares únicamente con fines analíticos y de funcionamiento básico. No utilizamos estas tecnologías para publicidad dirigida ni para compartir datos con redes publicitarias.",
          ],
        },
        {
          heading: "Conservación de datos",
          paragraphs: [
            "Conservamos tus datos personales durante el tiempo necesario para cumplir las finalidades descritas en este aviso y las obligaciones legales aplicables; una vez cumplido ese plazo, los eliminamos o anonimizamos de forma segura.",
          ],
        },
        {
          heading: "Cambios a este aviso de privacidad",
          paragraphs: [
            "Podemos actualizar este aviso de privacidad para reflejar cambios en nuestras prácticas o en la normativa aplicable. Publicaremos cualquier cambio en esta misma página junto con su fecha de actualización.",
          ],
        },
        {
          heading: "Contacto",
          paragraphs: ["Si tienes dudas sobre este aviso de privacidad o sobre el tratamiento de tus datos, contáctanos en privacy@runly.mx."],
        },
      ],
    },
    terms: {
      metaTitle: "Términos de Servicio | RUNLY",
      metaDescription: "Términos de Servicio que rigen el uso de la plataforma ERP RUNLY, operada por Racoon Devs.",
      eyebrow: "Legal",
      title: "Términos de Servicio",
      lastUpdated: "Última actualización: 21 de septiembre de 2026",
      intro:
        "Estos Términos de Servicio rigen el acceso y uso de RUNLY, la plataforma ERP modular operada por Racoon Devs. Al usar RUNLY o solicitar una demostración, aceptas estos términos.",
      sections: [
        {
          heading: "Aceptación de los términos",
          paragraphs: [
            "Al crear una cuenta, solicitar una demostración o utilizar RUNLY de cualquier forma, aceptas quedar obligado por estos Términos de Servicio y por nuestro Aviso de Privacidad. Si no estás de acuerdo, no debes utilizar la plataforma.",
          ],
        },
        {
          heading: "Descripción del servicio",
          paragraphs: [
            "RUNLY es una plataforma ERP modular, multiempresa y colaborativa que se contrata como software como servicio (SaaS), compuesta por módulos oficiales y, en su caso, desarrollos personalizados para tu empresa.",
          ],
        },
        {
          heading: "Cuentas y suscripciones",
          paragraphs: ["El acceso a RUNLY se otorga mediante cuentas de usuario asociadas a la empresa que contrata el servicio."],
          list: [
            "Eres responsable de mantener la confidencialidad de tus credenciales de acceso.",
            "Debes proporcionar información veraz y actualizada al crear tu cuenta.",
            "La empresa contratante es responsable de administrar los permisos y accesos de sus usuarios.",
            "Las condiciones comerciales específicas (módulos contratados, alcance, tarifas) se acuerdan por separado en la propuesta o contrato firmado con cada cliente.",
          ],
        },
        {
          heading: "Uso aceptable",
          paragraphs: ["Al usar RUNLY, te comprometes a no:"],
          list: [
            "Utilizar la plataforma para fines ilícitos o que violen derechos de terceros.",
            "Intentar vulnerar la seguridad de la plataforma o acceder a datos de otras empresas sin autorización.",
            "Realizar ingeniería inversa del software, salvo en los casos permitidos por la ley.",
            "Sobrecargar deliberadamente la infraestructura del servicio.",
            "Revender o sublicenciar el acceso a RUNLY sin autorización previa por escrito.",
          ],
        },
        {
          heading: "Propiedad intelectual",
          paragraphs: [
            "RUNLY, su código, diseño, marca y documentación son propiedad de Racoon Devs o de sus licenciantes. Estos términos no te otorgan ningún derecho de propiedad sobre la plataforma; únicamente un derecho de uso conforme al contrato vigente. Los datos que ingresas a la plataforma siguen siendo de tu propiedad.",
          ],
        },
        {
          heading: "Tarifas y facturación",
          paragraphs: [
            "Las tarifas aplicables a cada cliente se establecen en la propuesta comercial o contrato correspondiente y pueden variar según los módulos contratados y el volumen de uso. El incumplimiento de pago puede resultar en la suspensión del acceso al servicio, previa notificación.",
          ],
        },
        {
          heading: "Disponibilidad del servicio",
          paragraphs: [
            "Trabajamos para mantener RUNLY disponible de forma continua, pero no garantizamos un funcionamiento ininterrumpido o libre de errores. Podemos realizar mantenimientos programados, notificándolo con anticipación razonable cuando sea posible.",
          ],
        },
        {
          heading: "Limitación de responsabilidad",
          paragraphs: [
            "En la máxima medida permitida por la ley, Racoon Devs no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de RUNLY. Nuestra responsabilidad total frente a ti se limita al monto efectivamente pagado por el servicio en los últimos 12 meses.",
          ],
        },
        {
          heading: "Terminación",
          paragraphs: [
            "Puedes dejar de usar RUNLY en cualquier momento conforme a los términos de cancelación de tu contrato. Podemos suspender o terminar tu acceso si incumples estos términos, previa notificación cuando las circunstancias lo permitan.",
          ],
        },
        {
          heading: "Modificaciones a estos términos",
          paragraphs: [
            "Podemos actualizar estos Términos de Servicio periódicamente. Publicaremos cualquier cambio relevante en esta página junto con su fecha de actualización; el uso continuado de RUNLY después de un cambio implica su aceptación.",
          ],
        },
        {
          heading: "Ley aplicable y jurisdicción",
          paragraphs: [
            "Estos términos se rigen por las leyes de México. Para cualquier controversia relacionada con estos términos, las partes se someten a los tribunales competentes de México, salvo que el contrato firmado con tu empresa establezca algo distinto.",
          ],
        },
        {
          heading: "Contacto",
          paragraphs: ["Si tienes preguntas sobre estos Términos de Servicio, escríbenos a hola@runly.mx."],
        },
      ],
    },
    security: {
      metaTitle: "Seguridad de Datos | RUNLY",
      metaDescription: "Conoce las medidas técnicas y organizativas con las que RUNLY protege la información de tu empresa.",
      eyebrow: "Legal",
      title: "Seguridad de Datos",
      lastUpdated: "Última actualización: 21 de septiembre de 2026",
      intro:
        "En Racoon Devs protegemos la información que gestionas en RUNLY con medidas técnicas y organizativas diseñadas para mantener su confidencialidad, integridad y disponibilidad.",
      sections: [
        {
          heading: "Nuestro compromiso con la seguridad",
          paragraphs: [
            "La seguridad de tus datos es una prioridad en el diseño y operación de RUNLY, no un añadido posterior. Aplicamos buenas prácticas de la industria en cada capa de la plataforma.",
          ],
        },
        {
          heading: "Cifrado y protección de datos",
          paragraphs: ["Protegemos la información tanto en tránsito como en reposo mediante cifrado."],
          list: [
            "Toda la comunicación entre tu navegador y RUNLY viaja cifrada mediante HTTPS/TLS.",
            "Los datos almacenados en nuestra infraestructura se resguardan con cifrado en reposo.",
            "Las credenciales de acceso se almacenan utilizando algoritmos de hash seguros, nunca en texto plano.",
          ],
        },
        {
          heading: "Infraestructura y alojamiento",
          paragraphs: [
            "RUNLY se aloja en infraestructura de proveedores reconocidos por sus estándares de seguridad física y operativa, con controles de acceso y monitoreo continuo del entorno donde corre la plataforma.",
          ],
        },
        {
          heading: "Control de accesos",
          paragraphs: ["El acceso a los datos de tu empresa está restringido conforme al principio de menor privilegio."],
          list: [
            "Cada empresa opera en un espacio lógicamente aislado dentro de la plataforma multiempresa.",
            "Los permisos dentro de RUNLY se configuran por módulo y por rol de usuario.",
            "El acceso interno del equipo de Racoon Devs a datos de clientes está limitado y auditado.",
            "Recomendamos activar buenas prácticas de contraseñas robustas para todas las cuentas de tu equipo.",
          ],
        },
        {
          heading: "Respaldos y continuidad",
          paragraphs: [
            "Realizamos respaldos periódicos de la información para reducir el riesgo de pérdida de datos y contar con planes de recuperación ante incidentes.",
          ],
        },
        {
          heading: "Monitoreo y respuesta a incidentes",
          paragraphs: [
            "Monitoreamos la operación de la plataforma para detectar comportamientos anómalos y contamos con un proceso interno para atender y resolver incidentes de seguridad cuando se presentan.",
          ],
        },
        {
          heading: "Proveedores y subencargados",
          paragraphs: [
            "Trabajamos con un número limitado de proveedores de infraestructura y servicios para operar RUNLY, seleccionados por sus estándares de seguridad, y solo compartimos con ellos la información estrictamente necesaria.",
          ],
        },
        {
          heading: "Reporte responsable de vulnerabilidades",
          paragraphs: [
            "Si identificas una posible vulnerabilidad de seguridad en RUNLY, te pedimos reportarla de forma responsable escribiéndonos a support@runly.mx antes de divulgarla públicamente, para que podamos investigarla y corregirla.",
          ],
        },
        {
          heading: "Contacto de seguridad",
          paragraphs: ["Para dudas o reportes relacionados con la seguridad de tus datos, contáctanos en support@runly.mx."],
        },
      ],
    },
    support: {
      metaTitle: "Contacto de Soporte | RUNLY",
      metaDescription: "Canales, horarios y tiempos de respuesta del soporte técnico de RUNLY para clientes activos.",
      eyebrow: "Legal",
      title: "Contacto de Soporte",
      lastUpdated: "Última actualización: 21 de septiembre de 2026",
      intro:
        "Este canal es para clientes que ya usan RUNLY y necesitan ayuda técnica. Si aún no eres cliente y quieres una demostración o cotización, usa el formulario de ventas en la página principal.",
      sections: [
        {
          heading: "Canales de soporte",
          paragraphs: ["Puedes contactar a nuestro equipo de soporte por los siguientes medios:"],
          list: [
            "Correo: support@runly.mx — te respondemos ahí mismo dando seguimiento a tu caso.",
            "WhatsApp: +52 322 135 8808 — para dudas urgentes o seguimiento rápido.",
          ],
        },
        {
          heading: "Horario de atención",
          paragraphs: [
            "Nuestro equipo de soporte atiende de lunes a viernes, en horario laboral de México. Fuera de este horario, tu mensaje queda registrado y lo atendemos en cuanto reabrimos.",
          ],
        },
        {
          heading: "¿Qué cubre el soporte técnico?",
          paragraphs: [
            "El soporte técnico atiende dudas de uso de los módulos contratados, incidencias de la plataforma y solicitudes de configuración dentro del alcance de tu contrato. Para nuevas cotizaciones, módulos adicionales o demostraciones, usa el formulario de ventas de la página principal en vez de este canal.",
          ],
        },
        {
          heading: "Tiempos de respuesta",
          paragraphs: [
            "Buscamos dar una primera respuesta a los reportes de soporte el mismo día hábil en que se reciben. Los tiempos pueden variar según la complejidad del caso; para incidencias críticas, contáctanos por WhatsApp.",
          ],
        },
        {
          heading: "Antes de escribirnos",
          paragraphs: ["Para ayudarte más rápido, incluye en tu mensaje:"],
          list: [
            "El nombre de tu empresa y el módulo relacionado con tu duda o incidencia.",
            "Los pasos exactos que realizaste antes de que ocurriera el problema.",
            "Capturas de pantalla del error, si aplica.",
            "El usuario con el que tuviste el problema, si tu cuenta administra varios accesos.",
          ],
        },
      ],
    },
  },
};
