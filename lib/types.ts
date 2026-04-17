// lib/types.ts
// ============================================
// TIPOS PRINCIPALES
// ============================================

export interface CV {
  id?: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefonoArea: string;
  telefonoNumero: string;
  fechaNacimiento: string;
  nivelFormacion: string;
  area: string;
  subArea?: string;
  puestosPostulados?: Array<{ area: string; subArea: string }>;
  lugarResidencia?: string;
  email?: string;
  cvFileName: string;
  cvStoragePath: string;
  cvUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  
  // Búsquedas activas
  busquedasPostuladas?: string[];
  busquedasInfo?: Array<{ id: string; titulo: string; puesto: string }>;
  
  // Selección (gestionado por admin)
  puestoSeleccionado?: string;
  estadoSeleccion?: string;
  notasAdmin?: string;
  fechaSeleccion?: string;
  motivoDescarte?: string;
  repostulacionDescartado?: boolean;
  motivoDescarteAnterior?: string;
  
  // Área asignada por RRHH (prevalece sobre la del postulante)
  areaAsignada?: string;
  
  // Exámenes
  examenFisico?: boolean;
  examenFisicoFecha?: string;
  examenFisicoNotas?: string;
  examenFisicoResultado?: 'Apto' | 'Apto con observaciones' | 'No Apto' | '';
  examenPsicotecnico?: boolean;
  examenPsicotecnicoFecha?: string;
  examenPsicotecnicoNotas?: string;
  examenPsicotecnicoResultado?: 'Apto' | 'Apto con observaciones' | 'No Apto' | '';
  
  // Referencias laborales
  referenciasLaborales?: string;
  
  // Ranking y puntuaciones
  puntuacionRRHH?: number;        // 1-10
  puntuacionAreaTecnica?: number; // 1-10
  fechaEntrevistaRRHH?: string;
  fechaEntrevistaAreaTecnica?: string;
  
  // Promedio para ordenar en terna
  promedioTerna?: number;
  
  // Prioridad manual en terna
  prioridadTerna?: number;
  
  // Fechas de reactivación
  fechaReactivacion?: string;
  fechaDescarteAnterior?: string;
  
  // Quitado del proceso
  motivoQuitadoProceso?: string;
  fechaQuitadoProceso?: string;
  
  // Historial
  historialEstados?: HistorialEstado[];
  historialInstancias?: HistorialInstancia[];
}

export interface HistorialEstado {
  estado: string;
  fecha: string;
  motivo?: string;
  notas?: string;
  realizadoPor?: string;
}

export interface HistorialInstancia {
  id: string;
  fecha: string;
  instancia: 'ENTREVISTA_RRHH' | 'ENTREVISTA_AREA_TECNICA' | 'TERNA' | 'SELECCIONADO' | 'QUITADO_PROCESO';
  puntuacion?: number;
  motivo?: string;
  notas?: string;
  realizadoPor: string;
}

export interface BusquedaActiva {
  id?: string;
  titulo: string;
  area: string;
  puesto: string;
  lugarResidencia: string;
  activa: boolean;
  creadaAt: string;
  creadaPor: string;
}

export interface CVFormData {
  nombre: string;
  apellido: string;
  dni: string;
  telefonoArea: string;
  telefonoNumero: string;
  fechaNacimiento: string;
  nivelFormacion: string;
  area: string;
  lugarResidencia: string;
  cv: File | null;
  busquedasPostuladas: string[];
}

export interface MeetingData {
  date: string;
  time: string;
  platform: 'meet' | 'zoom' | 'teams';
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

// ============================================
// TIPOS PARA EL PANEL DE ADMINISTRACIÓN
// ============================================

export type TabType = 'todos' | 'entrevistaRRHH' | 'entrevistaAreaTecnica' | 'terna' | 'seleccionados' | 'descartados';
export type ExamType = 'fisico' | 'psicotecnico';
export type ExamResultado = 'Apto' | 'Apto con observaciones' | 'No Apto' | '';

// ============================================
// CONSTANTES
// ============================================

export const AREAS_PUESTOS: Record<string, string[]> = {
  'PLANIFICACION ESTRATEGICA': ['COORDINADOR PLANIFICACION ESTRATEGICA', 'ANALISTA PLANIF ESTRATEGICA', 'ANALISTA DE COSTOS'],
  'FINANZAS': ['COORDINADORA FINANZAS', 'TESORERO', 'ANALISTA DE FINANZAS', 'ADM FINANZAS'],
  'CONTABLE': ['COORDINADOR CONTABLE', 'ANALISTA CONTABLE BEBIDAS', 'ANALISTA CONTABLE SERVICIOS', 'ADM CONTABLE BEBIDAS', 'ADM CONTABLE SERVICIOS', 'ADM COMERCIAL'],
  'CONTROL DE GESTION': ['ANALISTA CONTROL DE GESTION'],
  'IMPUESTOS': ['ANALISTA DE IMPUESTOS', 'ADM IMPUESTOS', 'ADM DE FACTURACION'],
  'AUDITORIA': ['COORDINADOR AUDITORIA', 'AUDITOR INTERNO DE BEBIDAS', 'RESPONSABLE AUDITORIA PyS', 'AUDITOR INTERNO PyS'],
  'SISTEMAS': ['COORDINADOR SISTEMAS', 'TECNICO INFROMATICO'],
  'RRHH HARD': ['RESPONSABLE RRHH HARD', 'ANALISTA RRHH HARD', 'ANALISTA NOVEDADES RRHH HARD'],
  'RRHH SOFT': ['COORDINADORA RRHH SOFT', 'ANALISTA RRHH SOFT'],
  'GESTION DE CALIDAD': ['COORDINADORA GESTION DE CALIDAD', 'ANALISTA GESTION DE CALIDAD'],
  'GESTION DOCUMENTAL': ['ANALISTA DE HABILITACIONES E INOCUIDAD ALIMENTARIA'],
  'RSE': ['RESPONSABLE RSE'],
  'DATA ANALYTICS': ['RESPONSABLE DATA ANALYTICS', 'ANALISTA DE DATOS'],
  'COMPRAS': ['RESPONSABLE COMPRAS', 'ADMINISTRATIVO DE COMPRAS'],
  'MARKETING': ['GERENCIA MARKETING', 'ANALISTA MARKETING'],
  'MAESTRANZA': ['MAESTRANZA'],
  'COORDINACION GENERAL': ['COORDINADOR GENERAL'],
  'DISTRIBUIDORA': ['PREVENTISTA', 'MERCHANDASING', 'REPOSITOR', 'SUPERVISOR DE VENTAS', 'CHOFER DE REPARTO', 'AYUDANTE DE REPARTO', 'ENCARGADO DE DEPOSITO', 'AYUDANTE DE DEPOSITO', 'CAJERO', 'JEFE DE SUCURSAL'],
  'HOTELERIA, GASTRONOMIA Y TURISMO': ['MOZO/A', 'COCINERO', 'AYUDANTE DE COCINA', 'PANADERO/PASTELERO', 'RECEPCIONISTA', 'MUCAMO/A', 'MANTENIMIENTO', 'JARDINERO', 'MASAJISTA', 'ADMINISTRATIVO DE HOTEL', 'JEFE DE OPERACIONES HOTELERAS', 'ENCARGADO DE COMPRAS', 'SOMMELIER', 'EJECUTIVO DE ENOTURISMO', 'ENOLOGO', 'OBRERO DE VIÑEDOS', 'SERENO DE HOTEL'],
  'INDUSTRIA LACTEA': ['RESPONSABLE DE PLANTA', 'ADMINISTRATIVO DE PLANTA', 'OPERARIO DE ENVASADO', 'OPERARIO DE ETIQUETADO', 'OPERARIO DE FRACCIONADO', 'OPERARIO DE PRODUCCION', 'RESPONSABLE DE ALIMENTACION', 'RESPONSABLE DE CRIANZA', 'AYUDANTE DE CRIANZA', 'RESPONSABLE DE ORDEÑE', 'AYUDANTE DE ORDEÑE', 'SERENO DE TAMBO', 'AUXILIARES DE PRODUCCION', 'RESPONSABLE DE PRODUCCION', 'SUB RESPONSABLE DE PRODUCCION'],
};

export const AREAS = Object.keys(AREAS_PUESTOS).sort();

export const NIVELES_FORMACION = ['Secundario', 'Terciario', 'Universitario', 'Formación Superior'];

export const ESTADOS_SELECCION = [
  'En Curso',
  'Entrevista RRHH',
  'Entrevista Área Técnica',
  'Terna Preseleccionados',
  'Seleccionado',
  'Descartado',
  'Aprobado',
  'Rechazado',
  'Contratado',
  'Quitado del Proceso'
];

export const MOTIVOS_DESCARTE = [
  'Declinó la oferta a último momento',
  'No se presentó a la entrevista',
  'Perfil no se adapta',
  'No cumple con el perfil requerido',
  'Actitud no apta durante el proceso',
  'Malas Referencias',
  'Rechazó oferta',
  'No apto EPO',
  'No apto psicológico',
  'Información falsa o inconsistente',
  'Otro motivo',
];

export const MOTIVOS_QUITAR_PROCESO = [
  'No cumple con el perfil requerido',
  'Actitud no apta durante el proceso',
  'Malas Referencias',
  'Rechazó oferta',
  'Declinó la oferta',
  'No se presentó a la entrevista',
  'Información falsa o inconsistente',
  'Perfil sobrecalificado',
  'Perfil insuficiente',
  'Cambio de requisitos del puesto',
  'Otro motivo'
];