// components/AdminPanel/types.ts
import { CV, TabType, ExamType } from '@/lib/types';

// Props del componente CVCard
export interface CVCardProps {
  cv: CV;
  activeTab: TabType;
  editingCV: string | null;
  schedulingCV: string | null;
  onStartSelection: (cvId: string) => void;
  onCancelSelection: () => void;
  onSaveSelection: (cvId: string, data: { puesto: string; estado: string; notas: string }) => void;
  onSchedule: (cvId: string | null) => void;
  onDownload: (cv: CV) => void;
  onDelete: (cv: CV) => void;
  onDiscard: (cv: CV) => void;
  onReactivar: (cv: CV) => void;
  onSendMail: (cv: CV) => void;
  onExam: (cv: CV, tipo: ExamType) => void;
  onReferences: (cv: CV) => void;
  onRanking: (cv: CV, tipo: 'RRHH' | 'Area Tecnica') => void;
  onQuitProceso: (cv: CV) => void;
  onHistorial: (cv: CV) => void;
}

// Props del componente TabsNav
export interface TabsNavProps {
  tabs: Array<{
    id: TabType;
    label: string;
    count: number;
    accent: string;
    active: string;
  }>;
  activeTab: TabType;
  onTabChange: (tabId: TabType) => void;
}

// Props del componente FiltersBar
export interface FiltersBarProps {
  activeTab: TabType;
  selectedArea: string;
  onAreaChange: (area: string) => void;
  selectedFormacion: string;
  onFormacionChange: (formacion: string) => void;
  selectedResidencia: string;
  onResidenciaChange: (residencia: string) => void;
  selectedPuesto: string;
  onPuestoChange: (puesto: string) => void;
  puestosDisponibles: string[];
  lugaresResidencia: string[];
  onRefresh: () => void;
}

// Props del componente SelectionEditor
export interface SelectionEditorProps {
  cv: CV;
  availableEstados: string[];
  onSave: (data: { puesto: string; estado: string; notas: string }) => void;
  onCancel: () => void;
}

// Props del componente RankingModal
export interface RankingModalProps {
  cv: CV;
  tipo: 'RRHH' | 'Area Tecnica';
  onConfirm: (puntuacion: number, notas: string) => void;
  onCancel: () => void;
}

// Props del componente QuitarProcesoModal
export interface QuitarProcesoModalProps {
  cv: CV;
  onConfirm: (motivo: string, notas: string) => void;
  onCancel: () => void;
}

// Props del componente HistorialModal
export interface HistorialModalProps {
  cv: CV;
  onClose: () => void;
}

// Props del componente DiscardModal
export interface DiscardModalProps {
  cv: CV;
  onConfirm: (motivo: string, notas: string) => void;
  onCancel: () => void;
}

// Props del componente ExamModal
export interface ExamModalProps {
  cv: CV;
  tipo: ExamType;
  onConfirm: (notas: string, fecha: string, resultado: 'Apto' | 'Apto con observaciones' | 'No Apto' | '') => void;
  onCancel: () => void;
  onCancelarExamen: () => void;
}

// Props del componente ReferencesModal
export interface ReferencesModalProps {
  cv: CV;
  onSave: (texto: string) => void;
  onClose: () => void;
}

// Props del componente InterviewScheduler
export interface InterviewSchedulerProps {
  cv: CV;
  label: string;
  onClose: () => void;
}