// src/data/modules.ts
export type ModuleStatus = "disponible" | "proximamente";
export type ModuleCategory =
  | "sistema"
  | "operaciones"
  | "finanzas"
  | "comercial"
  | "plataforma"
  | "productividad"
  | "comunicacion";

export interface RunlyModuleEntry {
  id: string;
  name: { es: string; en: string };
  description: { es: string; en: string };
  category: ModuleCategory;
  status: ModuleStatus;
  icon: string;
  color: string;
  version: string;
  order: number;
}

export const modules: RunlyModuleEntry[] = [
  {
    id: "runly.core",
    name: { es: "Runly Core", en: "Runly Core" },
    description: {
      es: "Núcleo del sistema: módulos, permisos, bitácora y configuración de instancia.",
      en: "System core: modules, permissions, audit log, and instance configuration.",
    },
    category: "sistema",
    status: "disponible",
    icon: "Layers",
    color: "#0A7BFF",
    version: "0.1.0",
    order: 1,
  },
  {
    id: "runly.identity",
    name: { es: "Identidad", en: "Identity" },
    description: {
      es: "Usuarios, roles, permisos, membresías y control de acceso.",
      en: "Users, roles, permissions, memberships, and access control.",
    },
    category: "sistema",
    status: "disponible",
    icon: "Shield",
    color: "#21C7FF",
    version: "0.1.0",
    order: 2,
  },
  {
    id: "runly.files",
    name: { es: "Archivos", en: "Files" },
    description: {
      es: "Gestión de archivos, carga, almacenamiento y acceso seguro.",
      en: "File management, uploads, storage, and secure access.",
    },
    category: "sistema",
    status: "disponible",
    icon: "FolderOpen",
    color: "#f59e0b",
    version: "0.1.0",
    order: 3,
  },
  {
    id: "runly.company",
    name: { es: "Empresa", en: "Company" },
    description: {
      es: "Perfil de empresa, dirección, marca visual e identidad corporativa.",
      en: "Company profile, address, visual brand, and corporate identity.",
    },
    category: "sistema",
    status: "disponible",
    icon: "Building2",
    color: "#ec4899",
    version: "0.1.0",
    order: 4,
  },
  {
    id: "runly.contacts",
    name: { es: "Contactos", en: "Contacts" },
    description: {
      es: "Clientes, proveedores, personas y empresas.",
      en: "Customers, suppliers, people, and companies.",
    },
    category: "operaciones",
    status: "disponible",
    icon: "ContactRound",
    color: "#0ea5e9",
    version: "0.1.0",
    order: 5,
  },
  {
    id: "runly.hr",
    name: { es: "Recursos Humanos", en: "Human Resources" },
    description: {
      es: "Colaboradores, notas internas y expedientes.",
      en: "Employees, internal notes, and personnel files.",
    },
    category: "operaciones",
    status: "disponible",
    icon: "UsersRound",
    color: "#2563eb",
    version: "0.1.0",
    order: 6,
  },
  {
    id: "runly.fleet",
    name: { es: "Flota", en: "Fleet" },
    description: {
      es: "Gestión de flota vehicular: vehículos, reportes y asignación de conductores.",
      en: "Vehicle fleet management: vehicles, reports, and driver assignment.",
    },
    category: "operaciones",
    status: "disponible",
    icon: "Gauge",
    color: "#14B8A6",
    version: "0.5.1",
    order: 7,
  },
  {
    id: "runly.inventory",
    name: { es: "Inventario", en: "Inventory" },
    description: {
      es: "Gestión de inventario y activos de la empresa.",
      en: "Inventory and company asset management.",
    },
    category: "operaciones",
    status: "disponible",
    icon: "Boxes",
    color: "#7c3aed",
    version: "1.0.0",
    order: 8,
  },
  {
    id: "runly.ledger",
    name: { es: "Libro de cuentas", en: "Ledger" },
    description: {
      es: "Registro bancario tipo hoja de cálculo: depósitos, retiros y saldo corriente.",
      en: "Spreadsheet-style bank register: deposits, withdrawals, and running balance.",
    },
    category: "finanzas",
    status: "disponible",
    icon: "Landmark",
    color: "#16a34a",
    version: "0.1.3",
    order: 9,
  },
  {
    id: "runly.pfm",
    name: { es: "Finanzas personales", en: "Personal Finance" },
    description: {
      es: "Carteras de efectivo, débito y crédito con registro rápido de ingresos y egresos.",
      en: "Cash, debit, and credit wallets with quick income and expense logging.",
    },
    category: "finanzas",
    status: "disponible",
    icon: "Wallet",
    color: "#0ea5e9",
    version: "0.5.0",
    order: 10,
  },
  {
    id: "runly.catalog",
    name: { es: "Catálogo", en: "Catalog" },
    description: {
      es: "Gestiona productos, categorías, variantes e inventario.",
      en: "Manage products, categories, variants, and inventory.",
    },
    category: "comercial",
    status: "disponible",
    icon: "ShoppingBag",
    color: "#F97316",
    version: "2.1.0",
    order: 11,
  },
  {
    id: "runly.pos",
    name: { es: "POS", en: "POS" },
    description: {
      es: "Punto de venta para restaurante, tienda y operaciones híbridas.",
      en: "Point of sale for restaurants, retail, and hybrid operations.",
    },
    category: "comercial",
    status: "disponible",
    icon: "Store",
    color: "#008C8C",
    version: "0.1.0",
    order: 12,
  },
  {
    id: "runly.growth",
    name: { es: "Growth", en: "Growth" },
    description: {
      es: "Telemetría web, formularios y seguimiento de leads.",
      en: "Web telemetry, forms, and lead tracking.",
    },
    category: "comercial",
    status: "disponible",
    icon: "TrendingUp",
    color: "#7C3AED",
    version: "0.1.0",
    order: 13,
  },
  {
    id: "runly.website",
    name: { es: "Sitio web", en: "Website" },
    description: {
      es: "Sitio web público, editor visual de páginas y publicación de contenido.",
      en: "Public website, visual page editor, and content publishing.",
    },
    category: "plataforma",
    status: "disponible",
    icon: "Globe",
    color: "#6366f1",
    version: "0.2.0",
    order: 14,
  },
  {
    id: "runly.activity",
    name: { es: "Actividad", en: "Activity" },
    description: {
      es: "Bitácora legible de eventos y feed transversal de Runly ERP.",
      en: "Human-readable event log and cross-module activity feed.",
    },
    category: "plataforma",
    status: "disponible",
    icon: "Activity",
    color: "#6366f1",
    version: "0.1.0",
    order: 15,
  },
  {
    id: "runly.notifications",
    name: { es: "Notificaciones", en: "Notifications" },
    description: {
      es: "Alertas accionables para eventos importantes del sistema.",
      en: "Actionable alerts for important system events.",
    },
    category: "plataforma",
    status: "disponible",
    icon: "Bell",
    color: "#0ea5e9",
    version: "0.1.0",
    order: 16,
  },
  {
    id: "runly.calendar",
    name: { es: "Calendario", en: "Calendar" },
    description: {
      es: "Calendario personal y compartido con eventos, recordatorios y vistas por día, semana y mes.",
      en: "Personal and shared calendar with events, reminders, and day/week/month views.",
    },
    category: "sistema",
    status: "disponible",
    icon: "Calendar",
    color: "#7C3AED",
    version: "0.1.0",
    order: 17,
  },
  {
    id: "runly.projects",
    name: { es: "Proyectos", en: "Projects" },
    description: {
      es: "Proyectos y tareas con vistas Kanban, Lista, Semana, Gantt y carga de trabajo, más registro de tiempo.",
      en: "Projects and tasks with Kanban, List, Week, Gantt and workload views, plus time tracking.",
    },
    category: "productividad",
    status: "disponible",
    icon: "SquareKanban",
    color: "#09090b",
    version: "1.0.0",
    order: 18,
  },
  {
    id: "runly.documents",
    name: { es: "Documentos", en: "Documents" },
    description: {
      es: "Plantillas versionadas y documentos PDF generados.",
      en: "Versioned templates and generated PDF documents.",
    },
    category: "productividad",
    status: "disponible",
    icon: "Files",
    color: "#0F766E",
    version: "0.1.0",
    order: 19,
  },
  {
    id: "runly.notes",
    name: { es: "Notas", en: "Notes" },
    description: {
      es: "Notas enriquecidas con editor de texto, carpetas, etiquetas y colaboración en tiempo real.",
      en: "Rich notes with a text editor, folders, tags, and real-time collaboration.",
    },
    category: "productividad",
    status: "disponible",
    icon: "NotebookPen",
    color: "#f59e0b",
    version: "0.1.0",
    order: 20,
  },
  {
    id: "runly.chat",
    name: { es: "Chat", en: "Chat" },
    description: {
      es: "Mensajería interna en tiempo real y chat de soporte para visitantes externos.",
      en: "Real-time internal messaging and support chat for external visitors.",
    },
    category: "comunicacion",
    status: "disponible",
    icon: "MessageSquare",
    color: "#8b5cf6",
    version: "0.2.0",
    order: 21,
  },
  {
    id: "runly.canvas",
    name: { es: "Canvas", en: "Canvas" },
    description: {
      es: "Pizarras técnicas colaborativas: planos con escala, PDF, mapas, DXF y DWG de AutoCAD, hotspots y figuras conectadas con datos en vivo de Runly.",
      en: "Collaborative technical boards: scaled plans, PDF, maps, AutoCAD DXF and DWG, hotspots and shapes linked to live Runly data.",
    },
    category: "productividad",
    status: "disponible",
    icon: "Map",
    color: "#2563eb",
    version: "0.1.0",
    order: 22,
  },
  {
    id: "runly.purchases",
    name: { es: "Compras", en: "Purchases" },
    description: {
      es: "Expedientes de compra con solicitudes, proveedores, órdenes y facturas, con folios por empresa.",
      en: "Purchase cases with requests, suppliers, orders and invoices, numbered per company.",
    },
    category: "operaciones",
    status: "disponible",
    icon: "ShoppingCart",
    color: "#0f766e",
    version: "1.0.0",
    order: 23,
  },
  {
    id: "runly.studio",
    name: { es: "Studio", en: "Studio" },
    description: {
      es: "Editor visual colaborativo: publicaciones, flyers, presentaciones y etiquetas con bibliotecas de fotos e iconos, exportación a PNG, JPG y PDF de imprenta, y plantillas.",
      en: "Collaborative visual editor: posts, flyers, presentations and labels with photo and icon libraries, PNG, JPG and print-ready PDF export, and templates.",
    },
    category: "productividad",
    status: "disponible",
    icon: "Palette",
    color: "#ec4899",
    version: "0.1.0",
    order: 24,
  },
  {
    id: "runly.automations",
    name: { es: "Automatizaciones", en: "Automations" },
    description: {
      es: "Flujos que se ejecutan solos: disparadores, condiciones, ciclos, correos, webhooks y acciones en otros módulos.",
      en: "Self-running flows: triggers, conditions, loops, emails, webhooks and actions across other modules.",
    },
    category: "plataforma",
    status: "disponible",
    icon: "Zap",
    color: "#f59e0b",
    version: "0.1.0",
    order: 25,
  },
  {
    id: "runly.attendance",
    name: { es: "Asistencia", en: "Attendance" },
    description: {
      es: "Checador con kioskos sin conexión, PIN, tarjeta NFC y llave de teléfono, turnos, cuotas de contratistas y reportes.",
      en: "Time clock with offline kiosks, PIN, NFC card and phone key, shifts, contractor quotas and reports.",
    },
    category: "operaciones",
    status: "disponible",
    icon: "ClockCheck",
    color: "#0891b2",
    version: "0.1.0",
    order: 26,
  },
  {
    id: "runly.lms",
    name: { es: "Capacitación", en: "Learning" },
    description: {
      es: "Cursos con video, exámenes y tareas, asignación con fecha límite, avance por lección y certificados verificables.",
      en: "Courses with video, exams and assignments, deadlines, per-lesson progress and verifiable certificates.",
    },
    category: "productividad",
    status: "disponible",
    icon: "GraduationCap",
    color: "#4f46e5",
    version: "0.1.0",
    order: 27,
  },
];

export const moduleCategories: { id: ModuleCategory | "all"; label: { es: string; en: string }; icon: string }[] = [
  { id: "all", label: { es: "Todos", en: "All" }, icon: "LayoutGrid" },
  { id: "comunicacion", label: { es: "Comunicación", en: "Communication" }, icon: "MessageSquare" },
  { id: "operaciones", label: { es: "Operaciones", en: "Operations" }, icon: "Boxes" },
  { id: "finanzas", label: { es: "Finanzas", en: "Finance" }, icon: "Landmark" },
  { id: "comercial", label: { es: "Comercial", en: "Commercial" }, icon: "ShoppingBag" },
  { id: "productividad", label: { es: "Productividad", en: "Productivity" }, icon: "SquareKanban" },
  { id: "plataforma", label: { es: "Plataforma", en: "Platform" }, icon: "Globe" },
  { id: "sistema", label: { es: "Sistema", en: "System" }, icon: "Layers" },
];

export interface RoadmapEntry {
  name: { es: string; en: string };
  icon: string;
}

export const roadmap: RoadmapEntry[] = [
  { name: { es: "Facturación CFDI 4.0", en: "CFDI 4.0 Invoicing" }, icon: "Receipt" },
  { name: { es: "Logística y Envíos", en: "Logistics & Shipping" }, icon: "Truck" },
  { name: { es: "API Pública y Webhooks", en: "Public API & Webhooks" }, icon: "Plug" },
];
