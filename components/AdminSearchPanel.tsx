// components/AdminSearchPanel.tsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  Search,
  MapPin,
  Briefcase,
  ChevronRight,
  Edit2,
  Check,
  X,
  FileText,
  Eye,
  ListChecks,
  Gift,
} from "lucide-react";
import { BusquedaActiva, AREAS, AREAS_PUESTOS } from "@/lib/types";
import { PuestoModal } from "./PuestoModal";

const AdminSearchPanel: React.FC = () => {
  const [busquedas, setBusquedas] = useState<BusquedaActiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPuestoModal, setShowPuestoModal] = useState<BusquedaActiva | null>(
    null,
  );
  const [showPreviewModal, setShowPreviewModal] =
    useState<BusquedaActiva | null>(null);
  const [form, setForm] = useState({
    titulo: "",
    area: "",
    puesto: "",
    lugarResidencia: "",
    acercaDelPuesto: "",
    requisitos: "",
    beneficios: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<typeof form>>({});

  const fetchBusquedas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/active-searches/list");
      const data = await res.json();
      setBusquedas(data.busquedas || []);
    } catch {
      alert("Error al cargar las búsquedas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusquedas();
  }, []);

  const handleCreate = async () => {
    const errors: Partial<typeof form> = {};
    if (!form.titulo.trim()) errors.titulo = "El título es requerido";
    if (!form.area.trim()) errors.area = "El área es requerida";
    if (!form.puesto.trim()) errors.puesto = "El puesto es requerido";
    if (!form.lugarResidencia.trim())
      errors.lugarResidencia = "El lugar de residencia es requerido";
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/active-searches/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          area: form.area,
          puesto: form.puesto,
          lugarResidencia: form.lugarResidencia,
          acercaDelPuesto: form.acercaDelPuesto || "",
          requisitos: form.requisitos || "",
          beneficios: form.beneficios || "",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm({
          titulo: "",
          area: "",
          puesto: "",
          lugarResidencia: "",
          acercaDelPuesto: "",
          requisitos: "",
          beneficios: "",
        });
        setFormErrors({});
        setShowForm(false);
        fetchBusquedas();
      } else {
        alert(data.error || "Error al crear la búsqueda");
      }
    } catch {
      alert("Error al crear la búsqueda");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (b: BusquedaActiva) => {
    try {
      const res = await fetch("/api/active-searches/manage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: b.id, activa: !b.activa }),
      });
      if (res.ok) fetchBusquedas();
      else alert("Error al cambiar el estado");
    } catch {
      alert("Error al cambiar el estado");
    }
  };

  const handleDelete = async (b: BusquedaActiva) => {
    if (
      !confirm(
        `¿Eliminar permanentemente la búsqueda "${b.titulo}"?\n\nEsta acción no se puede deshacer.`,
      )
    )
      return;

    try {
      const res = await fetch(`/api/active-searches/manage?id=${b.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("✅ Búsqueda eliminada permanentemente");
        fetchBusquedas();
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar la búsqueda");
      }
    } catch {
      alert("Error al eliminar la búsqueda");
    }
  };

  const handleEdit = (b: BusquedaActiva) => {
    setEditingId(b.id!);
    setForm({
      titulo: b.titulo,
      area: b.area,
      puesto: b.puesto,
      lugarResidencia: b.lugarResidencia,
      acercaDelPuesto: b.acercaDelPuesto || "",
      requisitos: b.requisitos || "",
      beneficios: b.beneficios || "",
    });
    setShowForm(true);
  };

  const handleUpdate = async () => {
    const errors: Partial<typeof form> = {};
    if (!form.titulo.trim()) errors.titulo = "El título es requerido";
    if (!form.area.trim()) errors.area = "El área es requerida";
    if (!form.puesto.trim()) errors.puesto = "El puesto es requerido";
    if (!form.lugarResidencia.trim())
      errors.lugarResidencia = "El lugar de residencia es requerido";
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/active-searches/manage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          titulo: form.titulo,
          area: form.area,
          puesto: form.puesto,
          lugarResidencia: form.lugarResidencia,
          acercaDelPuesto: form.acercaDelPuesto || "",
          requisitos: form.requisitos || "",
          beneficios: form.beneficios || "",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm({
          titulo: "",
          area: "",
          puesto: "",
          lugarResidencia: "",
          acercaDelPuesto: "",
          requisitos: "",
          beneficios: "",
        });
        setFormErrors({});
        setShowForm(false);
        setEditingId(null);
        fetchBusquedas();
      } else {
        alert(data.error || "Error al actualizar la búsqueda");
      }
    } catch {
      alert("Error al actualizar la búsqueda");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePuestoInfo = async (
    id: string,
    data: { acercaDelPuesto: string; requisitos: string; beneficios: string },
  ) => {
    try {
      const res = await fetch("/api/active-searches/manage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });

      if (res.ok) {
        await fetchBusquedas();
        alert("✅ Información del puesto guardada exitosamente");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error al guardar la información");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar la información");
    }
  };

  const puestosDisponibles = form.area ? AREAS_PUESTOS[form.area] || [] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-manzur-primary flex items-center gap-2">
            <Search className="w-5 h-5" />
            Búsquedas Activas
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Las búsquedas activas aparecen en el formulario de carga de CV para
            que los postulantes puedan seleccionarlas.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchBusquedas}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-manzur-secondary text-manzur-primary hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setShowForm((v) => !v);
              setEditingId(null);
              setForm({
                titulo: "",
                area: "",
                puesto: "",
                lugarResidencia: "",
                acercaDelPuesto: "",
                requisitos: "",
                beneficios: "",
              });
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${
                showForm
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-manzur-primary text-white hover:bg-manzur-secondary"
              }`}
          >
            <Plus className="w-4 h-4" />
            {showForm ? "Cancelar" : "Nueva búsqueda"}
          </button>
        </div>
      </div>

      {/* Formulario de nueva búsqueda / edición */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-manzur-primary">
            {editingId ? "Editar búsqueda" : "Nueva búsqueda activa"}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título / Descripción del puesto *
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ej: Analista Contable — Media jornada"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-manzur-primary"
              disabled={saving}
            />
            {formErrors.titulo && (
              <p className="text-red-500 text-xs mt-1">{formErrors.titulo}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Briefcase className="inline w-3.5 h-3.5 mr-1" />
                Área *
              </label>
              <select
                value={form.area}
                onChange={(e) =>
                  setForm({ ...form, area: e.target.value, puesto: "" })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-manzur-primary"
                disabled={saving}
              >
                <option value="">Seleccione un área</option>
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {formErrors.area && (
                <p className="text-red-500 text-xs mt-1">{formErrors.area}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="inline w-3.5 h-3.5 mr-1" />
                Lugar de Residencia requerido *
              </label>
              <input
                type="text"
                value={form.lugarResidencia}
                onChange={(e) =>
                  setForm({ ...form, lugarResidencia: e.target.value })
                }
                placeholder="Ej: Jujuy, Salta o alrededores"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-manzur-primary"
                disabled={saving}
              />
              {formErrors.lugarResidencia && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.lugarResidencia}
                </p>
              )}
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
                  onChange={(e) => setForm({ ...form, puesto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-manzur-primary"
                  disabled={saving}
                >
                  <option value="">Seleccione un puesto</option>
                  {[...puestosDisponibles].sort().map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              )}
              {formErrors.puesto && (
                <p className="text-red-500 text-xs mt-1">{formErrors.puesto}</p>
              )}
            </div>
          )}

          {/* Sección "Acerca del Puesto" - siempre visible en el formulario */}
          <div className="border-t border-blue-200 pt-4 mt-2">
            <h4 className="font-medium text-manzur-primary mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Información detallada del puesto (visible para postulantes)
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del puesto
                </label>
                <textarea
                  value={form.acercaDelPuesto}
                  onChange={(e) =>
                    setForm({ ...form, acercaDelPuesto: e.target.value })
                  }
                  rows={3}
                  placeholder="Describa las responsabilidades, tareas diarias, objetivos del puesto..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-manzur-primary resize-none"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Principales responsabilidades
                </label>
                <textarea
                  value={form.beneficios}
                  onChange={(e) =>
                    setForm({ ...form, beneficios: e.target.value })
                  }
                  rows={2}
                  placeholder="• Obra social&#10;• Vacaciones pagas&#10;• Horario flexible"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-manzur-primary resize-none"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requisitos del puesto
                </label>
                <textarea
                  value={form.requisitos}
                  onChange={(e) =>
                    setForm({ ...form, requisitos: e.target.value })
                  }
                  rows={3}
                  placeholder="• Formación requerida&#10;• Experiencia mínima&#10;• Conocimientos específicos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-manzur-primary resize-none"
                  disabled={saving}
                />
              </div>

              {/* Botón de previsualización */}
              {(form.acercaDelPuesto || form.requisitos || form.beneficios) && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewModal({
                      id: "preview",
                      titulo: form.titulo || "Vista previa",
                      area: form.area,
                      puesto: form.puesto,
                      lugarResidencia: form.lugarResidencia,
                      acercaDelPuesto: form.acercaDelPuesto,
                      requisitos: form.requisitos,
                      beneficios: form.beneficios,
                      creadaPor: "",
                      creadaAt: new Date().toISOString(),
                      activa: true,
                    } as BusquedaActiva);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Previsualizar cómo lo ven los postulantes
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm({
                  titulo: "",
                  area: "",
                  puesto: "",
                  lugarResidencia: "",
                  acercaDelPuesto: "",
                  requisitos: "",
                  beneficios: "",
                });
                setFormErrors({});
              }}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={editingId ? handleUpdate : handleCreate}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-manzur-primary hover:bg-manzur-secondary rounded-lg transition-colors disabled:opacity-50"
            >
              {editingId ? (
                <Check className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {saving
                ? editingId
                  ? "Actualizando..."
                  : "Guardando..."
                : editingId
                  ? "Actualizar"
                  : "Crear búsqueda"}
            </button>
          </div>
        </div>
      )}

      {/* Lista de búsquedas */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando...</p>
      ) : busquedas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay búsquedas activas</p>
          <p className="text-sm text-gray-400 mt-1">
            Creá una nueva búsqueda para que aparezca en el formulario de carga
            de CV.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {busquedas.map((b) => (
            <div
              key={b.id}
              className={`flex items-center justify-between p-4 border rounded-xl hover:shadow-sm transition-shadow
                ${b.activa ? "bg-white border-manzur-secondary" : "bg-gray-50 border-gray-300 opacity-70"}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{b.titulo}</p>
                  {!b.activa && (
                    <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full">
                      Inactiva
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {b.area}
                  </span>
                  {b.puesto && (
                    <span className="flex items-center gap-1">
                      <ChevronRight className="w-3.5 h-3.5" />
                      {b.puesto}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {b.lugarResidencia}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Creada: {new Date(b.creadaAt).toLocaleDateString("es-AR")} por{" "}
                  {b.creadaPor}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => setShowPreviewModal(b)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300 transition-colors"
                  title="Ver información del puesto"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowPuestoModal(b)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-300 transition-colors"
                  title="Editar información del puesto"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                    ${
                      b.activa
                        ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
                        : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
                    }`}
                >
                  {b.activa ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => handleEdit(b)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(b)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {busquedas.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          {busquedas.filter((b) => b.activa).length} activa
          {busquedas.filter((b) => b.activa).length !== 1 ? "s" : ""} |
          {busquedas.filter((b) => !b.activa).length} inactiva
          {busquedas.filter((b) => !b.activa).length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Modal para editar información del puesto */}
      {showPuestoModal && (
        <PuestoModal
          busqueda={showPuestoModal}
          onSave={(data) => handleSavePuestoInfo(showPuestoModal.id!, data)}
          onClose={() => setShowPuestoModal(null)}
        />
      )}

      {/* Modal de previsualización para postulantes */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-manzur-primary/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-manzur-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Vista previa para postulantes
                  </h3>
                  <p className="text-sm text-gray-500">
                    {showPreviewModal.titulo} - {showPreviewModal.area} /{" "}
                    {showPreviewModal.puesto}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-manzur-primary" />
                  <span className="text-sm">
                    Ubicación:{" "}
                    <strong>{showPreviewModal.lugarResidencia}</strong>
                  </span>
                </div>
              </div>

              {showPreviewModal.acercaDelPuesto && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-manzur-primary" />
                    Sobre el puesto
                  </h4>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
                    {showPreviewModal.acercaDelPuesto}
                  </div>
                </div>
              )}
              {showPreviewModal.beneficios && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-manzur-primary" />
                    Principales responsabilidades
                  </h4>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
                    {showPreviewModal.beneficios}
                  </div>
                </div>
              )}
              {showPreviewModal.requisitos && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-manzur-primary" />
                    Requisitos
                  </h4>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
                    {showPreviewModal.requisitos}
                  </div>
                </div>
              )}

              {!showPreviewModal.acercaDelPuesto &&
                !showPreviewModal.requisitos &&
                !showPreviewModal.beneficios && (
                  <div className="text-center py-8 text-gray-500">
                    <p>
                      No hay información detallada disponible para este puesto.
                    </p>
                    <p className="text-sm mt-1">
                      Puede editar la búsqueda para agregar esta información.
                    </p>
                  </div>
                )}
            </div>

            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => setShowPreviewModal(null)}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Necesitas importar ListChecks y Gift en los imports
// Asegúrate de tenerlos:
// import { ListChecks, Gift } from "lucide-react";

export default AdminSearchPanel;
