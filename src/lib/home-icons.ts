// src/lib/home-icons.ts
// Icon + tile color for the module names shown on the home (es/en labels).
// Colors echo the module tiles of the product's own Home screen.
const M: Record<string, [string, string]> = {
  compras: ["ShoppingCart", "#d97706"], purchasing: ["ShoppingCart", "#d97706"],
  inventario: ["Package", "#ea580c"], inventory: ["Package", "#ea580c"],
  activos: ["Package", "#ea580c"], assets: ["Package", "#ea580c"],
  flota: ["Truck", "#0d9488"], fleet: ["Truck", "#0d9488"],
  pos: ["Store", "#f97316"],
  "catálogo": ["BookOpen", "#ea580c"], catalog: ["BookOpen", "#ea580c"],
  calendario: ["CalendarDays", "#7c3aed"], calendar: ["CalendarDays", "#7c3aed"],
  proyectos: ["FolderKanban", "#6366f1"], projects: ["FolderKanban", "#6366f1"],
  chat: ["MessageSquare", "#8b5cf6"],
  contactos: ["Contact", "#0ea5e9"], contacts: ["Contact", "#0ea5e9"],
  archivos: ["FolderOpen", "#f59e0b"], files: ["FolderOpen", "#f59e0b"],
  identidad: ["ShieldCheck", "#06b6d4"], identity: ["ShieldCheck", "#06b6d4"],
  empresa: ["Building2", "#ec4899"], company: ["Building2", "#ec4899"],
};
export function modIcon(label: string): [string, string] {
  return M[label.toLowerCase()] ?? ["Boxes", "#0e3a8c"];
}
