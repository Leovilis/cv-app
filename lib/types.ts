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
  cvFileName: string;
  cvStoragePath: string;
  cvUrl?: string;
  uploadedBy: string;
  uploadedAt: string;

  // Campos de selección (gestionados por admin)
  puestoSeleccionado?: string;
  estadoSeleccion?: string;
  fechaSeleccion?: string;
  notasAdmin?: string;
  motivoDescarte?: string;

  // Campos de repostulación (candidato descartado que vuelve a postularse)
  repostulacionDescartado?: boolean;
  motivoDescarteAnterior?: string;
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
  cv: File | null;
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