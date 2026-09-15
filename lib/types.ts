// lib/types.ts

export interface CV {
  id?: string;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
  telefonoArea: string;
  telefonoNumero: string;
  fechaNacimiento: string;
  nivelFormacion: string;

  // Residencia
  provincia: string;
  departamento: string;
  lugarResidencia?: string; // legacy — CVs cargados antes del cambio a provincia/departamento

  // Área y puesto postulado por el candidato
  area: string;
  subArea?: string;
  puestosPostulados?: PuestoPostulado[];

  // Área y puesto asignados por el admin (puede diferir de lo postulado)
  areaAsignada?: string;

  cvFileName: string;
  cvStoragePath: string;
  cvUrl?: string;
  uploadedBy: string;
  uploadedAt: string;

  // Búsquedas activas (IDs a los que se postuló)
  busquedasPostuladas?: string[];

  // Datos enriquecidos de las búsquedas (poblados al hacer fetch)
  busquedasInfo?: {
    id: string;
    titulo: string;
    area: string;
    puesto?: string;
    provincia?: string;
    departamento?: string;
    lugarResidencia?: string;
  }[];

  // Estado de revisión
  revisado?: boolean;
  revisadoAt?: string;
  fechaUltimaRevision?: string;
  revisadoPor?: string;

  // Campos de selección (gestionados por admin)
  puestoSeleccionado?: string;
  estadoSeleccion?: string;
  fechaSeleccion?: string;
  notasAdmin?: string;
  motivoDescarte?: string;

  // Referencias laborales
  referenciasLaborales?: string;

  // Puntuaciones de entrevistas
  puntuacionRRHH?: number;
  puntuacionAreaTecnica?: number;

  // Prioridad en terna
  prioridadTerna?: number;

  // Exámenes
  examenFisico?: boolean;
  examenFisicoFecha?: string;
  examenFisicoNotas?: string;
  examenFisicoResultado?: string;
  examenPsicotecnico?: boolean;
  examenPsicotecnicoFecha?: string;
  examenPsicotecnicoNotas?: string;
  examenPsicotecnicoResultado?: string;

  // Repostulación de candidato previamente descartado
  repostulacionDescartado?: boolean;
  motivoDescarteAnterior?: string;

  // Historial de estados
  historialEstados?: HistorialEstado[];
}

export interface PuestoPostulado {
  area: string;
  subArea: string;
}

export interface HistorialEstado {
  estado: string;
  fecha: string;
  motivo?: string;
  notas?: string;
  realizadoPor?: string;
}

// ─── ABM Áreas y Puestos ─────────────────────────────────────────────────────
export interface Area {
  id?: string;
  nombre: string;
  puestos: string[];
  creadaAt?: string;
  creadaPor?: string;
}

// ─── Búsquedas activas ───────────────────────────────────────────────────────
export interface BusquedaActiva {
  id?: string;
  titulo: string;
  area: string;
  puesto?: string;
  lugarResidencia: string;
  acercaDelPuesto?: string;
  principalesResponsabilidades?: string;
  requisitos?: string;
  provincia?: string;
  departamento?: string;
  creadaPor: string;
  creadaAt: string;
  activa: boolean;
}

// ─── Formulario de carga ─────────────────────────────────────────────────────
export interface CVFormData {
  nombre: string;
  apellido: string;
  dni: string;
  telefonoArea: string;
  telefonoNumero: string;
  fechaNacimiento: string;
  nivelFormacion: string;
  // Residencia — puede ser texto libre (lugarResidencia) o estructurada (provincia + departamento)
  provincia?: string;
  departamento?: string;
  lugarResidencia?: string;
  // Área y puesto postulado
  area?: string;
  subArea?: string;
  cv: File | null;
  busquedasPostuladas: string[];
  puestosPostulados?: PuestoPostulado[];
}

// ─── Tipos del panel admin ────────────────────────────────────────────────────
export type TabType =
  | "todos"
  | "entrevistaRRHH"
  | "entrevistaAreaTecnica"
  | "terna"
  | "seleccionados"
  | "descartados";

export type ExamType = "fisico" | "psicotecnico";

export type ExamResultado = "Apto" | "Apto con observaciones" | "No Apto" | "";

export type NivelFormacion =
  | "Secundario"
  | "Terciario"
  | "Universitario"
  | "Formación Superior";

export type EstadoSeleccion =
  | "En Curso"
  | "Entrevista RRHH"
  | "Entrevista Área Técnica"
  | "Terna Preseleccionados"
  | "Seleccionado"
  | "Descartado"
  | "Quitado del Proceso"
  | "Aprobado"
  | "Rechazado"
  | "Contratado";

// ─── Constantes exportadas ────────────────────────────────────────────────────
export const NIVELES_FORMACION = [
  "Secundario",
  "Terciario",
  "Universitario",
  "Formación Superior",
] as const;

export const ESTADOS_SELECCION: string[] = [
  "En Curso",
  "Entrevista RRHH",
  "Entrevista Área Técnica",
  "Terna Preseleccionados",
  "Seleccionado",
  "Descartado",
  "Quitado del Proceso",
];

export const MOTIVOS_QUITAR_PROCESO = [
  "No cumple con el perfil requerido",
  "Actitud no apta durante el proceso",
  "Malas Referencias",
  "Rechazó oferta",
  "Declinó la oferta",
  "No se presentó a la entrevista",
  "Información falsa o inconsistente",
  "Perfil sobrecalificado",
  "Perfil insuficiente",
  "Cambio de requisitos del puesto",
  "Otro motivo",
] as const;

export const MOTIVOS_DESCARTE = [
  "Declinó la oferta a último momento",
  "No se presentó a la entrevista",
  "Perfil no se adapta",
  "No cumple con el perfil requerido",
  "Actitud no apta durante el proceso",
  "Malas Referencias",
  "Rechazó oferta",
  "No apto EPO",
  "No apto psicológico",
  "Información falsa o inconsistente",
  "Otro motivo",
] as const;

export interface MeetingData {
  date: string;
  time: string;
  platform: "meet" | "zoom" | "teams";
  notes: string;
}

export interface ReferenciaEntry {
  empresa: string;
  contacto: string;
  cargo: string;
  telefono: string;
  comentario: string;
}

export interface APIResponse<T = any> {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
}
