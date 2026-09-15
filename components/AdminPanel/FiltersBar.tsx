// components/AdminPanel/FiltersBar.tsx
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { FiltersBarProps } from './types';

const NIVELES_FORMACION = ['Secundario', 'Terciario', 'Universitario', 'Formación Superior'];

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
  onRefresh,
}) => {
  const [areaNames, setAreaNames]                   = useState<string[]>([]);
  const [provincias, setProvincias]                 = useState<{id:string;nombre:string}[]>([]);
  const [departamentos, setDepartamentos]           = useState<{id:string;nombre:string}[]>([]);
  const [loadingDeps, setLoadingDeps]               = useState(false);
  const [selectedProvincia, setSelectedProvincia]   = useState('');
  const [selectedDepartamento, setSelectedDepartamento] = useState('');

  useEffect(() => {
    fetch('/api/areas/list')
      .then(r => r.json())
      .then(d => setAreaNames((d.areas || []).map((a: any) => a.nombre).sort()))
      .catch(() => {});
    fetch('https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre&max=100')
      .then(r => r.json())
      .then(d => setProvincias((d.provincias || []).sort((a: any, b: any) => a.nombre.localeCompare(b.nombre))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedProvincia) {
      setDepartamentos([]);
      setSelectedDepartamento('');
      onResidenciaChange('Todos');
      return;
    }
    setLoadingDeps(true);
    setSelectedDepartamento('');
    const prov = provincias.find(p => p.nombre === selectedProvincia);
    if (!prov) { setLoadingDeps(false); return; }
    fetch(`https://apis.datos.gob.ar/georef/api/departamentos?provincia=${prov.id}&campos=id,nombre&max=200`)
      .then(r => r.json())
      .then(d => setDepartamentos((d.departamentos || []).sort((a: any, b: any) => a.nombre.localeCompare(b.nombre))))
      .catch(() => setDepartamentos([]))
      .finally(() => setLoadingDeps(false));
  }, [selectedProvincia, provincias]);

  const handleProvinciaChange = (nombre: string) => {
    setSelectedProvincia(nombre);
    onResidenciaChange(nombre || 'Todos');
  };

  const handleDepartamentoChange = (nombre: string) => {
    setSelectedDepartamento(nombre);
    onResidenciaChange(nombre ? `${nombre}, ${selectedProvincia}` : selectedProvincia || 'Todos');
  };

  return (
    <div className="flex flex-wrap items-center gap-4">

      {/* Área */}
      <div className="flex items-center gap-2">
        <label className="font-medium text-manzur-primary text-sm">Área:</label>
        <select value={selectedArea} onChange={e => onAreaChange(e.target.value)}
          className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg">
          <option value="Todos">Todas</option>
          {areaNames.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {activeTab === 'todos' && (
        <>
          {/* Formación */}
          <div className="flex items-center gap-2">
            <label className="font-medium text-manzur-primary text-sm">Formación:</label>
            <select value={selectedFormacion} onChange={e => onFormacionChange(e.target.value)}
              className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg">
              <option value="Todos">Todas</option>
              {NIVELES_FORMACION.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Provincia */}
          <div className="flex items-center gap-2">
            <label className="font-medium text-manzur-primary text-sm">Provincia:</label>
            <select value={selectedProvincia} onChange={e => handleProvinciaChange(e.target.value)}
              className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg">
              <option value="">Todas</option>
              {provincias.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
            </select>
          </div>

          {/* Departamento — solo si hay provincia */}
          {selectedProvincia && (
            <div className="flex items-center gap-2">
              <label className="font-medium text-manzur-primary text-sm">Departamento:</label>
              <select value={selectedDepartamento} onChange={e => handleDepartamentoChange(e.target.value)}
                className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg"
                disabled={loadingDeps}>
                <option value="">{loadingDeps ? 'Cargando...' : 'Todos'}</option>
                {departamentos.map(d => <option key={d.id} value={d.nombre}>{d.nombre}</option>)}
              </select>
            </div>
          )}
        </>
      )}

      {/* Puesto */}
      {puestosDisponibles.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="font-medium text-manzur-primary text-sm">Puesto:</label>
          <select value={selectedPuesto} onChange={e => onPuestoChange(e.target.value)}
            className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg max-w-[260px]">
            <option value="Todos">Todos</option>
            {puestosDisponibles.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      )}

      <button onClick={onRefresh}
        className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg bg-manzur-primary hover:bg-manzur-secondary transition-colors ml-auto">
        <RefreshCw className="w-4 h-4"/>Actualizar
      </button>
    </div>
  );
};