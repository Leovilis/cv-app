// components/AdminPanel/CVCard.tsx
import React, { useState } from 'react';
import {
  Download, Trash2, UserCheck, Calendar, ArrowLeftCircle, AlertTriangle,
  Trophy, ThumbsDown, RotateCcw, History, Mail, FlaskConical, Brain, FileText, Briefcase
} from 'lucide-react';
import { CV } from '@/lib/types';
import { EXAM_BADGE, RESULTADO_CONFIG } from '@/lib/constants';
import { CVCardProps } from './types';
import { InterviewScheduler } from './InterviewScheduler';
import { SelectionEditor } from './SelectionEditor';

export const CVCard: React.FC<CVCardProps> = ({
  cv,
  activeTab,
  editingCV,
  schedulingCV,
  onStartSelection,
  onCancelSelection,
  onSaveSelection,
  onSchedule,
  onDownload,
  onDelete,
  onDiscard,
  onReactivar,
  onSendMail,
  onExam,
  onReferences,
  onRanking,
  onQuitProceso,
  onHistorial,
}) => {
  const isEditing = editingCV === cv.id;
  const isScheduling = schedulingCV === cv.id;
  const isDiscarded = cv.estadoSeleccion === 'Descartado' || cv.estadoSeleccion === 'Quitado del Proceso';
  const [showHistory, setShowHistory] = useState(false);

  const isInterviewTab = activeTab === 'entrevistaRRHH' || activeTab === 'entrevistaAreaTecnica';
  const isTerna = activeTab === 'terna';
  const isRRHHTab = activeTab === 'entrevistaRRHH';
  const isAreaTecnicaTab = activeTab === 'entrevistaAreaTecnica';

  const areaMostrada = (cv as any).areaAsignada || cv.area || 'No especificada';
  const tieneAsignacionAdmin = !!(cv.puestoSeleccionado || (cv as any).areaAsignada);

  // Calcular días desde carga
  const diasDesdeCarga = Math.floor((new Date().getTime() - new Date(cv.uploadedAt).getTime()) / (1000 * 60 * 60 * 24));

  const badgeBg = cv.estadoSeleccion === 'Descartado' || cv.estadoSeleccion === 'Quitado del Proceso' ? 'bg-red-50 border-red-300' :
    cv.estadoSeleccion === 'Seleccionado' ? 'bg-green-50 border-green-300' :
      cv.estadoSeleccion === 'Terna Preseleccionados' ? 'bg-amber-50 border-amber-300' :
        cv.estadoSeleccion === 'Entrevista Área Técnica' ? 'bg-purple-50 border-purple-300' :
          cv.estadoSeleccion === 'Entrevista RRHH' ? 'bg-blue-50 border-blue-300' :
            'bg-gray-50 border-gray-200';

  const badgeTxt = cv.estadoSeleccion === 'Descartado' || cv.estadoSeleccion === 'Quitado del Proceso' ? 'text-red-900' :
    cv.estadoSeleccion === 'Seleccionado' ? 'text-green-900' :
      cv.estadoSeleccion === 'Terna Preseleccionados' ? 'text-amber-900' :
        cv.estadoSeleccion === 'Entrevista Área Técnica' ? 'text-purple-900' :
          cv.estadoSeleccion === 'Entrevista RRHH' ? 'text-blue-900' : 'text-gray-900';

  const schedulerLabel = activeTab === 'entrevistaRRHH' ? 'Entrevista RRHH' : 'Entrevista Área Técnica';
  const tienePuntuacionRRHH = (cv as any).puntuacionRRHH;
  const tienePuntuacionArea = (cv as any).puntuacionAreaTecnica;

  const getAvailableEstados = () => {
    if (activeTab === 'todos') return ['En Curso', 'Entrevista RRHH'];
    if (activeTab === 'entrevistaRRHH') return ['Entrevista RRHH', 'Entrevista Área Técnica'];
    if (activeTab === 'entrevistaAreaTecnica') return ['Entrevista Área Técnica', 'Terna Preseleccionados'];
    if (activeTab === 'terna') return ['Terna Preseleccionados', 'Seleccionado'];
    if (activeTab === 'seleccionados') return ['Seleccionado'];
    return [];
  };

  const ExamBadges = () => {
    const hasFisico = cv.examenFisico;
    const hasPsi = cv.examenPsicotecnico;
    if (!hasFisico && !hasPsi) return null;
    const resFisicoCfg = cv.examenFisicoResultado ? RESULTADO_CONFIG[cv.examenFisicoResultado] : null;
    const resPsiCfg = cv.examenPsicotecnicoResultado ? RESULTADO_CONFIG[cv.examenPsicotecnicoResultado] : null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {hasFisico && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${EXAM_BADGE.fisico.bg} ${EXAM_BADGE.fisico.border} ${EXAM_BADGE.fisico.text}`}>
            <FlaskConical className="w-3.5 h-3.5"/>
            {EXAM_BADGE.fisico.label}
            {cv.examenFisicoFecha && (
              <span className="font-normal opacity-75">· {new Date(cv.examenFisicoFecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            )}
            {resFisicoCfg && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full border text-xs font-semibold ${resFisicoCfg.bg} ${resFisicoCfg.border} ${resFisicoCfg.text}`}>
                {resFisicoCfg.icon} {cv.examenFisicoResultado}
              </span>
            )}
          </div>
        )}
        {hasPsi && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${EXAM_BADGE.psicotecnico.bg} ${EXAM_BADGE.psicotecnico.border} ${EXAM_BADGE.psicotecnico.text}`}>
            <Brain className="w-3.5 h-3.5"/>
            {EXAM_BADGE.psicotecnico.label}
            {cv.examenPsicotecnicoFecha && (
              <span className="font-normal opacity-75">· {new Date(cv.examenPsicotecnicoFecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            )}
            {resPsiCfg && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full border text-xs font-semibold ${resPsiCfg.bg} ${resPsiCfg.border} ${resPsiCfg.text}`}>
                {resPsiCfg.icon} {cv.examenPsicotecnicoResultado}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`border rounded-lg hover:shadow-md transition-shadow ${isDiscarded ? 'border-red-300 bg-red-50/30' : 'border-manzur-secondary'}`}>
      {/* Banda roja para descartados */}
      {isDiscarded && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-t-lg text-sm font-semibold">
          <AlertTriangle className="w-4 h-4 flex-shrink-0"/>
          CANDIDATO NO APTO — {cv.motivoDescarte || (cv as any).motivoQuitadoProceso || 'Descartado del proceso'}
        </div>
      )}

      {/* Banda naranja para repostulaciones */}
      {cv.repostulacionDescartado && !isDiscarded && (
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-t-lg text-sm font-semibold">
          <AlertTriangle className="w-4 h-4 flex-shrink-0"/>
          ATENCIÓN: Fue descartado anteriormente — {cv.motivoDescarteAnterior}
          {(cv as any).fechaDescarteAnterior && (
            <span className="text-xs opacity-80">
              ({new Date((cv as any).fechaDescarteAnterior).toLocaleDateString('es-AR')})
            </span>
          )}
        </div>
      )}

      <div className="p-4 flex items-start justify-between">
        <div className="flex-1">
          {/* Nombre y badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <p className="font-semibold text-lg">{cv.nombre} {cv.apellido}</p>
            
            {/* Badge de antigüedad */}
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              diasDesdeCarga <= 7 ? 'bg-green-100 text-green-700' :
              diasDesdeCarga <= 30 ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              {diasDesdeCarga === 0 ? 'Hoy' : `${diasDesdeCarga} días`}
            </span>
            
            {tienePuntuacionRRHH && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                <Trophy className="w-3 h-3"/> RRHH: {tienePuntuacionRRHH}/10
              </span>
            )}
            {tienePuntuacionArea && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                <Trophy className="w-3 h-3"/> Área Técnica: {tienePuntuacionArea}/10
              </span>
            )}
          </div>

          {/* Datos personales */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
            <p>DNI: {cv.dni}</p>
            <p>Teléfono: ({cv.telefonoArea}) {cv.telefonoNumero}</p>
            <p>Nacimiento: {cv.fechaNacimiento}</p>
            <p>Formación: {cv.nivelFormacion}</p>
            {cv.lugarResidencia && <p>📍 Residencia: {cv.lugarResidencia}</p>}
            <p>Email: {cv.email || cv.uploadedBy}</p>
          </div>

          {/* Fechas importantes */}
          <div className="mt-3 pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-1.5">📅 Fechas clave</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span>📄 Carga inicial:</span>
                <span className="font-medium text-gray-700">{new Date(cv.uploadedAt).toLocaleDateString('es-AR')}</span>
              </div>
              
              {cv.fechaSeleccion && cv.estadoSeleccion !== 'En Curso' && (
                <div className="flex items-center gap-1">
                  <span>🔄 Último cambio:</span>
                  <span className="font-medium text-gray-700">{new Date(cv.fechaSeleccion).toLocaleDateString('es-AR')}</span>
                </div>
              )}
              
              {(cv as any).fechaEntrevistaRRHH && (
                <div className="flex items-center gap-1">
                  <span>🎯 Entrevista RRHH:</span>
                  <span className="font-medium text-blue-600">{new Date((cv as any).fechaEntrevistaRRHH).toLocaleDateString('es-AR')}</span>
                </div>
              )}
              
              {(cv as any).fechaEntrevistaAreaTecnica && (
                <div className="flex items-center gap-1">
                  <span>🔬 Entrevista Área Técnica:</span>
                  <span className="font-medium text-purple-600">{new Date((cv as any).fechaEntrevistaAreaTecnica).toLocaleDateString('es-AR')}</span>
                </div>
              )}
              
              {cv.estadoSeleccion === 'Descartado' && cv.fechaSeleccion && (
                <div className="flex items-center gap-1">
                  <span>❌ Fecha de descarte:</span>
                  <span className="font-medium text-red-600">{new Date(cv.fechaSeleccion).toLocaleDateString('es-AR')}</span>
                </div>
              )}
              
              {(cv as any).fechaReactivacion && (
                <div className="flex items-center gap-1 col-span-2">
                  <span>🔄 Reactivado:</span>
                  <span className="font-medium text-amber-600">{new Date((cv as any).fechaReactivacion).toLocaleDateString('es-AR')}</span>
                  {(cv as any).motivoDescarteAnterior && (
                    <span className="text-gray-400 ml-1">(previo: {(cv as any).motivoDescarteAnterior})</span>
                  )}
                </div>
              )}
              
              {cv.examenFisicoFecha && (
                <div className="flex items-center gap-1">
                  <span>💪 Examen físico:</span>
                  <span className="font-medium text-blue-600">{new Date(cv.examenFisicoFecha).toLocaleDateString('es-AR')}</span>
                </div>
              )}
              
              {cv.examenPsicotecnicoFecha && (
                <div className="flex items-center gap-1">
                  <span>🧠 Examen psicotécnico:</span>
                  <span className="font-medium text-green-600">{new Date(cv.examenPsicotecnicoFecha).toLocaleDateString('es-AR')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Área y Puesto asignado por el admin */}
          {cv.puestoSeleccionado && (
            <div className="mt-3 p-3 rounded-lg border border-green-500 bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-green-700"/>
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                  Asignado por Administrador
                </span>
              </div>
              <p className="text-base font-bold text-gray-900">{cv.puestoSeleccionado}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Área:</span> {areaMostrada}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Estado:</span>
                  <span className={`ml-1 font-semibold ${
                    cv.estadoSeleccion === 'Seleccionado' ? 'text-green-700' :
                    cv.estadoSeleccion === 'Descartado' ? 'text-red-700' :
                    cv.estadoSeleccion === 'Terna Preseleccionados' ? 'text-amber-700' :
                    cv.estadoSeleccion === 'Entrevista Área Técnica' ? 'text-purple-700' :
                    cv.estadoSeleccion === 'Entrevista RRHH' ? 'text-blue-700' :
                    'text-gray-700'
                  }`}>
                    {cv.estadoSeleccion || 'En Curso'}
                  </span>
                </p>
              </div>
              {cv.notasAdmin && (
                <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-green-200">
                  📝 {cv.notasAdmin}
                </p>
              )}
            </div>
          )}

          {/* Área original del postulante (si no tiene asignación) */}
          {!cv.puestoSeleccionado && cv.area && (
            <div className="mt-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-4 h-4 text-gray-500"/>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Área de interés (postulante)
                </span>
              </div>
              <p className="text-base font-medium text-gray-800">{cv.area}</p>
            </div>
          )}

          {/* Badges de exámenes */}
          <ExamBadges />

          {/* Notas de exámenes */}
          {cv.examenFisico && cv.examenFisicoNotas && (
            <p className="text-xs text-blue-600 mt-1">📋 Físico: {cv.examenFisicoNotas}</p>
          )}
          {cv.examenPsicotecnico && cv.examenPsicotecnicoNotas && (
            <p className="text-xs text-green-600 mt-1">📋 Psicotécnico: {cv.examenPsicotecnicoNotas}</p>
          )}

          {/* Historial de estados (colapsable) */}
          {cv.historialEstados && cv.historialEstados.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setShowHistory(v => !v)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <History className="w-3 h-3"/>
                {showHistory ? 'Ocultar historial' : `Ver historial (${cv.historialEstados.length})`}
              </button>
              {showHistory && (
                <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-gray-200 max-h-40 overflow-y-auto">
                  {cv.historialEstados.map((h, i) => (
                    <div key={i} className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{h.estado}</span>
                      {h.motivo && <span className="text-red-600"> — {h.motivo}</span>}
                      <span className="ml-1 text-gray-400">{new Date(h.fecha).toLocaleDateString('es-AR')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========== BOTONES ========== */}
        <div className="flex flex-wrap gap-2 ml-4 justify-end max-w-[260px]">
          {/* Historial */}
          <button onClick={() => onHistorial(cv)} title="Ver trazabilidad" className="px-3 py-2 text-white text-sm rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors">
            <History className="w-4 h-4"/>
          </button>

          {/* Ranking RRHH */}
          {isRRHHTab && (
            <button onClick={() => onRanking(cv, 'RRHH')} title="Puntuar entrevista RRHH" className={`px-3 py-2 text-sm rounded-lg transition-colors font-medium ${tienePuntuacionRRHH ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}>
              <Trophy className="w-4 h-4"/>
            </button>
          )}

          {/* Ranking Área Técnica */}
          {isAreaTecnicaTab && (
            <button onClick={() => onRanking(cv, 'Area Tecnica')} title="Puntuar entrevista Área Técnica" className={`px-3 py-2 text-sm rounded-lg transition-colors font-medium ${tienePuntuacionArea ? 'bg-purple-100 border-purple-400 text-purple-800' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}>
              <Trophy className="w-4 h-4"/>
            </button>
          )}

          {/* Descargar CV */}
          <button onClick={() => onDownload(cv)} title="Descargar CV" className="px-3 py-2 text-white text-sm rounded-lg bg-manzur-primary hover:bg-manzur-secondary transition-colors">
            <Download className="w-4 h-4"/>
          </button>

          {/* Referencias */}
          {isRRHHTab && (
            <button onClick={() => onReferences(cv)} title="Ficha de referencias" className={`px-3 py-2 text-sm rounded-lg border-2 transition-colors font-medium ${cv.referenciasLaborales ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-white border-blue-300 text-blue-600 hover:bg-blue-50'}`}>
              <FileText className="w-4 h-4"/>
            </button>
          )}

          {/* Agendar entrevista */}
          {isInterviewTab && (
            <button onClick={() => onSchedule(isScheduling ? null : cv.id!)} title="Agendar entrevista" className={`px-3 py-2 text-white text-sm rounded-lg transition-colors ${isScheduling ? 'bg-purple-800' : 'bg-purple-600 hover:bg-purple-700'}`}>
              <Calendar className="w-4 h-4"/>
            </button>
          )}

          {/* Enviar mail */}
          {isTerna && (
            <button onClick={() => onSendMail(cv)} title="Enviar email" className="px-3 py-2 text-white text-sm rounded-lg bg-sky-500 hover:bg-sky-600 transition-colors">
              <Mail className="w-4 h-4"/>
            </button>
          )}

          {/* Examen físico */}
          {isTerna && (
            <button onClick={() => onExam(cv, 'fisico')} title="Examen físico" className={`px-3 py-2 text-sm rounded-lg border-2 transition-colors font-medium ${cv.examenFisico ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-white border-blue-300 text-blue-600 hover:bg-blue-50'}`}>
              <FlaskConical className="w-4 h-4"/>
            </button>
          )}

          {/* Examen psicotécnico */}
          {isTerna && (
            <button onClick={() => onExam(cv, 'psicotecnico')} title="Examen psicotécnico" className={`px-3 py-2 text-sm rounded-lg border-2 transition-colors font-medium ${cv.examenPsicotecnico ? 'bg-green-100 border-green-400 text-green-800' : 'bg-white border-green-300 text-green-600 hover:bg-green-50'}`}>
              <Brain className="w-4 h-4"/>
            </button>
          )}

          {/* Gestionar selección - todas excepto seleccionados */}
          {activeTab !== 'seleccionados' && (
            <button onClick={() => { onSchedule(null); onStartSelection(cv.id!); }} title="Gestionar selección" className="px-3 py-2 text-white text-sm rounded-lg bg-green-600 hover:bg-green-700 transition-colors">
              <UserCheck className="w-4 h-4"/>
            </button>
          )}

          {/* Descartar */}
          {(activeTab === 'entrevistaRRHH' || activeTab === 'entrevistaAreaTecnica' || activeTab === 'terna' || activeTab === 'seleccionados') && (
            <button onClick={() => onDiscard(cv)} title="Descartar" className="px-3 py-2 text-white text-sm rounded-lg bg-red-500 hover:bg-red-600 transition-colors">
              <ThumbsDown className="w-4 h-4"/>
            </button>
          )}

          {/* Quitar del proceso */}
          {activeTab !== 'todos' && activeTab !== 'descartados' && (
            <button onClick={() => onQuitProceso(cv)} title="Quitar del proceso" className="px-3 py-2 text-white text-sm rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors">
              <ArrowLeftCircle className="w-4 h-4"/>
            </button>
          )}

          {/* Reactivar */}
          {activeTab === 'descartados' && (
            <button onClick={() => onReactivar(cv)} title="Reactivar" className="px-3 py-2 text-white text-sm rounded-lg bg-amber-500 hover:bg-amber-600 transition-colors flex items-center gap-1">
              <RotateCcw className="w-4 h-4"/>
              <span className="text-xs font-medium">Reactivar</span>
            </button>
          )}

          {/* Eliminar */}
          <button onClick={() => onDelete(cv)} title="Eliminar" className="px-3 py-2 text-white text-sm rounded-lg bg-gray-500 hover:bg-gray-600 transition-colors">
            <Trash2 className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {/* Scheduler inline */}
      {isScheduling && isInterviewTab && (
        <InterviewScheduler cv={cv} label={schedulerLabel} onClose={() => onSchedule(null)} />
      )}

      {/* Editor de selección */}
      {isEditing && (
        <SelectionEditor
          cv={cv}
          availableEstados={getAvailableEstados()}
          onSave={(data) => onSaveSelection(cv.id!, data)}
          onCancel={onCancelSelection}
        />
      )}
    </div>
  );
};