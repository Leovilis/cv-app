// components/AdminPanel/FiltersBar.tsx
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { AREAS, NIVELES_FORMACION } from '@/lib/types';
import { FiltersBarProps } from './types';

export const FiltersBar: React.FC<FiltersBarProps> = ({
  activeTab,
  selectedArea,
  onAreaChange,
  selectedFormacion,
  onFormacionChange,
  selectedResidencia,
  onResidenciaChange,
  selectedPuesto,
  onPuestoChange,
  puestosDisponibles,
  lugaresResidencia,
  onRefresh,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="font-medium text-manzur-primary text-sm">Área:</label>
        <select
          value={selectedArea}
          onChange={e => onAreaChange(e.target.value)}
          className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg"
        >
          <option value="Todos">Todas</option>
          {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {activeTab === 'todos' && (
        <>
          <div className="flex items-center gap-2">
            <label className="font-medium text-manzur-primary text-sm">Formación:</label>
            <select
              value={selectedFormacion}
              onChange={e => onFormacionChange(e.target.value)}
              className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg"
            >
              <option value="Todos">Todas</option>
              {NIVELES_FORMACION.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-medium text-manzur-primary text-sm">Residencia:</label>
            <select
              value={selectedResidencia}
              onChange={e => onResidenciaChange(e.target.value)}
              className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg"
            >
              {lugaresResidencia.map(lugar => (
                <option key={lugar} value={lugar}>{lugar}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {activeTab !== 'todos' && puestosDisponibles.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="font-medium text-manzur-primary text-sm">Puesto:</label>
          <select
            value={selectedPuesto}
            onChange={e => onPuestoChange(e.target.value)}
            className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg max-w-[260px]"
          >
            <option value="Todos">Todos</option>
            {puestosDisponibles.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      )}

      <button
        onClick={onRefresh}
        className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg bg-manzur-primary hover:bg-manzur-secondary transition-colors ml-auto"
      >
        <RefreshCw className="w-4 h-4"/>Actualizar
      </button>
    </div>
  );
};