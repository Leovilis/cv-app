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
  lugarResidencia: string;
  cvFileName: string;
  cvStoragePath: string;
  cvUrl?: string;
  uploadedBy: string;
  uploadedAt: string;

  // Búsquedas activas a las que se postuló
  busquedasPostuladas?: string[]; // IDs de BusquedaActiva

  // Campos de selección (gestionados por admin)
  puestoSeleccionado?: string;
  estadoSeleccion?: string;
  fechaSeleccion?: string;
  notasAdmin?: string;
  motivoDescarte?: string;

  // Repostulación de candidato previamente descartado
  repostulacionDescartado?: boolean;
  motivoDescarteAnterior?: string;

  // Historial de estados (se acumula en cada cambio de estado)
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
  | 'Entrevista'
  | 'Preseleccionado'
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