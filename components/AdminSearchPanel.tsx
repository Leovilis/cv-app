// components/AdminSearchPanel.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, Search, MapPin, Briefcase, ChevronRight, Edit2, Check, X } from 'lucide-react';
import { BusquedaActiva, AREAS, AREAS_PUESTOS } from '@/lib/types';

const AdminSearchPanel: React.FC = () => {
  const [busquedas, setBusquedas] = useState<BusquedaActiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ titulo: '', area: '', puesto: '', lugarResidencia: '' });
  const [formErrors, setFormErrors] = useState<Partial<typeof form>>({});

  const fetchBusquedas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/active-searches/list');
      const data = await res.json();
      setBusquedas(data.busquedas || []);
    } catch {
      alert('Error al cargar las búsquedas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBusquedas(); }, []);

  const handleCreate = async () => {
    const errors: Partial<typeof form> = {};
    if (!form.titulo.trim())          errors.titulo = 'El título es requerido';
    if (!form.area.trim())            errors.area = 'El área es requerida';
    if (!form.puesto.trim())          errors.puesto = 'El puesto es requerido';
    if (!form.lugarResidencia.trim()) errors.lugarResidencia = 'El lugar de residencia es requerido';
    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/active-searches/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setForm({ titulo: '', area: '', puesto: '', lugarResidencia: '' });
        setFormErrors({});
        setShowForm(false);
        fetchBusquedas();
      } else {
        alert(data.error || 'Error al crear la búsqueda');
      }
    } catch {
      alert('Error al crear la búsqueda');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (b: BusquedaActiva) => {
    try {
      const res = await fetch('/api/active-searches/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: b.id, activa: !b.activa }),
      });
      if (res.ok) fetchBusquedas();
      else alert('Error al cambiar el estado');
    } catch {
      alert('Error al cambiar el estado');
    }
  };

  const handleDelete = async (b: BusquedaActiva) => {
    if (!confirm(`¿Dar de baja la búsqueda "${b.titulo}"? Ya no aparecerá en el formulario de carga.`)) return;
    try {
      const res = await fetch(`/api/active-searches/manage?id=${b.id}`, { method: 'DELETE' });
      if (res.ok) fetchBusquedas();
      else alert('Error al dar de baja');
    } catch {
      alert('Error al dar de baja la búsqueda');
    }
  };

  const handleEdit = (b: BusquedaActiva) => {
    setEditingId(b.id!);
    setForm({
      titulo: b.titulo,
      area: b.area,
      puesto: b.puesto,
      lugarResidencia: b.lugarResidencia,
    });
    setShowForm(true);
  };

  const handleUpdate = async () => {
    const errors: Partial<typeof form> = {};
    if (!form.titulo.trim())          errors.titulo = 'El título es requerido';
    if (!form.area.trim())            errors.area = 'El área es requerida';
    if (!form.puesto.trim())          errors.puesto = 'El puesto es requerido';
    if (!form.lugarResidencia.trim()) errors.lugarResidencia = 'El lugar de residencia es requerido';
    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/active-searches/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...form }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm({ titulo: '', area: '', puesto: '', lugarResidencia: '' });
        setFormErrors({});
        setShowForm(false);
        setEditingId(null);
        fetchBusquedas();
      } else {
        alert(data.error || 'Error al actualizar la búsqueda');
      }
    } catch {
      alert('Error al actualizar la búsqueda');
    } finally {
      setSaving(false);
    }
  };

  const puestosDisponibles = form.area ? AREAS_PUESTOS[form.area] || [] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-manzur-primary flex items-center gap-2">
            <Search className="w-5 h-5"/>Búsquedas Activas
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Las búsquedas activas aparecen en el formulario de carga de CV para que los postulantes puedan seleccionarlas.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchBusquedas}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-manzur-secondary text-manzur-primary hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4"/>
          </button>
          <button onClick={() => { setShowForm(v => !v); setEditingId(null); setForm({ titulo: '', area: '', puesto: '', lugarResidencia: '' }); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${showForm
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-manzur-primary text-white hover:bg-manzur-secondary'}`}>
            <Plus className="w-4 h-4"/>
            {showForm ? 'Cancelar' : 'Nueva búsqueda'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-manzur-primary">
            {editingId ? 'Editar búsqueda' : 'Nueva búsqueda activa'}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título / Descripción del puesto *
            </label>
            <input type="text"
              value={form.titulo}
              onChange={e => setForm({...form, titulo: e.target.value})}
              placeholder="Ej: Analista Contable — Media jornada"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-manzur-primary"
              disabled={saving}/>
            {formErrors.titulo && <p className="text-red-500 text-xs mt-1">{formErrors.titulo}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Briefcase className="inline w-3.5 h-3.5 mr-1"/>Área *
              </label>
              <select 
                value={form.area} 
                onChange={e => setForm({...form, area: e.target.value, puesto: ''})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-manzur-primary"
                disabled={saving}>
                <option value="">Seleccione un área</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {formErrors.area && <p className="text-red-500 text-xs mt-1">{formErrors.area}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="inline w-3.5 h-3.5 mr-1"/>Lugar de Residencia requerido *
              </label>
              <input type="text" value={form.lugarResidencia}
                onChange={e => setForm({...form, lugarResidencia: e.target.value})}
                placeholder="Ej: Jujuy, Salta o alrededores"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-manzur-primary"
                disabled={saving}/>
              {formErrors.lugarResidencia && <p className="text-red-500 text-xs mt-1">{formErrors.lugarResidencia}</p>}
            </div>
          </div>

          {form.area && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Puesto específico *
              </label>
              {puestosDisponibles.length === 0 ? (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-2">
                  No hay puestos disponibles para esta área.
                </p>
              ) : (
                <select 
                  value={form.puesto} 
                  onChange={e => setForm({...form, puesto: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-manzur-primary"
                  disabled={saving}>
                  <option value="">Seleccione un puesto</option>
                  {puestosDisponibles.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              )}
              {formErrors.puesto && <p className="text-red-500 text-xs mt-1">{formErrors.puesto}</p>}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm({titulo:'',area:'',puesto:'',lugarResidencia:''}); setFormErrors({}); }}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={editingId ? handleUpdate : handleCreate} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-manzur-primary hover:bg-manzur-secondary rounded-lg transition-colors disabled:opacity-50">
              {editingId ? <Check className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
              {saving ? (editingId ? 'Actualizando...' : 'Guardando...') : (editingId ? 'Actualizar' : 'Crear búsqueda')}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando...</p>
      ) : busquedas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Search className="w-10 h-10 text-gray-300 mx-auto mb-3"/>
          <p className="text-gray-500 font-medium">No hay búsquedas activas</p>
          <p className="text-sm text-gray-400 mt-1">Creá una nueva búsqueda para que aparezca en el formulario de carga de CV.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {busquedas.map(b => (
            <div key={b.id}
              className={`flex items-center justify-between p-4 border rounded-xl hover:shadow-sm transition-shadow
                ${b.activa ? 'bg-white border-manzur-secondary' : 'bg-gray-50 border-gray-300 opacity-70'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{b.titulo}</p>
                  {!b.activa && (
                    <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full">Inactiva</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5"/>{b.area}
                  </span>
                  {b.puesto && (
                    <span className="flex items-center gap-1">
                      <ChevronRight className="w-3.5 h-3.5"/>{b.puesto}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5"/>{b.lugarResidencia}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Creada: {new Date(b.creadaAt).toLocaleDateString('es-AR')} por {b.creadaPor}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                    ${b.activa 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'}`}>
                
                  {b.activa ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => handleEdit(b)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5"/>
                </button>
                <button
                  onClick={() => handleDelete(b)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {busquedas.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          {busquedas.filter(b => b.activa).length} activa{busquedas.filter(b => b.activa).length !== 1 ? 's' : ''} | 
          {busquedas.filter(b => !b.activa).length} inactiva{busquedas.filter(b => !b.activa).length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

// ✅ EXPORT DEFAULT - Esto es lo que necesitas
export default AdminSearchPanel;