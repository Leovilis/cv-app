import React, { useState, useEffect } from 'react';
import {
  Download, Trash2, RefreshCw, UserCheck, X, Check,
  Calendar, Video, ArrowLeftCircle, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';
import { CV } from '@/lib/types';

const AREAS = [
  'Auditoría', 'Contable', 'Compras', 'Finanzas', 'Data Analytics',
  'Sistemas', 'RRHH Hard y Soft', 'Calidad', 'Control Interno', 'RSE', 'Genérico'
];

const NIVELES_FORMACION = ['Secundario', 'Terciario', 'Universitario', 'Formación Superior'];

const ESTADOS_SELECCION = ['En Curso', 'Entrevista', 'Aprobado', 'Rechazado', 'Contratado'];

const PUESTOS = [
  'ADMINISTRATIVO COMERCIAL', 'ADMINISTRATIVO CONTABLE BEBIDAS', 'ADMINISTRATIVO CONTABLE SERVICIOS',
  'ADMINISTRATIVO DE FACTURACION', 'ADMINISTRATIVO FINANZAS', 'ADMINISTRATIVO IMPUESTOS',
  'ADMINISTRATIVO DE COMPRAS', 'ANALISTA CONTABLE BEBIDAS', 'ANALISTA CONTABLE SERVICIOS',
  'ANALISTA CONTROL DE GESTION', 'ANALISTA DE COSTOS', 'ANALISTA DE DATOS', 'ANALISTA DE FINANZAS',
  'ANALISTA DE HABILITACIONES E INOCUIDAD ALIMENTARIA', 'ANALISTA DE IMPUESTOS',
  'ANALISTA GESTION DE CALIDAD', 'ANALISTA MARKETING', 'ANALISTA NOVEDADES RRHH HARD',
  'ANALISTA PLANIF ESTRATEGICA', 'ANALISTA RRHH HARD', 'ANALISTA RRHH SOFT',
  'AUDITOR INTERNO DE BEBIDAS', 'AUDITOR INTERNO PyS', 'COORDINADOR CONTABLE',
  'COORDINADOR GENERAL', 'COORDINADOR PLANIFICACION ESTRATEGICA', 'COORDINADOR SISTEMAS',
  'COORDINADOR AUDITORIA', 'COORDINADOR FINANZAS', 'COORDINADOR GESTION DE CALIDAD',
  'COORDINADOR RRHH SOFT', 'GERENCIA MARKETING', 'MAESTRANZA', 'RESPONSABLE AUDITORIA PyS',
  'RESPONSABLE COMPRAS', 'RESPONSABLE DATA ANALYTICS', 'RESPONSABLE RRHH HARD',
  'RESPONSABLE RSE', 'TECNICO INFROMATICO', 'TESORERO'
].sort();

type TabType = 'todos' | 'seleccionados' | 'entrevistar';

// ─── Mini Calendar Component ──────────────────────────────────────────────────

interface MeetingData {
  date: string;      // ISO date string YYYY-MM-DD
  time: string;      // HH:MM
  platform: 'meet' | 'zoom' | 'teams';
  notes: string;
}

const PLATFORM_CONFIG = {
  meet: {
    label: 'Google Meet',
    color: 'bg-green-600 hover:bg-green-700',
    urlBase: 'https://meet.google.com/new',
    icon: '🎥',
  },
  zoom: {
    label: 'Zoom',
    color: 'bg-blue-600 hover:bg-blue-700',
    urlBase: 'https://zoom.us/start/videomeeting',
    icon: '📹',
  },
  teams: {
    label: 'Teams',
    color: 'bg-purple-600 hover:bg-purple-700',
    urlBase: 'https://teams.microsoft.com/l/meeting/new',
    icon: '💼',
  },
};

const InterviewScheduler: React.FC<{ cv: CV; onClose: () => void }> = ({ cv, onClose }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [meeting, setMeeting] = useState<MeetingData>({
    date: '',
    time: '10:00',
    platform: 'meet',
    notes: '',
  });
  const [scheduled, setScheduled] = useState(false);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const monthNames = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];
  const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDate = (day: number) => {
    const d = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    setMeeting(m => ({ ...m, date: d }));
  };

  const isToday = (day: number) => {
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
  };

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0,0,0,0);
    const t = new Date(); t.setHours(0,0,0,0);
    return d < t;
  };

  const selectedDateStr = meeting.date
    ? new Date(meeting.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    : null;

  const buildMeetingUrl = () => {
    const cfg = PLATFORM_CONFIG[meeting.platform];
    if (meeting.platform === 'meet') return cfg.urlBase;
    if (meeting.platform === 'zoom') return cfg.urlBase;
    // Teams deep link
    const subject = encodeURIComponent(`Entrevista ${cv.nombre} ${cv.apellido} - ${cv.puestoSeleccionado}`);
    return `https://teams.microsoft.com/l/meeting/new?subject=${subject}`;
  };

  const handleSchedule = () => {
    if (!meeting.date || !meeting.time) return;
    setScheduled(true);
    window.open(buildMeetingUrl(), '_blank');
  };

  return (
    <div className="p-5 border-t border-purple-200 bg-purple-50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-purple-900 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Agendar Entrevista — {cv.nombre} {cv.apellido}
        </h4>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {scheduled ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-semibold text-purple-900">¡Reunión iniciada!</p>
          <p className="text-sm text-gray-600 mt-1">
            {selectedDateStr} a las {meeting.time} hs — {PLATFORM_CONFIG[meeting.platform].label}
          </p>
          <button
            onClick={() => setScheduled(false)}
            className="mt-4 text-sm text-purple-700 underline"
          >
            Volver al calendario
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendario */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="p-1 rounded hover:bg-purple-200 transition-colors">
                <ChevronLeft className="w-4 h-4 text-purple-700" />
              </button>
              <span className="font-semibold text-purple-900 text-sm">
                {monthNames[viewMonth]} {viewYear}
              </span>
              <button onClick={nextMonth} className="p-1 rounded hover:bg-purple-200 transition-colors">
                <ChevronRight className="w-4 h-4 text-purple-700" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {dayNames.map(d => (
                <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const isSelected = meeting.date === dateStr;
                const past = isPast(day);
                return (
                  <button
                    key={day}
                    disabled={past}
                    onClick={() => selectDate(day)}
                    className={`
                      text-xs py-1.5 rounded transition-colors
                      ${past ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-purple-200 cursor-pointer'}
                      ${isToday(day) && !isSelected ? 'ring-1 ring-purple-400 font-bold' : ''}
                      ${isSelected ? 'bg-purple-600 text-white font-bold' : 'text-gray-700'}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {meeting.date && (
              <p className="mt-2 text-xs text-purple-700 capitalize">{selectedDateStr}</p>
            )}
          </div>

          {/* Opciones */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <Clock className="w-3 h-3 inline mr-1" />Horario
              </label>
              <input
                type="time"
                value={meeting.time}
                onChange={e => setMeeting(m => ({ ...m, time: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <Video className="w-3 h-3 inline mr-1" />Plataforma
              </label>
              <div className="flex gap-2">
                {(Object.keys(PLATFORM_CONFIG) as Array<keyof typeof PLATFORM_CONFIG>).map(key => (
                  <button
                    key={key}
                    onClick={() => setMeeting(m => ({ ...m, platform: key }))}
                    className={`
                      flex-1 py-2 px-2 rounded-lg text-xs font-medium border-2 transition-all
                      ${meeting.platform === key
                        ? 'border-purple-600 bg-purple-100 text-purple-900'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'}
                    `}
                  >
                    {PLATFORM_CONFIG[key].icon} {PLATFORM_CONFIG[key].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Notas internas (opcional)</label>
              <textarea
                value={meeting.notes}
                onChange={e => setMeeting(m => ({ ...m, notes: e.target.value }))}
                rows={2}
                placeholder="Temas a tratar, links, etc."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              />
            </div>

            <button
              onClick={handleSchedule}
              disabled={!meeting.date || !meeting.time}
              className={`
                w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all
                ${meeting.date && meeting.time
                  ? `${PLATFORM_CONFIG[meeting.platform].color} shadow-md hover:shadow-lg`
                  : 'bg-gray-300 cursor-not-allowed'}
              `}
            >
              <Video className="w-4 h-4" />
              Crear reunión en {PLATFORM_CONFIG[meeting.platform].label}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main AdminPanel ───────────────────────────────────────────────────────────

export const AdminPanel: React.FC = () => {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('todos');
  const [selectedArea, setSelectedArea] = useState('Todos');
  const [selectedFormacion, setSelectedFormacion] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [editingCV, setEditingCV] = useState<string | null>(null);
  const [schedulingCV, setSchedulingCV] = useState<string | null>(null);
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
    } catch {
      alert('Error al cargar los CVs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCVs(); }, [selectedArea, selectedFormacion]);

  const handleDownload = async (cv: CV) => {
    try {
      const response = await fetch(`/api/cv/download?id=${cv.id}`);
      const data = await response.json();
      if (response.ok) window.open(data.downloadUrl, '_blank');
      else alert(data.error || 'Error al descargar el CV');
    } catch {
      alert('Error al descargar el CV');
    }
  };

  const handleDelete = async (cv: CV) => {
    if (!confirm(`¿Está seguro de eliminar el CV de ${cv.nombre} ${cv.apellido} (DNI: ${cv.dni})?`)) return;
    try {
      const response = await fetch(`/api/cv/delete?id=${cv.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (response.ok) { alert('CV eliminado exitosamente'); fetchCVs(); }
      else alert(data.error || 'Error al eliminar el CV');
    } catch {
      alert('Error al eliminar el CV');
    }
  };

  const handleStartSelection = (cvId: string) => {
    setEditingCV(cvId);
    setSchedulingCV(null);
    const cv = cvs.find(c => c.id === cvId);
    setSelectionData({
      puesto: cv?.puestoSeleccionado || '',
      estado: cv?.estadoSeleccion || 'En Curso',
      notas: cv?.notasAdmin || ''
    });
  };

  const handleSaveSelection = async (cvId: string) => {
    if (!selectionData.puesto.trim()) { alert('Debe ingresar el puesto'); return; }
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
        setEditingCV(null);
        fetchCVs();
      } else {
        alert(data.error || 'Error al guardar la selección');
      }
    } catch {
      alert('Error al guardar la selección');
    }
  };

  // Quita un CV del proceso de selección: borra puestoSeleccionado y estadoSeleccion
  const handleRemoveFromSelection = async (cv: CV) => {
    if (!confirm(`¿Quitar a ${cv.nombre} ${cv.apellido} del proceso de selección? Volverá a la lista general.`)) return;
    try {
      const response = await fetch('/api/cv/update-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvId: cv.id,
          puestoSeleccionado: '',
          estadoSeleccion: '',
          notasAdmin: ''
        }),
      });
      const data = await response.json();
      if (response.ok) fetchCVs();
      else alert(data.error || 'Error al actualizar');
    } catch {
      alert('Error al actualizar');
    }
  };

  // ─── Filtered sets ───────────────────────────────────────────────────────────
  // Apply area/formacion filters first
  const applyBaseFilters = (list: CV[]) =>
    list.filter(cv => {
      if (selectedArea !== 'Todos' && cv.area !== selectedArea) return false;
      if (selectedFormacion !== 'Todos' && cv.nivelFormacion !== selectedFormacion) return false;
      return true;
    });

  const allCvs      = applyBaseFilters(cvs.filter(cv => !cv.puestoSeleccionado));
  const inProcess   = applyBaseFilters(cvs.filter(cv => cv.puestoSeleccionado && cv.estadoSeleccion !== 'Entrevista'));
  const toInterview = applyBaseFilters(cvs.filter(cv => cv.estadoSeleccion === 'Entrevista'));

  const displayCvs =
    activeTab === 'todos'       ? allCvs :
    activeTab === 'seleccionados' ? inProcess : toInterview;

  const groupedCvs = displayCvs.reduce((acc, cv) => {
    const area = cv.area || 'Genérico';
    if (!acc[area]) acc[area] = [];
    acc[area].push(cv);
    return acc;
  }, {} as Record<string, CV[]>);

  // ─── Tab button ──────────────────────────────────────────────────────────────
  const TabButton: React.FC<{
    tab: TabType;
    label: string;
    count: number;
    accentClass: string;
  }> = ({ tab, label, count, accentClass }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`relative px-6 py-3 font-medium transition-colors text-sm ${
        activeTab === tab
          ? `border-b-2 ${accentClass} text-manzur-primary`
          : 'text-gray-500 hover:text-manzur-primary'
      }`}
    >
      {label}
      <span className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs text-white ${
        activeTab === tab ? 'bg-manzur-primary' : 'bg-gray-400'
      }`}>
        {count}
      </span>
    </button>
  );

  // ─── CV Card ─────────────────────────────────────────────────────────────────
  const CVCard: React.FC<{ cv: CV }> = ({ cv }) => {
    const isEditing  = editingCV === cv.id;
    const isScheduling = schedulingCV === cv.id;

    return (
      <div className="border border-manzur-secondary rounded-lg hover:shadow-md transition-shadow">
        {/* Info row */}
        <div className="p-4 flex items-start justify-between">
          <div className="flex-1">
            <p className="font-semibold text-lg">{cv.nombre} {cv.apellido}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
              <p>DNI: {cv.dni}</p>
              <p>Teléfono: ({cv.telefonoArea}) {cv.telefonoNumero}</p>
              <p>Nacimiento: {cv.fechaNacimiento}</p>
              <p>Formación: {cv.nivelFormacion}</p>
              <p>Cargado: {new Date(cv.uploadedAt).toLocaleDateString('es-AR')}</p>
              <p>Por: {cv.uploadedBy}</p>
            </div>

            {cv.puestoSeleccionado && (
              <div className={`mt-3 p-3 rounded-lg border ${
                cv.estadoSeleccion === 'Entrevista'
                  ? 'bg-purple-50 border-purple-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className={`font-medium ${cv.estadoSeleccion === 'Entrevista' ? 'text-purple-900' : 'text-blue-900'}`}>
                  Puesto: {cv.puestoSeleccionado}
                </p>
                <p className={`text-sm ${cv.estadoSeleccion === 'Entrevista' ? 'text-purple-700' : 'text-blue-700'}`}>
                  Estado: <span className="font-medium">{cv.estadoSeleccion}</span>
                </p>
                {cv.notasAdmin && (
                  <p className={`text-sm mt-1 ${cv.estadoSeleccion === 'Entrevista' ? 'text-purple-700' : 'text-blue-700'}`}>
                    Notas: {cv.notasAdmin}
                  </p>
                )}
                {cv.fechaSeleccion && (
                  <p className={`text-xs mt-1 ${cv.estadoSeleccion === 'Entrevista' ? 'text-purple-600' : 'text-blue-600'}`}>
                    Actualizado: {new Date(cv.fechaSeleccion).toLocaleDateString('es-AR')}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 ml-4 justify-end">
            <button
              onClick={() => handleDownload(cv)}
              className="flex items-center gap-1 px-3 py-2 text-white text-sm rounded-lg bg-manzur-primary hover:bg-manzur-secondary transition-colors"
              title="Descargar CV"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Agendar entrevista — solo en tab A Entrevistar */}
            {activeTab === 'entrevistar' && (
              <button
                onClick={() => setSchedulingCV(isScheduling ? null : cv.id!)}
                className={`flex items-center gap-1 px-3 py-2 text-white text-sm rounded-lg transition-colors ${
                  isScheduling ? 'bg-purple-800' : 'bg-purple-600 hover:bg-purple-700'
                }`}
                title="Agendar entrevista"
              >
                <Calendar className="w-4 h-4" />
              </button>
            )}

            {/* Gestionar selección — en todas las tabs salvo cuando se está agendando */}
            <button
              onClick={() => {
                setSchedulingCV(null);
                handleStartSelection(cv.id!);
              }}
              className="flex items-center gap-1 px-3 py-2 text-white text-sm rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
              title="Gestionar selección"
            >
              <UserCheck className="w-4 h-4" />
            </button>

            {/* Quitar del proceso — solo en seleccionados y entrevistar */}
            {(activeTab === 'seleccionados' || activeTab === 'entrevistar') && (
              <button
                onClick={() => handleRemoveFromSelection(cv)}
                className="flex items-center gap-1 px-3 py-2 text-white text-sm rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors"
                title="Quitar del proceso — vuelve a lista general"
              >
                <ArrowLeftCircle className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => handleDelete(cv)}
              className="flex items-center gap-1 px-3 py-2 text-white text-sm rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
              title="Eliminar CV"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scheduler panel */}
        {isScheduling && (
          <InterviewScheduler cv={cv} onClose={() => setSchedulingCV(null)} />
        )}

        {/* Selection editor */}
        {isEditing && (
          <div className="p-4 border-t border-manzur-secondary bg-gray-50">
            <h4 className="font-medium text-manzur-primary mb-3">Gestionar Proceso de Selección</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Puesto *</label>
                <select
                  value={selectionData.puesto}
                  onChange={e => setSelectionData({ ...selectionData, puesto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Seleccione un puesto</option>
                  {PUESTOS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  value={selectionData.estado}
                  onChange={e => setSelectionData({ ...selectionData, estado: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {ESTADOS_SELECCION.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
                <textarea
                  value={selectionData.notas}
                  onChange={e => setSelectionData({ ...selectionData, notas: e.target.value })}
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
                  <Check className="w-4 h-4" /> Guardar
                </button>
                <button
                  onClick={() => setEditingCV(null)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  <X className="w-4 h-4" /> Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Pestañas */}
      <div className="flex gap-1 border-b-2 border-gray-200">
        <TabButton tab="todos"          label="Todos los CVs"          count={allCvs.length}      accentClass="border-manzur-primary" />
        <TabButton tab="seleccionados"  label="En Proceso de Selección" count={inProcess.length}   accentClass="border-blue-500" />
        <TabButton tab="entrevistar"    label="A Entrevistar"           count={toInterview.length} accentClass="border-purple-500" />
      </div>

      {/* Descripción de la pestaña activa */}
      {activeTab === 'seleccionados' && (
        <p className="text-sm text-blue-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
          CVs activos en proceso de selección. Para moverlos a <strong>A Entrevistar</strong> cambiá el estado a <em>Entrevista</em>.
          Usá <ArrowLeftCircle className="w-3.5 h-3.5 inline" /> para devolverlos a la lista general.
        </p>
      )}
      {activeTab === 'entrevistar' && (
        <p className="text-sm text-purple-700 bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
          Candidatos listos para entrevista. Usá <Calendar className="w-3.5 h-3.5 inline" /> para agendar la reunión por Meet, Zoom o Teams.
        </p>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="font-medium text-manzur-primary text-sm">Área:</label>
          <select
            value={selectedArea}
            onChange={e => setSelectedArea(e.target.value)}
            className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg"
          >
            <option value="Todos">Todas</option>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-medium text-manzur-primary text-sm">Formación:</label>
          <select
            value={selectedFormacion}
            onChange={e => setSelectedFormacion(e.target.value)}
            className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg"
          >
            <option value="Todos">Todas</option>
            {NIVELES_FORMACION.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button
          onClick={fetchCVs}
          className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg bg-manzur-primary hover:bg-manzur-secondary transition-colors ml-auto"
        >
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      <div className="text-sm text-manzur-primary">
        Total: {displayCvs.length} CV{displayCvs.length !== 1 ? 's' : ''}
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando...</p>
      ) : Object.keys(groupedCvs).length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          {activeTab === 'todos'
            ? 'No hay CVs disponibles'
            : activeTab === 'seleccionados'
              ? 'No hay CVs en proceso de selección'
              : 'No hay candidatos para entrevistar'}
        </p>
      ) : (
        Object.entries(groupedCvs).map(([area, areaCvs]) => (
          <div key={area} className="mb-8">
            <h3 className="text-xl font-bold mb-4 pb-2 border-b-2 border-manzur-secondary text-manzur-primary">
              {area} ({areaCvs.length})
            </h3>
            <div className="space-y-3">
              {areaCvs.map(cv => <CVCard key={cv.id} cv={cv} />)}
            </div>
          </div>
        ))
      )}
    </div>
  );
};