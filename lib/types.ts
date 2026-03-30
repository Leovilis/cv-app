export interface CV {
  id?: string;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;           // tomado de uploadedBy si es el mismo usuario
  telefonoArea: string;
  telefonoNumero: string;
  fechaNacimiento: string;
  nivelFormacion: string;
  area: string;
  lugarResidencia: string;
  cvFileName: string;
  cvStoragePath: string;
  cvUrl?: string;
  uploadedBy: string;       // email del que cargó — usado como contacto
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
  examenPsicotecnico?: boolean;
  examenPsicotecnicoFecha?: string;
  examenPsicotecnicoNotas?: string;

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