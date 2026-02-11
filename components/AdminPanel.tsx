import React, { useState, useEffect } from 'react';
import { Download, Trash2, RefreshCw, UserCheck, X, Check } from 'lucide-react';
import { CV } from '@/lib/types';

const AREAS = [
  'Auditoría',
  'Contable',
  'Compras',
  'Finanzas',
  'Data Analytics',
  'Sistemas',
  'RRHH Hard y Soft',
  'Calidad',
  'Control Interno',
  'RSE',
  'Genérico'
];

const NIVELES_FORMACION = [
  'Secundario',
  'Terciario',
  'Universitario',
  'Formación Superior'
];

const ESTADOS_SELECCION = [
  'En Curso',
  'Entrevista',
  'Aprobado',
  'Rechazado',
  'Contratado'
];

const PUESTOS = [
  'ADMINISTRATIVO COMERCIAL',
  'ADMINISTRATIVO CONTABLE BEBIDAS',
  'ADMINISTRATIVO CONTABLE SERVICIOS',
  'ADMINISTRATIVO DE FACTURACION',
  'ADMINISTRATIVO FINANZAS',
  'ADMINISTRATIVO IMPUESTOS',
  'ADMINISTRATIVO DE COMPRAS',
  'ANALISTA CONTABLE BEBIDAS',
  'ANALISTA CONTABLE SERVICIOS',
  'ANALISTA CONTROL DE GESTION',
  'ANALISTA DE COSTOS',
  'ANALISTA DE DATOS',
  'ANALISTA DE FINANZAS',
  'ANALISTA DE HABILITACIONES E INOCUIDAD ALIMENTARIA',
  'ANALISTA DE IMPUESTOS',
  'ANALISTA GESTION DE CALIDAD',
  'ANALISTA MARKETING',
  'ANALISTA NOVEDADES RRHH HARD',
  'ANALISTA PLANIF ESTRATEGICA',
  'ANALISTA RRHH HARD',
  'ANALISTA RRHH SOFT',
  'AUDITOR INTERNO DE BEBIDAS',
  'AUDITOR INTERNO PyS',
  'COORDINADOR CONTABLE',
  'COORDINADOR GENERAL',
  'COORDINADOR PLANIFICACION ESTRATEGICA',
  'COORDINADOR SISTEMAS',
  'COORDINADOR AUDITORIA',
  'COORDINADOR FINANZAS',
  'COORDINADOR GESTION DE CALIDAD',
  'COORDINADOR RRHH SOFT',
  'GERENCIA MARKETING',
  'MAESTRANZA',
  'RESPONSABLE AUDITORIA PyS',
  'RESPONSABLE COMPRAS',
  'RESPONSABLE DATA ANALYTICS',
  'RESPONSABLE RRHH HARD',
  'RESPONSABLE RSE',
  'TECNICO INFROMATICO',
  'TESORERO'
].sort();

type TabType = 'todos' | 'seleccionados';

export const AdminPanel: React.FC = () => {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('todos');
  const [selectedArea, setSelectedArea] = useState('Todos');
  const [selectedFormacion, setSelectedFormacion] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [editingCV, setEditingCV] = useState<string | null>(null);
  const [selectionData, setSelectionData] = useState({
    puesto: '',
    estado: 'En Curso',
    notas: ''
  });

  const fetchCVs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedArea !== 'Todos') params.append('area', selectedArea);
      if (selectedFormacion !== 'Todos') params.append('formacion', selectedFormacion);
      
      const url = `/api/cv/list${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setCvs(data.cvs || []);
      } else {
        alert(data.error || 'Error al cargar los CVs');
      }
    } catch (error) {
      alert('Error al cargar los CVs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, [selectedArea, selectedFormacion]);

  const handleDownload = async (cv: CV) => {
    try {
      const response = await fetch(`/api/cv/download?id=${cv.id}`);
      const data = await response.json();
      
      if (response.ok) {
        window.open(data.downloadUrl, '_blank');
      } else {
        alert(data.error || 'Error al descargar el CV');
      }
    } catch (error) {
      alert('Error al descargar el CV');
    }
  };

  const handleDelete = async (cv: CV) => {
    if (!confirm(`¿Está seguro de eliminar el CV de ${cv.nombre} ${cv.apellido} (DNI: ${cv.dni})?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/cv/delete?id=${cv.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('CV eliminado exitosamente');
        fetchCVs();
      } else {
        alert(data.error || 'Error al eliminar el CV');
      }
    } catch (error) {
      alert('Error al eliminar el CV');
    }
  };

  const handleStartSelection = (cvId: string) => {
    setEditingCV(cvId);
    const cv = cvs.find(c => c.id === cvId);
    if (cv && cv.puestoSeleccionado) {
      setSelectionData({
        puesto: cv.puestoSeleccionado || '',
        estado: cv.estadoSeleccion || 'En Curso',
        notas: cv.notasAdmin || ''
      });
    } else {
      setSelectionData({
        puesto: '',
        estado: 'En Curso',
        notas: ''
      });
    }
  };

  const handleSaveSelection = async (cvId: string) => {
    if (!selectionData.puesto.trim()) {
      alert('Debe ingresar el puesto');
      return;
    }

    try {
      const response = await fetch('/api/cv/update-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvId,
          puestoSeleccionado: selectionData.puesto,
          estadoSeleccion: selectionData.estado,
          notasAdmin: selectionData.notas
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Selección guardada exitosamente');
        setEditingCV(null);
        fetchCVs();
      } else {
        alert(data.error || 'Error al guardar la selección');
      }
    } catch (error) {
      alert('Error al guardar la selección');
    }
  };

  const handleCancelSelection = () => {
    setEditingCV(null);
    setSelectionData({ puesto: '', estado: 'En Curso', notas: '' });
  };

  const filteredCvs = cvs.filter(cv => {
    if (activeTab === 'seleccionados') {
      return cv.puestoSeleccionado;
    }
    return true;
  });

  const groupedCvs = filteredCvs.reduce((acc, cv) => {
    const area = cv.area || 'Genérico';
    if (!acc[area]) acc[area] = [];
    acc[area].push(cv);
    return acc;
  }, {} as Record<string, CV[]>);

  return (
    <div className="space-y-6">
      {/* Pestañas */}
      <div className="flex gap-2 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab('todos')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'todos'
              ? 'border-b-2 border-manzur-primary text-manzur-primary'
              : 'text-gray-600 hover:text-manzur-primary'
          }`}
        >
          Todos los CVs
        </button>
        <button
          onClick={() => setActiveTab('seleccionados')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'seleccionados'
              ? 'border-b-2 border-manzur-primary text-manzur-primary'
              : 'text-gray-600 hover:text-manzur-primary'
          }`}
        >
          En Proceso de Selección
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="font-medium text-manzur-primary text-sm">Área:</label>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg"
          >
            <option value="Todos">Todas</option>
            {AREAS.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium text-manzur-primary text-sm">Formación:</label>
          <select
            value={selectedFormacion}
            onChange={(e) => setSelectedFormacion(e.target.value)}
            className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg"
          >
            <option value="Todos">Todas</option>
            {NIVELES_FORMACION.map(nivel => (
              <option key={nivel} value={nivel}>{nivel}</option>
            ))}
          </select>
        </div>
        
        <button
          onClick={fetchCVs}
          className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg bg-manzur-primary hover:bg-manzur-secondary transition-colors ml-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      <div className="text-sm text-manzur-primary">
        Total de CVs: {filteredCvs.length}
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando...</p>
      ) : Object.keys(groupedCvs).length === 0 ? (
        <p className="text-center text-gray-500 py-8">No hay CVs</p>
      ) : (
        Object.entries(groupedCvs).map(([area, areaCvs]) => (
          <div key={area} className="mb-8">
            <h3 className="text-xl font-bold mb-4 pb-2 border-b-2 border-manzur-secondary text-manzur-primary">
              {area} ({areaCvs.length})
            </h3>
            <div className="space-y-3">
              {areaCvs.map(cv => (
                <div 
                  key={cv.id} 
                  className="border border-manzur-secondary rounded-lg hover:shadow-md transition-shadow"
                >
                  {/* Información del CV */}
                  <div className="p-4 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-lg">{cv.nombre} {cv.apellido}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                        <p>DNI: {cv.dni}</p>
                        <p>Teléfono: ({cv.telefonoArea}) {cv.telefonoNumero}</p>
                        <p>Nacimiento: {cv.fechaNacimiento}</p>
                        <p>Formación: {cv.nivelFormacion}</p>
                        <p>Cargado: {new Date(cv.uploadedAt).toLocaleDateString('es-AR')}</p>
                        <p>Por: {cv.uploadedBy}</p>
                      </div>
                      
                      {/* Info de selección si existe */}
                      {cv.puestoSeleccionado && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="font-medium text-blue-900">
                            Puesto: {cv.puestoSeleccionado}
                          </p>
                          <p className="text-sm text-blue-700">
                            Estado: <span className="font-medium">{cv.estadoSeleccion}</span>
                          </p>
                          {cv.notasAdmin && (
                            <p className="text-sm text-blue-700 mt-1">
                              Notas: {cv.notasAdmin}
                            </p>
                          )}
                          {cv.fechaSeleccion && (
                            <p className="text-xs text-blue-600 mt-1">
                              Actualizado: {new Date(cv.fechaSeleccion).toLocaleDateString('es-AR')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleDownload(cv)}
                        className="flex items-center gap-2 px-3 py-2 text-white text-sm rounded-lg bg-manzur-primary hover:bg-manzur-secondary transition-colors"
                        title="Descargar CV"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStartSelection(cv.id!)}
                        className="flex items-center gap-2 px-3 py-2 text-white text-sm rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
                        title="Gestionar selección"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cv)}
                        className="flex items-center gap-2 px-3 py-2 text-white text-sm rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                        title="Eliminar CV"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Modal de edición de selección */}
                  {editingCV === cv.id && (
                    <div className="p-4 border-t border-manzur-secondary bg-gray-50">
                      <h4 className="font-medium text-manzur-primary mb-3">
                        Gestionar Proceso de Selección
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Puesto *
                          </label>
                          <select
                            value={selectionData.puesto}
                            onChange={(e) => setSelectionData({ ...selectionData, puesto: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="">Seleccione un puesto</option>
                            {PUESTOS.map(puesto => (
                              <option key={puesto} value={puesto}>{puesto}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Estado
                          </label>
                          <select
                            value={selectionData.estado}
                            onChange={(e) => setSelectionData({ ...selectionData, estado: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            {ESTADOS_SELECCION.map(estado => (
                              <option key={estado} value={estado}>{estado}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Notas (opcional)
                          </label>
                          <textarea
                            value={selectionData.notas}
                            onChange={(e) => setSelectionData({ ...selectionData, notas: e.target.value })}
                            placeholder="Observaciones sobre el candidato..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveSelection(cv.id!)}
                            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                            Guardar
                          </button>
                          <button
                            onClick={handleCancelSelection}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg bg-gray-200 hover:bg-gray-300"
                          >
                            <X className="w-4 h-4" />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};