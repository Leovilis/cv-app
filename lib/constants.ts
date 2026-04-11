// lib/constants.ts
import { ExamType, ExamResultado } from './types';

// Badges para exámenes
export const EXAM_BADGE: Record<ExamType, { bg: string; border: string; text: string; label: string }> = {
  fisico: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-800', label: 'Examen Físico' },
  psicotecnico: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-800', label: 'Examen Psicotécnico' },
};

// Configuración de resultados de exámenes
export const RESULTADO_CONFIG: Record<Exclude<ExamResultado, ''>, { bg: string; border: string; text: string; icon: string }> = {
  'Apto': { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800', icon: '✅' },
  'Apto con observaciones': { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-800', icon: '⚠️' },
  'No Apto': { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800', icon: '❌' },
};

// Configuración de plataformas de videollamadas
export const PLATFORM_CONFIG = {
  teams: { label: 'Teams', color: 'bg-purple-600 hover:bg-purple-700', urlBase: 'https://teams.microsoft.com/l/meeting/new', icon: '💼' },
  meet: { label: 'Google Meet', color: 'bg-green-600 hover:bg-green-700', urlBase: 'https://meet.google.com/new', icon: '🎥' },
  zoom: { label: 'Zoom', color: 'bg-blue-600 hover:bg-blue-700', urlBase: 'https://zoom.us/start/videomeeting', icon: '📹' },
};

// Helper para obtener etiqueta de instancia (para el modal de historial)
export const getInstanciaLabel = (instancia: string): string => {
  const labels: Record<string, string> = {
    'ENTREVISTA_RRHH': '📋 Entrevista RRHH',
    'ENTREVISTA_AREA_TECNICA': '🎯 Entrevista Área Técnica',
    'TERNA': '⭐ Terna Preseleccionados',
    'SELECCIONADO': '✅ Seleccionado',
    'QUITADO_PROCESO': '🚫 Quitado del Proceso'
  };
  return labels[instancia] || instancia;
};