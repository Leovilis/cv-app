// components/AdminPanel/SelectionEditor.tsx
import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { AREAS, AREAS_PUESTOS } from '@/lib/types';
import { SelectionEditorProps } from './types';

export const SelectionEditor: React.FC<SelectionEditorProps> = ({ cv, availableEstados, onSave, onCancel }) => {
  const areaInicial = (cv as any).areaAsignada || cv.area || '';
  
  const puestosIniciales = cv.puestoSeleccionado
    ? cv.puestoSeleccionado.split(',').map(p => p.trim()).filter(Boolean)
    : [];

  const [areaSelec, setAreaSelec] = useState(areaInicial);
  const [puestosSelec, setPuestosSelec] = useState<string[]>(puestosIniciales);
  const [estado, setEstado] = useState(cv.estadoSeleccion || availableEstados[0] || 'En Curso');
  const [notas, setNotas] = useState(cv.notasAdmin || '');

  const puestosDeArea = areaSelec ? (AREAS_PUESTOS[areaSelec] || []) : [];

  const togglePuesto = (p: string) =>
    setPuestosSelec(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const handleAreaChange = (nuevaArea: string) => {
    setAreaSelec(nuevaArea);
    setPuestosSelec([]);
  };

  return (
    <div className="p-4 border-t border-manzur-secondary bg-gray-50">
      <h4 className="font-medium text-manzur-primary mb-3">Gestionar Proceso de Selección</h4>
      <div className="space-y-3">
        {/* Área */}
        <div>
          <label className="block text-sm font-medium mb-1">Área *</label>
          <select
            value={areaSelec}
            onChange={e => handleAreaChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Seleccione un área</option>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          {cv.area && !(cv as any).areaAsignada && (
            <p className="text-xs text-gray-400 mt-1">
              Área original del postulante: {cv.area}
            </p>
          )}
        </div>

        {/* Puestos */}
        {areaSelec && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Puesto/s *
              {puestosSelec.length > 0 && (
                <span className="ml-2 text-xs font-normal text-green-700 bg-green-100 border border-green-300 rounded-full px-2 py-0.5">
                  {puestosSelec.length} seleccionado{puestosSelec.length !== 1 ? 's' : ''}
                </span>
              )}
            </label>
            <div className="border border-gray-200 rounded-lg bg-white max-h-48 overflow-y-auto divide-y divide-gray-100">
              {puestosDeArea.map(p => (
                <label
                  key={p}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${puestosSelec.includes(p) ? 'bg-green-50' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={puestosSelec.includes(p)}
                    onChange={() => togglePuesto(p)}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                  <span className={`text-sm ${puestosSelec.includes(p) ? 'font-semibold text-green-800' : 'text-gray-700'}`}>
                    {p}
                  </span>
                </label>
              ))}
            </div>
            {puestosSelec.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">Seleccioná al menos un puesto</p>
            )}
          </div>
        )}

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {availableEstados.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Observaciones sobre el candidato..."
          />
        </div>

        {/* Botones */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (!areaSelec) { alert('Seleccioná un área'); return; }
              if (puestosSelec.length === 0) { alert('Seleccioná al menos un puesto'); return; }
              onSave({
                puesto: puestosSelec.join(', '),
                estado,
                notas,
                area: areaSelec
              });
            }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4"/>Guardar
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            <X className="w-4 h-4"/>Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};