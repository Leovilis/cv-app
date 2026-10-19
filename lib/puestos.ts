// lib/puestos.ts
// Helpers para normalizar áreas y puestos (evita duplicados MAYÚSCULAS / minúsculas)

// Siglas que se mantienen en mayúsculas al convertir
const SIGLAS = new Set([
  "RRHH", "RSE", "IT", "TI", "SAP", "ERP", "CRM", "BI", "UX", "UI", "QA",
  "HSE", "IVA", "AFIP", "ARCA", "PYME", "CEO", "CFO", "CTO", "SRL", "SA",
]);

/** Clave de comparación: sin acentos, minúsculas, espacios simples. */
export const puestoKey = (s: string | null | undefined): string =>
  (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/** true si el texto está todo en mayúsculas (ej: "ANALISTA CONTABLE"). */
export const esTodoMayusculas = (s: string): boolean =>
  s === s.toUpperCase() && s !== s.toLowerCase();

/** "ANALISTA DE RRHH" → "Analista de RRHH" */
export const aFormatoOracion = (s: string): string => {
  const palabras = s.trim().replace(/\s+/g, " ").split(" ");
  return palabras
    .map((p, i) => {
      if (SIGLAS.has(p.toUpperCase())) return p.toUpperCase();
      const lower = p.toLocaleLowerCase("es");
      return i === 0 ? lower.charAt(0).toLocaleUpperCase("es") + lower.slice(1) : lower;
    })
    .join(" ");
};

/** Devuelve la versión "limpia" de un puesto: si viene en mayúsculas, la pasa a minúsculas. */
export const limpiarPuesto = (s: string | null | undefined): string => {
  const t = (s || "").trim().replace(/\s+/g, " ");
  if (!t) return "";
  return esTodoMayusculas(t) ? aFormatoOracion(t) : t;
};

/**
 * Elimina duplicados que solo difieren en mayúsculas/acentos.
 * Conserva la variante con minúsculas; si solo existe en mayúsculas, la convierte.
 */
export const dedupePuestos = (lista: (string | null | undefined)[]): string[] => {
  const porClave = new Map<string, string>();
  for (const item of lista) {
    const t = (item || "").trim().replace(/\s+/g, " ");
    if (!t) continue;
    const k = puestoKey(t);
    const actual = porClave.get(k);
    if (!actual) {
      porClave.set(k, t);
    } else if (esTodoMayusculas(actual) && !esTodoMayusculas(t)) {
      porClave.set(k, t); // preferir la versión en minúsculas
    }
  }
  return Array.from(porClave.values())
    .map(limpiarPuesto)
    .sort((a, b) => a.localeCompare(b, "es"));
};

// ── Helpers de CV ────────────────────────────────────────────────────────────
type CvLike = {
  area?: string;
  subArea?: string;
  puestoSeleccionado?: string;
  busquedasInfo?: { area?: string; puesto?: string }[];
};

/** Área del CV: la elegida a mano o, si postuló a una búsqueda activa, la de la búsqueda. */
export const getCvArea = (cv: CvLike): string =>
  cv.area || cv.busquedasInfo?.[0]?.area || "";

/** Puesto del CV: el asignado, el elegido a mano o el de la búsqueda activa. */
export const getCvPuesto = (cv: CvLike): string =>
  cv.puestoSeleccionado || cv.subArea || cv.busquedasInfo?.[0]?.puesto || "";
