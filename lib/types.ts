// types.ts - Versión actualizada

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
  area: string;
  subArea?: string;             // Puesto específico dentro del área
  lugarResidencia: string;
  cvFileName: string;
  cvStoragePath: string;
  cvUrl?: string;
  uploadedBy: string;
  uploadedAt: string;

  // Búsquedas activas a las que se postuló
  busquedasPostuladas?: string[];

  // Campos de selección (gestionados por admin)
  puestoSeleccionado?: string;
  estadoSeleccion?: string;
  fechaSeleccion?: string;
  notasAdmin?: string;
  motivoDescarte?: string;

  // Exámenes solicitados
  examenFisico?: boolean;
  examenFisicoFecha?: string;
  examenFisicoNotas?: string;
  examenFisicoResultado?: 'Apto' | 'Apto con observaciones' | 'No Apto' | '';
  examenPsicotecnico?: boolean;
  examenPsicotecnicoFecha?: string;
  examenPsicotecnicoNotas?: string;
  examenPsicotecnicoResultado?: 'Apto' | 'Apto con observaciones' | 'No Apto' | '';

  // Prioridad en terna (por área+puesto, 1 = mayor prioridad)
  prioridadTerna?: number;

  // Referencias laborales obtenidas en entrevista RRHH
  referenciasLaborales?: string;

  // Repostulación de candidato previamente descartado
  repostulacionDescartado?: boolean;
  motivoDescarteAnterior?: string;

  // Historial de estados
  historialEstados?: HistorialEstado[];
}

export interface HistorialEstado {
  estado: string;
  fecha: string;
  motivo?: string;
  notas?: string;
}

export interface BusquedaActiva {
  id?: string;
  titulo: string;
  area: string;
  puesto: string;
  lugarResidencia: string;
  creadaPor: string;
  creadaAt: string;
  activa: boolean;
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

export type NivelFormacion = 'Secundario' | 'Terciario' | 'Universitario' | 'Formación Superior';

export type EstadoSeleccion =
  | 'En Curso'
  | 'Entrevista RRHH'
  | 'Entrevista Coordinador'
  | 'Terna Preseleccionados'
  | 'Seleccionado'
  | 'Descartado'
  | 'Aprobado'
  | 'Rechazado'
  | 'Contratado';

export interface APIResponse<T = any> {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
}

// ============================================
// CONSTANTES COMPARTIDAS
// ============================================

export const AREAS_PUESTOS: Record<string, string[]> = {
  'PLANIFICACION ESTRATEGICA':           ['COORDINADOR PLANIFICACION ESTRATEGICA','ANALISTA PLANIF ESTRATEGICA','ANALISTA DE COSTOS'],
  'FINANZAS':                            ['COORDINADORA FINANZAS','TESORERO','ANALISTA DE FINANZAS','ADM FINANZAS'],
  'CONTABLE':                            ['COORDINADOR CONTABLE','ANALISTA CONTABLE BEBIDAS','ANALISTA CONTABLE SERVICIOS','ADM CONTABLE BEBIDAS','ADM CONTABLE SERVICIOS','ADM COMERCIAL'],
  'CONTROL DE GESTION':                  ['ANALISTA CONTROL DE GESTION'],
  'IMPUESTOS':                           ['ANALISTA DE IMPUESTOS','ADM IMPUESTOS','ADM DE FACTURACION'],
  'AUDITORIA BEBIDAS':                   ['COORDINADORA AUDITORIA','AUDITOR INTERNO DE BEBIDAS'],
  'AUDITORIA PRODUCCION Y SERVICIOS':    ['RESPONSABLE AUDITORIA PyS','AUDITOR INTERNO PyS'],
  'SISTEMAS':                            ['COORDINADOR SISTEMAS','TECNICO INFROMATICO'],
  'RRHH HARD':                           ['RESPONSABLE RRHH HARD','ANALISTA RRHH HARD','ANALISTA NOVEDADES RRHH HARD'],
  'RRHH SOFT':                           ['COORDINADORA RRHH SOFT','ANALISTA RRHH SOFT'],
  'GESTION DE CALIDAD':                  ['COORDINADORA GESTION DE CALIDAD','ANALISTA GESTION DE CALIDAD'],
  'GESTION DOCUMENTAL':                  ['ANALISTA DE HABILITACIONES E INOCUIDAD ALIMENTARIA'],
  'RSE':                                 ['RESPONSABLE RSE'],
  'DATA ANALYTICS':                      ['RESPONSABLE DATA ANALYTICS','ANALISTA DE DATOS'],
  'COMPRAS':                             ['RESPONSABLE COMPRAS','ADMINISTRATIVO DE COMPRAS'],
  'MARKETING':                           ['GERENCIA MARKETING','ANALISTA MARKETING'],
  'MAESTRANZA':                          ['MAESTRANZA'],
  'COORDINACION GENERAL':                ['COORDINADOR GENERAL'],
  'DISTRIBUIDORA':                       ['PREVENTISTA','MERCHANDASING','REPOSITOR','SUPERVISOR DE VENTAS','CHOFER DE REPARTO','AYUDANTE DE REPARTO','ENCARGADO DE DEPOSITO','AYUDANTE DE DEPOSITO','CAJERO','JEFE DE SUCURSAL'],
  'HOTELERIA, GASTRONOMIA Y TURISMO':    ['MOZO/A','COCINERO','AYUDANTE DE COCINA','PANADERO/PASTELERO','RECEPCIONISTA','MUCAMO/A','MANTENIMIENTO','JARDINERO','MASAJISTA','ADMINISTRATIVO DE HOTEL','JEFE DE OPERACIONES HOTELERAS','ENCARGADO DE COMPRAS','SOMMELIER','EJECUTIVO DE ENOTURISMO','ENOLOGO','OBRERO DE VIÑEDOS','SERENO DE HOTEL'],
  'INDUSTRIA LACTEA':                    ['RESPONSABLE DE PLANTA','ADMINISTRATIVO DE PLANTA','OPERARIO DE ENVASADO','OPERARIO DE ETIQUETADO','OPERARIO DE FRACCIONADO','OPERARIO DE PRODUCCION','RESPONSABLE DE ALIMENTACION','RESPONSABLE DE CRIANZA','AYUDANTE DE CRIANZA','RESPONSABLE DE ORDEÑE','AYUDANTE DE ORDEÑE','SERENO DE TAMBO','AUXILIARES DE PRODUCCION','RESPONSABLE DE PRODUCCION','SUB RESPONSABLE DE PRODUCCION'],
};

export const AREAS = Object.keys(AREAS_PUESTOS).sort();
export const TODOS_LOS_PUESTOS = Array.from(new Set(Object.values(AREAS_PUESTOS).flat())).sort();

// Niveles de formación
export const NIVELES_FORMACION = ['Secundario', 'Terciario', 'Universitario', 'Formación Superior'];

// Estados de selección
export const ESTADOS_SELECCION = [
  'En Curso', 'Entrevista RRHH', 'Entrevista Coordinador',
  'Terna Preseleccionados', 'Seleccionado', 'Descartado', 'Aprobado', 'Rechazado', 'Contratado'
];

// Motivos de descarte
export const MOTIVOS_DESCARTE = [
  'Declinó la oferta a último momento', 'No se presentó a la entrevista', 'Perfil no se adapta',
  'No cumple con el perfil requerido', 'Actitud no apta durante el proceso', 'Malas Referencias',
  'Rechazó oferta', 'No apto EPO', 'No apto psicológico',
  'Información falsa o inconsistente', 'Otro motivo',
];