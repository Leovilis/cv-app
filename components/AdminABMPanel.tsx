import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, RefreshCw, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';
import { Area } from '@/lib/types';

// ─── Form de área ─────────────────────────────────────────────────────────────
const AreaForm: React.FC<{
  initial?: Area;
  onSave: (nombre: string, puestos: string[]) => Promise<void>;
  onCancel: () => void;
}> = ({ initial, onSave, onCancel }) => {
  const [nombre, setNombre]         = useState(initial?.nombre || '');
  const [puestos, setPuestos]       = useState<string[]>(initial?.puestos || []);
  const [nuevoPuesto, setNuevoPuesto] = useState('');
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  const addPuesto = () => {
    const p = nuevoPuesto.trim();
    if (!p) return;
    if (puestos.includes(p)) { setError('Ese puesto ya existe en esta área'); return; }
    setPuestos(prev => [...prev, p]);
    setNuevoPuesto('');
    setError('');
  };

  const removePuesto = (idx: number) =>
    setPuestos(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!nombre.trim()) { setError('El nombre del área es requerido'); return; }
    setSaving(true);
    try { await onSave(nombre.trim(), puestos); }
    catch (e: any) { setError(e.message || 'Error al guardar'); setSaving(false); }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
      <h3 className="font-semibold text-manzur-primary">
        {initial ? 'Editar área' : 'Nueva área'}
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del área *</label>
        <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
          placeholder="Ej: Contable"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-manzur-primary"
          disabled={saving}/>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Briefcase className="w-3.5 h-3.5 inline mr-1"/>Puestos del área
        </label>

        {/* Lista de puestos */}
        {puestos.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {puestos.map((p, i) => (
              <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                <span className="flex-1 text-sm text-gray-800">{p}</span>
                <button onClick={() => removePuesto(i)} disabled={saving}
                  className="text-red-400 hover:text-red-600 transition-colors">
                  <X className="w-3.5 h-3.5"/>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Agregar puesto */}
        <div className="flex gap-2">
          <input type="text" value={nuevoPuesto}
            onChange={e => setNuevoPuesto(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPuesto()}
            placeholder="Escribí el nombre del puesto y presioná Enter"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-manzur-primary"
            disabled={saving}/>
          <button onClick={addPuesto} disabled={saving || !nuevoPuesto.trim()}
            className="px-3 py-2 bg-manzur-primary hover:bg-manzur-secondary text-white rounded-lg transition-colors disabled:opacity-40">
            <Plus className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-manzur-primary hover:bg-manzur-secondary rounded-lg transition-colors disabled:opacity-50">
          <Check className="w-4 h-4"/>{saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onCancel} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          <X className="w-4 h-4"/>Cancelar
        </button>
      </div>
    </div>
  );
};

// ─── Main ABM Panel ───────────────────────────────────────────────────────────
export const AdminABMPanel: React.FC = () => {
  const [areas, setAreas]           = useState<Area[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/areas/list');
      const data = await res.json();
      setAreas(data.areas || []);
    } catch { alert('Error al cargar las áreas'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAreas(); }, []);

  const handleCreate = async (nombre: string, puestos: string[]) => {
    const res  = await fetch('/api/areas/manage', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, puestos }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear');
    setShowForm(false);
    fetchAreas();
  };

  const handleEdit = async (nombre: string, puestos: string[]) => {
    if (!editingArea?.id) return;
    const res  = await fetch('/api/areas/manage', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingArea.id, nombre, puestos }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al editar');
    setEditingArea(null);
    fetchAreas();
  };

  const handleDelete = async (area: Area) => {
    if (!confirm(`¿Eliminar el área "${area.nombre}" y todos sus puestos? Esta acción no se puede deshacer.`)) return;
    const res  = await fetch(`/api/areas/manage?id=${area.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) fetchAreas();
    else alert(data.error || 'Error al eliminar');
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-manzur-primary flex items-center gap-2">
            <Briefcase className="w-5 h-5"/>Áreas y Puestos
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestioná las áreas de la empresa y los puestos que pertenecen a cada una.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAreas}
            className="p-2 text-manzur-primary border border-manzur-secondary rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4"/>
          </button>
          <button onClick={() => { setShowForm(v => !v); setEditingArea(null); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${showForm ? 'bg-gray-200 text-gray-700' : 'bg-manzur-primary text-white hover:bg-manzur-secondary'}`}>
            <Plus className="w-4 h-4"/>{showForm ? 'Cancelar' : 'Nueva área'}
          </button>
        </div>
      </div>

      {/* Formulario nueva área */}
      {showForm && !editingArea && (
        <AreaForm onSave={handleCreate} onCancel={() => setShowForm(false)}/>
      )}

      {/* Lista de áreas */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando...</p>
      ) : areas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3"/>
          <p className="text-gray-500 font-medium">No hay áreas creadas</p>
          <p className="text-sm text-gray-400 mt-1">Creá la primera área para empezar a gestionar los puestos.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {areas.map(area => (
            <div key={area.id} className="border border-manzur-secondary rounded-xl overflow-hidden">

              {/* Editando esta área */}
              {editingArea?.id === area.id ? (
                <div className="p-4">
                  <AreaForm initial={area} onSave={handleEdit} onCancel={() => setEditingArea(null)}/>
                </div>
              ) : (
                <>
                  {/* Fila del área */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-white">
                    <button onClick={() => setExpandedId(expandedId === area.id ? null : area.id!)}
                      className="flex-1 flex items-center gap-3 text-left">
                      <div className="w-8 h-8 rounded-lg bg-manzur-primary/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-4 h-4 text-manzur-primary"/>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{area.nombre}</p>
                        <p className="text-xs text-gray-400">
                          {area.puestos.length} puesto{area.puestos.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {expandedId === area.id
                        ? <ChevronUp className="w-4 h-4 text-gray-400 ml-auto"/>
                        : <ChevronDown className="w-4 h-4 text-gray-400 ml-auto"/>}
                    </button>
                    <button onClick={() => { setEditingArea(area); setShowForm(false); }}
                      className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar área">
                      <Pencil className="w-4 h-4"/>
                    </button>
                    <button onClick={() => handleDelete(area)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar área">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>

                  {/* Puestos expandidos */}
                  {expandedId === area.id && (
                    <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                      {area.puestos.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Sin puestos asignados. Editá el área para agregar.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {area.puestos.map((p, i) => (
                            <span key={i}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-right">
        {areas.length} área{areas.length !== 1 ? 's' : ''} · {areas.reduce((acc, a) => acc + a.puestos.length, 0)} puestos en total
      </p>
    </div>
  );
};