// components/AdminPanel/HistorialModal.tsx
import React from 'react';
import { History, X, FlaskConical, Brain, Trophy, Calendar, AlertTriangle, RotateCcw } from 'lucide-react';
import { HistorialModalProps } from './types';
import { EXAM_BADGE, RESULTADO_CONFIG } from '@/lib/constants';

export const HistorialModal: React.FC<HistorialModalProps> = ({ cv, onClose }) => {
  const historial = cv.historialEstados || [];
  
  // Datos de exámenes
  const examenFisico = cv.examenFisico ? {
    fecha: cv.examenFisicoFecha,
    resultado: cv.examenFisicoResultado,
    notas: cv.examenFisicoNotas
  } : null;
  
  const examenPsicotecnico = cv.examenPsicotecnico ? {
    fecha: cv.examenPsicotecnicoFecha,
    resultado: cv.examenPsicotecnicoResultado,
    notas: cv.examenPsicotecnicoNotas
  } : null;
  
  // Puntuaciones
  const puntuacionRRHH = (cv as any).puntuacionRRHH;
  const puntuacionAreaTecnica = (cv as any).puntuacionAreaTecnica;
  const fechaEntrevistaRRHH = (cv as any).fechaEntrevistaRRHH;
  const fechaEntrevistaAreaTecnica = (cv as any).fechaEntrevistaAreaTecnica;

  // Mapeo de estados a íconos y colores
  const getInstanciaLabel = (estado: string) => {
    const labels: Record<string, { icon: string; label: string; color: string }> = {
      'En Curso': { icon: '📋', label: 'En Curso', color: 'text-gray-600' },
      'Entrevista RRHH': { icon: '🎯', label: 'Entrevista RRHH', color: 'text-blue-600' },
      'Entrevista Área Técnica': { icon: '🔬', label: 'Entrevista Área Técnica', color: 'text-purple-600' },
      'Terna Preseleccionados': { icon: '⭐', label: 'Terna Preseleccionados', color: 'text-amber-600' },
      'Seleccionado': { icon: '✅', label: 'Seleccionado', color: 'text-green-600' },
      'Descartado': { icon: '❌', label: 'Descartado / No Apto', color: 'text-red-600' },
      'Quitado del Proceso': { icon: '🚫', label: 'Quitado del Proceso', color: 'text-orange-600' },
      'Reactivado': { icon: '🔄', label: 'Reactivado', color: 'text-amber-600' }
    };
    return labels[estado] || { icon: '📌', label: estado, color: 'text-gray-600' };
  };

  // Ordenar historial por fecha descendente (más reciente primero)
  const historialOrdenado = [...historial].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  // Formatear fecha completa (día, mes, año, hora)
  const formatFechaCompleta = (fecha: string | undefined) => {
    if (!fecha) return 'No registrada';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear fecha corta (solo día/mes/año)
  const formatFechaCorta = (fecha: string | undefined) => {
    if (!fecha) return 'No registrada';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatear solo hora
  const formatHora = (fecha: string | undefined) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <History className="w-5 h-5 text-blue-600"/>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Trazabilidad del proceso</h3>
              <p className="text-sm text-gray-500">
                {cv.nombre} {cv.apellido} — DNI: {cv.dni}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          
          {/* ==================== DATOS ACTUALES ==================== */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4"/>
              Situación actual
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Estado:</span>
                <span className={`ml-2 font-medium ${getInstanciaLabel(cv.estadoSeleccion || 'En Curso').color}`}>
                  {getInstanciaLabel(cv.estadoSeleccion || 'En Curso').icon} {cv.estadoSeleccion || 'En Curso'}
                </span>
              </div>
              {cv.puestoSeleccionado && (
                <div>
                  <span className="text-gray-500">Puesto asignado:</span>
                  <span className="ml-2 font-medium text-gray-800">{cv.puestoSeleccionado}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500">Área:</span>
                <span className="ml-2 text-gray-700">{(cv as any).areaAsignada || cv.area || 'No especificada'}</span>
              </div>
              <div>
                <span className="text-gray-500">Formación:</span>
                <span className="ml-2 text-gray-700">{cv.nivelFormacion}</span>
              </div>
              <div>
                <span className="text-gray-500">Fecha de carga:</span>
                <span className="ml-2 text-gray-700">{formatFechaCorta(cv.uploadedAt)}</span>
              </div>
            </div>
            
            {/* Mostrar motivo de descarte anterior si existe */}
            {(cv as any).motivoDescarteAnterior && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                  <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-medium text-orange-700">Descartado anteriormente:</span>
                    <p className="text-sm text-orange-800">{(cv as any).motivoDescarteAnterior}</p>
                    {(cv as any).fechaDescarteAnterior && (
                      <p className="text-xs text-orange-600 mt-1">
                        Fecha: {formatFechaCorta((cv as any).fechaDescarteAnterior)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ==================== PUNTUACIONES ==================== */}
          {(puntuacionRRHH || puntuacionAreaTecnica) && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4"/>
                Puntuaciones obtenidas
              </h4>
              <div className="space-y-2">
                {puntuacionRRHH && (
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm text-gray-700">Entrevista RRHH:</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5,6,7,8,9,10].map(s => (
                          <span key={s} className={`text-sm ${s <= puntuacionRRHH ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                      <span className="font-bold text-amber-700">{puntuacionRRHH}/10</span>
                      {fechaEntrevistaRRHH && (
                        <span className="text-xs text-gray-400">({formatFechaCorta(fechaEntrevistaRRHH)})</span>
                      )}
                    </div>
                  </div>
                )}
                {puntuacionAreaTecnica && (
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm text-gray-700">Entrevista Área Técnica:</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5,6,7,8,9,10].map(s => (
                          <span key={s} className={`text-sm ${s <= puntuacionAreaTecnica ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                      <span className="font-bold text-purple-700">{puntuacionAreaTecnica}/10</span>
                      {fechaEntrevistaAreaTecnica && (
                        <span className="text-xs text-gray-400">({formatFechaCorta(fechaEntrevistaAreaTecnica)})</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== EXÁMENES ==================== */}
          {(examenFisico || examenPsicotecnico) && (
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <h4 className="font-semibold text-teal-800 mb-3 flex items-center gap-2">
                <FlaskConical className="w-4 h-4"/>
                Exámenes realizados
              </h4>
              <div className="space-y-3">
                {examenFisico && (
                  <div className="border-b border-teal-100 pb-2 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Examen Físico</span>
                      <span className="text-xs text-gray-400">{formatFechaCorta(examenFisico.fecha)}</span>
                    </div>
                    {examenFisico.resultado && (
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${RESULTADO_CONFIG[examenFisico.resultado]?.bg} ${RESULTADO_CONFIG[examenFisico.resultado]?.border} ${RESULTADO_CONFIG[examenFisico.resultado]?.text}`}>
                        {RESULTADO_CONFIG[examenFisico.resultado]?.icon} {examenFisico.resultado}
                      </div>
                    )}
                    {examenFisico.notas && (
                      <p className="text-xs text-gray-500 mt-1">{examenFisico.notas}</p>
                    )}
                  </div>
                )}
                {examenPsicotecnico && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Examen Psicotécnico</span>
                      <span className="text-xs text-gray-400">{formatFechaCorta(examenPsicotecnico.fecha)}</span>
                    </div>
                    {examenPsicotecnico.resultado && (
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${RESULTADO_CONFIG[examenPsicotecnico.resultado]?.bg} ${RESULTADO_CONFIG[examenPsicotecnico.resultado]?.border} ${RESULTADO_CONFIG[examenPsicotecnico.resultado]?.text}`}>
                        {RESULTADO_CONFIG[examenPsicotecnico.resultado]?.icon} {examenPsicotecnico.resultado}
                      </div>
                    )}
                    {examenPsicotecnico.notas && (
                      <p className="text-xs text-gray-500 mt-1">{examenPsicotecnico.notas}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== LÍNEA DE TIEMPO ==================== */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <History className="w-4 h-4"/>
              Línea de tiempo del proceso
            </h4>
            
            {historialOrdenado.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay registro de actividad aún</p>
            ) : (
              <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
                {historialOrdenado.map((item, idx) => {
                  const instancia = getInstanciaLabel(item.estado);
                  const esDescartado = item.estado === 'Descartado' || item.estado === 'Quitado del Proceso';
                  const esReactivado = item.estado === 'Reactivado';
                  
                  return (
                    <div key={idx} className="relative">
                      {/* Marcador temporal */}
                      <div className={`absolute -left-[29px] top-0 w-4 h-4 rounded-full border-2 border-white 
                        ${esDescartado ? 'bg-red-500' : esReactivado ? 'bg-amber-500' : 'bg-blue-500'}`}>
                      </div>
                      
                      <div className={`rounded-lg p-4 ${
                        esDescartado ? 'bg-red-50' : 
                        esReactivado ? 'bg-amber-50' : 
                        'bg-gray-50'
                      }`}>
                        {/* Cabecera con fecha y hora */}
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-lg ${instancia.color}`}>{instancia.icon}</span>
                            <span className={`font-semibold ${instancia.color}`}>{instancia.label}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500 block font-medium">
                              {formatFechaCompleta(item.fecha)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Motivo para descartes */}
                        {item.motivo && (esDescartado || item.estado === 'Reactivado') && (
                          <div className={`mb-3 p-2 rounded-lg border ${
                            esDescartado ? 'bg-red-100 border-red-200' : 'bg-amber-100 border-amber-200'
                          }`}>
                            <div className="flex items-start gap-2">
                              {esDescartado ? (
                                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"/>
                              ) : (
                                <RotateCcw className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"/>
                              )}
                              <div>
                                <span className={`text-xs font-medium ${esDescartado ? 'text-red-700' : 'text-amber-700'}`}>
                                  {esDescartado ? 'Motivo de descarte:' : 'Información de reactivación:'}
                                </span>
                                <p className={`text-sm ${esDescartado ? 'text-red-800' : 'text-amber-800'}`}>{item.motivo}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Mostrar motivo de Quitado del Proceso */}
                        {item.estado === 'Quitado del Proceso' && item.motivo && (
                          <div className="mb-3 p-2 bg-orange-100 rounded-lg border border-orange-200">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5"/>
                              <div>
                                <span className="text-xs font-medium text-orange-700">Motivo de salida:</span>
                                <p className="text-sm text-orange-800">{item.motivo}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Observaciones */}
                        {item.notas && (
                          <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                            <span className="text-xs text-gray-500 block mb-1">Observaciones:</span>
                            <p className="text-sm text-gray-700">{item.notas}</p>
                          </div>
                        )}
                        
                        {/* Quién realizó la acción */}
                        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                          <span>👤 Realizado por:</span>
                          <span className="font-medium">{item.realizadoPor || 'Sistema'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};