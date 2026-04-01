import React, { useState, useEffect } from 'react';
import {
  Download, Trash2, RefreshCw, UserCheck, X, Check,
  Calendar, Video, ArrowLeftCircle, Clock, ChevronLeft, ChevronRight,
  AlertTriangle, Trophy, ThumbsDown, RotateCcw, History,
  Mail, FlaskConical, Brain, ClipboardList
} from 'lucide-react';
import { CV } from '@/lib/types';

const AREAS = [
  'Auditoría','Contable','Compras','Finanzas','Data Analytics',
  'Sistemas','RRHH Hard y Soft','Calidad','Control Interno','RSE','Genérico'
];
const NIVELES_FORMACION = ['Secundario','Terciario','Universitario','Formación Superior'];
const ESTADOS_SELECCION = [
  'En Curso','Entrevista RRHH','Entrevista Coordinador',
  'Terna Preseleccionados','Seleccionado','Descartado','Aprobado','Rechazado','Contratado'
];
const PUESTOS = [
  'ADMINISTRATIVO COMERCIAL','ADMINISTRATIVO CONTABLE BEBIDAS','ADMINISTRATIVO CONTABLE SERVICIOS',
  'ADMINISTRATIVO DE FACTURACION','ADMINISTRATIVO FINANZAS','ADMINISTRATIVO IMPUESTOS',
  'ADMINISTRATIVO DE COMPRAS','ANALISTA CONTABLE BEBIDAS','ANALISTA CONTABLE SERVICIOS',
  'ANALISTA CONTROL DE GESTION','ANALISTA DE COSTOS','ANALISTA DE DATOS','ANALISTA DE FINANZAS',
  'ANALISTA DE HABILITACIONES E INOCUIDAD ALIMENTARIA','ANALISTA DE IMPUESTOS',
  'ANALISTA GESTION DE CALIDAD','ANALISTA MARKETING','ANALISTA NOVEDADES RRHH HARD',
  'ANALISTA PLANIF ESTRATEGICA','ANALISTA RRHH HARD','ANALISTA RRHH SOFT',
  'AUDITOR INTERNO DE BEBIDAS','AUDITOR INTERNO PyS','COORDINADOR CONTABLE',
  'COORDINADOR GENERAL','COORDINADOR PLANIFICACION ESTRATEGICA','COORDINADOR SISTEMAS',
  'COORDINADOR AUDITORIA','COORDINADOR FINANZAS','COORDINADOR GESTION DE CALIDAD',
  'COORDINADOR RRHH SOFT','GERENCIA MARKETING','MAESTRANZA','RESPONSABLE AUDITORIA PyS',
  'RESPONSABLE COMPRAS','RESPONSABLE DATA ANALYTICS','RESPONSABLE RRHH HARD',
  'RESPONSABLE RSE','TECNICO INFROMATICO','TESORERO'
].sort();
const MOTIVOS_DESCARTE = [
  'Declinó la oferta a último momento','No se presentó a la entrevista',
  'No cumple con el perfil requerido','Actitud no apta durante el proceso',
  'Información falsa o inconsistente','Otro motivo',
];

type TabType = 'todos'|'entrevistaRRHH'|'entrevistaCoord'|'terna'|'seleccionados'|'descartados';

// ─── Colores exámenes ────────────────────────────────────────────────────────
// Físico = azul, Psicotécnico = verde, Ambos = turquesa
const EXAM_BADGE = {
  fisico:       { bg:'bg-blue-100',    border:'border-blue-400',    text:'text-blue-800',    label:'Examen Físico' },
  psicotecnico: { bg:'bg-green-100',   border:'border-green-400',   text:'text-green-800',   label:'Examen Psicotécnico' },
  ambos:        { bg:'bg-teal-100',    border:'border-teal-400',    text:'text-teal-800',    label:'Físico + Psicotécnico' },
};

// ─── Platform config ─────────────────────────────────────────────────────────
const PLATFORM_CONFIG = {
  meet:  { label:'Google Meet', color:'bg-green-600 hover:bg-green-700',   urlBase:'https://meet.google.com/new', icon:'🎥' },
  zoom:  { label:'Zoom',        color:'bg-blue-600 hover:bg-blue-700',     urlBase:'https://zoom.us/start/videomeeting', icon:'📹' },
  teams: { label:'Teams',       color:'bg-purple-600 hover:bg-purple-700', urlBase:'https://teams.microsoft.com/l/meeting/new', icon:'💼' },
};
interface MeetingData { date:string; time:string; platform:'meet'|'zoom'|'teams'; notes:string; }

// ─── Interview Scheduler (reusable) ─────────────────────────────────────────
const InterviewScheduler: React.FC<{ cv:CV; label:string; onClose:()=>void }> = ({ cv, label, onClose }) => {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [meeting, setMeeting]     = useState<MeetingData>({ date:'', time:'10:00', platform:'meet', notes:'' });
  const [scheduled, setScheduled] = useState(false);

  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const monthNames  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dayNames    = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  const prevMonth = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
  const nextMonth = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };
  const selectDate = (day:number) => setMeeting(m=>({...m,date:`${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`}));
  const isToday = (day:number) => today.getFullYear()===viewYear&&today.getMonth()===viewMonth&&today.getDate()===day;
  const isPast  = (day:number) => { const d=new Date(viewYear,viewMonth,day);d.setHours(0,0,0,0);const t=new Date();t.setHours(0,0,0,0);return d<t; };
  const selectedDateStr = meeting.date ? new Date(meeting.date+'T00:00:00').toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : null;
  const buildUrl = () => meeting.platform!=='teams'
    ? PLATFORM_CONFIG[meeting.platform].urlBase
    : `https://teams.microsoft.com/l/meeting/new?subject=${encodeURIComponent(`${label} — ${cv.nombre} ${cv.apellido} - ${cv.puestoSeleccionado||''}`)}`;

  return (
    <div className="p-5 border-t border-purple-200 bg-purple-50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-purple-900 flex items-center gap-2">
          <Calendar className="w-4 h-4"/>{label} — {cv.nombre} {cv.apellido}
        </h4>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4"/></button>
      </div>
      {scheduled ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-semibold text-purple-900">¡Reunión iniciada!</p>
          <p className="text-sm text-gray-600 mt-1">{selectedDateStr} a las {meeting.time} hs — {PLATFORM_CONFIG[meeting.platform].label}</p>
          <button onClick={()=>setScheduled(false)} className="mt-4 text-sm text-purple-700 underline">Volver al calendario</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="p-1 rounded hover:bg-purple-200"><ChevronLeft className="w-4 h-4 text-purple-700"/></button>
              <span className="font-semibold text-purple-900 text-sm">{monthNames[viewMonth]} {viewYear}</span>
              <button onClick={nextMonth} className="p-1 rounded hover:bg-purple-200"><ChevronRight className="w-4 h-4 text-purple-700"/></button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {dayNames.map(d=><div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({length:firstDay}).map((_,i)=><div key={`e-${i}`}/>)}
              {Array.from({length:daysInMonth}).map((_,i)=>{
                const day=i+1;
                const dateStr=`${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const isSelected=meeting.date===dateStr; const past=isPast(day);
                return (
                  <button key={day} disabled={past} onClick={()=>selectDate(day)}
                    className={`text-xs py-1.5 rounded transition-colors
                      ${past?'text-gray-300 cursor-not-allowed':'hover:bg-purple-200 cursor-pointer'}
                      ${isToday(day)&&!isSelected?'ring-1 ring-purple-400 font-bold':''}
                      ${isSelected?'bg-purple-600 text-white font-bold':'text-gray-700'}`}>{day}</button>
                );
              })}
            </div>
            {meeting.date&&<p className="mt-2 text-xs text-purple-700 capitalize">{selectedDateStr}</p>}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1"><Clock className="w-3 h-3 inline mr-1"/>Horario</label>
              <input type="time" value={meeting.time} onChange={e=>setMeeting(m=>({...m,time:e.target.value}))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2"><Video className="w-3 h-3 inline mr-1"/>Plataforma</label>
              <div className="flex gap-2">
                {(Object.keys(PLATFORM_CONFIG) as Array<keyof typeof PLATFORM_CONFIG>).map(key=>(
                  <button key={key} onClick={()=>setMeeting(m=>({...m,platform:key}))}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium border-2 transition-all
                      ${meeting.platform===key?'border-purple-600 bg-purple-100 text-purple-900':'border-gray-200 bg-white text-gray-600 hover:border-purple-300'}`}>
                    {PLATFORM_CONFIG[key].icon} {PLATFORM_CONFIG[key].label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Notas internas (opcional)</label>
              <textarea value={meeting.notes} onChange={e=>setMeeting(m=>({...m,notes:e.target.value}))} rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"/>
            </div>
            <button onClick={()=>{if(!meeting.date||!meeting.time)return;setScheduled(true);window.open(buildUrl(),'_blank');}}
              disabled={!meeting.date||!meeting.time}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all
                ${meeting.date&&meeting.time?`${PLATFORM_CONFIG[meeting.platform].color} shadow-md`:'bg-gray-300 cursor-not-allowed'}`}>
              <Video className="w-4 h-4"/>Crear reunión en {PLATFORM_CONFIG[meeting.platform].label}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Exam Modal ───────────────────────────────────────────────────────────────
type ExamType = 'fisico'|'psicotecnico';
const ExamModal: React.FC<{
  cv: CV;
  tipo: ExamType;
  onConfirm: (notas:string) => void;
  onCancel: () => void;
}> = ({ cv, tipo, onConfirm, onCancel }) => {
  const [notas, setNotas] = useState('');
  const cfg = EXAM_BADGE[tipo];
  const icon = tipo==='fisico' ? <FlaskConical className="w-5 h-5"/> : <Brain className="w-5 h-5"/>;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center flex-shrink-0 ${cfg.text}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Solicitar {cfg.label}</h3>
            <p className="text-sm text-gray-500">{cv.nombre} {cv.apellido} — DNI {cv.dni}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales (opcional)</label>
            <textarea value={notas} onChange={e=>setNotas(e.target.value)} rows={3}
              placeholder={`Indicaciones para el ${cfg.label.toLowerCase()}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none"/>
          </div>
          <p className="text-xs text-gray-400">Se registrará la fecha de solicitud automáticamente.</p>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={()=>onConfirm(notas)}
            className={`flex-1 py-2.5 ${cfg.bg} border-2 ${cfg.border} ${cfg.text} font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 hover:opacity-80`}>
            {icon} Confirmar solicitud
          </button>
          <button onClick={onCancel} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Discard Modal ────────────────────────────────────────────────────────────
const DiscardModal: React.FC<{ cv:CV; onConfirm:(m:string,n:string)=>void; onCancel:()=>void }> = ({ cv, onConfirm, onCancel }) => {
  const [motivo, setMotivo] = useState('');
  const [notas,  setNotas]  = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <ThumbsDown className="w-5 h-5 text-red-600"/>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Descartar candidato</h3>
            <p className="text-sm text-gray-500">{cv.nombre} {cv.apellido} — DNI {cv.dni}</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 inline mr-1"/>
          Este candidato quedará marcado como <strong>No Apto</strong>. Podés reactivarlo desde Descartados si cambiás de opinión.
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
            <select value={motivo} onChange={e=>setMotivo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
              <option value="">Seleccione un motivo</option>
              {MOTIVOS_DESCARTE.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
            <textarea value={notas} onChange={e=>setNotas(e.target.value)} rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"/>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={()=>{if(!motivo){alert('Seleccioná un motivo');return;}onConfirm(motivo,notas);}}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2">
            <ThumbsDown className="w-4 h-4"/>Confirmar descarte
          </button>
          <button onClick={onCancel} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main AdminPanel ──────────────────────────────────────────────────────────
export const AdminPanel: React.FC = () => {
  const [cvs, setCvs]                             = useState<CV[]>([]);
  const [activeTab, setActiveTab]                 = useState<TabType>('todos');
  const [selectedArea, setSelectedArea]           = useState('Todos');
  const [selectedFormacion, setSelectedFormacion] = useState('Todos');
  const [loading, setLoading]                     = useState(true);
  const [editingCV, setEditingCV]                 = useState<string|null>(null);
  const [schedulingCV, setSchedulingCV]           = useState<string|null>(null);
  const [discardingCV, setDiscardingCV]           = useState<CV|null>(null);
  const [examModal, setExamModal]                 = useState<{cv:CV; tipo:ExamType}|null>(null);
  const [selectionData, setSelectionData]         = useState({ puesto:'', estado:'En Curso', notas:'' });

  const fetchCVs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedArea!=='Todos') params.append('area',selectedArea);
      if (selectedFormacion!=='Todos') params.append('formacion',selectedFormacion);
      const r = await fetch(`/api/cv/list${params.toString()?'?'+params.toString():''}`);
      const d = await r.json();
      if (r.ok) setCvs(d.cvs||[]);
      else alert(d.error||'Error al cargar los CVs');
    } catch { alert('Error al cargar los CVs'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ fetchCVs(); },[selectedArea,selectedFormacion]);

  const handleDownload = async (cv:CV) => {
    try {
      const r=await fetch(`/api/cv/download?id=${cv.id}`);
      const d=await r.json();
      if(r.ok) window.open(d.downloadUrl,'_blank');
      else alert(d.error||'Error al descargar');
    } catch { alert('Error al descargar el CV'); }
  };

  const handleDelete = async (cv:CV) => {
    if(!confirm(`¿Eliminar el CV de ${cv.nombre} ${cv.apellido}?`)) return;
    try {
      const r=await fetch(`/api/cv/delete?id=${cv.id}`,{method:'DELETE'});
      const d=await r.json();
      if(r.ok){alert('CV eliminado');fetchCVs();}
      else alert(d.error||'Error al eliminar');
    } catch { alert('Error al eliminar el CV'); }
  };

  const handleStartSelection = (cvId:string) => {
    setEditingCV(cvId); setSchedulingCV(null);
    const cv=cvs.find(c=>c.id===cvId);
    setSelectionData({ puesto:cv?.puestoSeleccionado||'', estado:cv?.estadoSeleccion||'En Curso', notas:cv?.notasAdmin||'' });
  };

  const handleSaveSelection = async (cvId:string) => {
    if(!selectionData.puesto.trim()){alert('Debe ingresar el puesto');return;}
    try {
      const r=await fetch('/api/cv/update-selection',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({cvId,puestoSeleccionado:selectionData.puesto,estadoSeleccion:selectionData.estado,notasAdmin:selectionData.notas}),
      });
      const d=await r.json();
      if(r.ok){setEditingCV(null);fetchCVs();}
      else alert(d.error||'Error al guardar');
    } catch { alert('Error al guardar'); }
  };

  const handleRemoveFromSelection = async (cv:CV) => {
    if(!confirm(`¿Quitar a ${cv.nombre} ${cv.apellido} del proceso?`)) return;
    try {
      const r=await fetch('/api/cv/update-selection',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({cvId:cv.id,puestoSeleccionado:'',estadoSeleccion:'',notasAdmin:''}),
      });
      if(r.ok) fetchCVs();
    } catch { alert('Error al actualizar'); }
  };

  const handleDiscard = async (cv:CV, motivo:string, notas:string) => {
    try {
      const r=await fetch('/api/cv/update-selection',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({cvId:cv.id,puestoSeleccionado:cv.puestoSeleccionado||'',estadoSeleccion:'Descartado',notasAdmin:notas||'',motivoDescarte:motivo}),
      });
      if(r.ok){setDiscardingCV(null);fetchCVs();}
      else{const d=await r.json();alert(d.error||'Error');}
    } catch { alert('Error al descartar'); }
  };

  const handleReactivar = async (cv:CV) => {
    if(!confirm(`¿Reactivar a ${cv.nombre} ${cv.apellido}?`)) return;
    try {
      const r=await fetch('/api/cv/update-selection',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({cvId:cv.id,accion:'reactivar'}),
      });
      if(r.ok) fetchCVs();
    } catch { alert('Error al reactivar'); }
  };

  // ── Guardar examen ────────────────────────────────────────────────────────
  const handleSaveExam = async (cv:CV, tipo:ExamType, notas:string) => {
    const field     = tipo==='fisico' ? 'examenFisico' : 'examenPsicotecnico';
    const fieldFecha = tipo==='fisico' ? 'examenFisicoFecha' : 'examenPsicotecnicoFecha';
    const fieldNotas = tipo==='fisico' ? 'examenFisicoNotas' : 'examenPsicotecnicoNotas';
    try {
      const r=await fetch('/api/cv/update-exam',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ cvId:cv.id, [field]:true, [fieldFecha]:new Date().toISOString(), [fieldNotas]:notas }),
      });
      if(r.ok){setExamModal(null);fetchCVs();}
      else{const d=await r.json();alert(d.error||'Error al guardar examen');}
    } catch { alert('Error al guardar examen'); }
  };

  // ── Enviar mail ───────────────────────────────────────────────────────────
  const handleSendMail = (cv:CV) => {
    const email = cv.email || cv.uploadedBy;
    if(!email){alert('No hay email registrado para este candidato.');return;}
    const subject = encodeURIComponent(`Proceso de selección — ${cv.puestoSeleccionado||'Manzur Administraciones'}`);
    const body    = encodeURIComponent(`Estimado/a ${cv.nombre} ${cv.apellido},\n\n`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`,'_blank');
  };

  // ── Filtros ───────────────────────────────────────────────────────────────
  const base = (list:CV[]) => list.filter(cv=>{
    if(selectedArea!=='Todos'&&cv.area!==selectedArea) return false;
    if(selectedFormacion!=='Todos'&&cv.nivelFormacion!==selectedFormacion) return false;
    return true;
  });

  const allCvs      = base(cvs.filter(cv=>!cv.puestoSeleccionado&&cv.estadoSeleccion!=='Descartado'));
  const entRRHH     = base(cvs.filter(cv=>cv.estadoSeleccion==='Entrevista RRHH'));
  const entCoord    = base(cvs.filter(cv=>cv.estadoSeleccion==='Entrevista Coordinador'));
  const terna       = base(cvs.filter(cv=>cv.estadoSeleccion==='Terna Preseleccionados'));
  const seleccionados = base(cvs.filter(cv=>cv.estadoSeleccion==='Seleccionado'));
  const descartados = base(cvs.filter(cv=>cv.estadoSeleccion==='Descartado'));

  const displayCvs =
    activeTab==='todos'          ? allCvs :
    activeTab==='entrevistaRRHH' ? entRRHH :
    activeTab==='entrevistaCoord'? entCoord :
    activeTab==='terna'          ? terna :
    activeTab==='seleccionados'  ? seleccionados : descartados;

  const groupedCvs = displayCvs.reduce((acc,cv)=>{
    const area=cv.area||'Genérico';
    if(!acc[area]) acc[area]=[];
    acc[area].push(cv);
    return acc;
  },{} as Record<string,CV[]>);

  const TABS:{id:TabType;label:string;count:number;accent:string;active:string}[] = [
    { id:'todos',           label:'Todos los CVs',           count:allCvs.length,        accent:'border-manzur-primary', active:'text-manzur-primary' },
    { id:'entrevistaRRHH',  label:'Entrevista RRHH',         count:entRRHH.length,       accent:'border-blue-500',       active:'text-blue-600' },
    { id:'entrevistaCoord', label:'Entrevista Coordinador',  count:entCoord.length,      accent:'border-purple-500',     active:'text-purple-600' },
    { id:'terna',           label:'Terna Preseleccionados',  count:terna.length,         accent:'border-amber-500',      active:'text-amber-600' },
    { id:'seleccionados',   label:'Seleccionados',           count:seleccionados.length, accent:'border-green-500',      active:'text-green-600' },
    { id:'descartados',     label:'Descartados / No Aptos',  count:descartados.length,   accent:'border-red-500',        active:'text-red-600' },
  ];

  const getAvailableEstados = (tab:TabType) => {
    if(tab==='todos')           return ['En Curso','Entrevista RRHH'];
    if(tab==='entrevistaRRHH')  return ['Entrevista RRHH','Entrevista Coordinador'];
    if(tab==='entrevistaCoord') return ['Entrevista Coordinador','Terna Preseleccionados'];
    if(tab==='terna')           return ['Terna Preseleccionados','Seleccionado'];
    if(tab==='seleccionados')   return ['Seleccionado'];
    return ESTADOS_SELECCION;
  };

  // ── Exam badge helper ─────────────────────────────────────────────────────
  const ExamBadges:React.FC<{cv:CV}> = ({cv}) => {
    const hasFisico = cv.examenFisico;
    const hasPsi    = cv.examenPsicotecnico;
    if(!hasFisico&&!hasPsi) return null;
    const tipo = hasFisico&&hasPsi?'ambos':hasFisico?'fisico':'psicotecnico';
    const cfg  = EXAM_BADGE[tipo];
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.border} ${cfg.text}`}>
        <ClipboardList className="w-3.5 h-3.5"/>
        {cfg.label}
        {hasFisico&&cv.examenFisicoFecha&&(
          <span className="font-normal opacity-70">· {new Date(cv.examenFisicoFecha).toLocaleDateString('es-AR')}</span>
        )}
        {hasPsi&&cv.examenPsicotecnicoFecha&&!hasFisico&&(
          <span className="font-normal opacity-70">· {new Date(cv.examenPsicotecnicoFecha).toLocaleDateString('es-AR')}</span>
        )}
      </div>
    );
  };

  // ── CV Card ───────────────────────────────────────────────────────────────
  const CVCard:React.FC<{cv:CV}> = ({cv}) => {
    const isEditing    = editingCV===cv.id;
    const isScheduling = schedulingCV===cv.id;
    const isDiscarded  = cv.estadoSeleccion==='Descartado';
    const [showHistory, setShowHistory] = useState(false);

    const isInterviewTab = activeTab==='entrevistaRRHH'||activeTab==='entrevistaCoord';
    const isTerna        = activeTab==='terna';

    const badgeBg =
      cv.estadoSeleccion==='Descartado'             ? 'bg-red-50 border-red-300' :
      cv.estadoSeleccion==='Seleccionado'           ? 'bg-green-50 border-green-300' :
      cv.estadoSeleccion==='Terna Preseleccionados' ? 'bg-amber-50 border-amber-300' :
      cv.estadoSeleccion==='Entrevista Coordinador' ? 'bg-purple-50 border-purple-300' :
      cv.estadoSeleccion==='Entrevista RRHH'        ? 'bg-blue-50 border-blue-300' :
      'bg-gray-50 border-gray-200';

    const badgeTxt =
      cv.estadoSeleccion==='Descartado'             ? 'text-red-900' :
      cv.estadoSeleccion==='Seleccionado'           ? 'text-green-900' :
      cv.estadoSeleccion==='Terna Preseleccionados' ? 'text-amber-900' :
      cv.estadoSeleccion==='Entrevista Coordinador' ? 'text-purple-900' :
      cv.estadoSeleccion==='Entrevista RRHH'        ? 'text-blue-900' : 'text-gray-900';

    const schedulerLabel = activeTab==='entrevistaRRHH' ? 'Entrevista RRHH' : 'Entrevista Coordinador';

    return (
      <div className={`border rounded-lg hover:shadow-md transition-shadow ${isDiscarded?'border-red-300 bg-red-50/30':'border-manzur-secondary'}`}>

        {/* Banda roja */}
        {isDiscarded && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-t-lg text-sm font-semibold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0"/>
            CANDIDATO NO APTO — {cv.motivoDescarte||'Descartado del proceso'}
          </div>
        )}

        {/* Banda naranja — repostulación */}
        {cv.repostulacionDescartado && !isDiscarded && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-t-lg text-sm font-semibold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0"/>
            ATENCIÓN: Fue descartado anteriormente — {cv.motivoDescarteAnterior}
          </div>
        )}

        <div className="p-4 flex items-start justify-between">
          <div className="flex-1">
            <p className="font-semibold text-lg">{cv.nombre} {cv.apellido}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
              <p>DNI: {cv.dni}</p>
              <p>Teléfono: ({cv.telefonoArea}) {cv.telefonoNumero}</p>
              <p>Nacimiento: {cv.fechaNacimiento}</p>
              <p>Formación: {cv.nivelFormacion}</p>
              {cv.lugarResidencia&&<p>Residencia: {cv.lugarResidencia}</p>}
              <p>Email: {cv.email||cv.uploadedBy}</p>
              <p>Cargado: {new Date(cv.uploadedAt).toLocaleDateString('es-AR')}</p>
            </div>

            {/* Badge estado selección */}
            {cv.puestoSeleccionado && (
              <div className={`mt-3 p-3 rounded-lg border ${badgeBg}`}>
                <p className={`font-medium ${badgeTxt}`}>Puesto: {cv.puestoSeleccionado}</p>
                <p className={`text-sm ${badgeTxt}`}>Estado: <span className="font-semibold">{cv.estadoSeleccion}</span></p>
                {cv.notasAdmin&&<p className={`text-sm mt-1 ${badgeTxt}`}>Notas: {cv.notasAdmin}</p>}
                {cv.fechaSeleccion&&<p className="text-xs mt-1 text-gray-500">Actualizado: {new Date(cv.fechaSeleccion).toLocaleDateString('es-AR')}</p>}
              </div>
            )}

            {/* Badges exámenes */}
            <div className="mt-2"><ExamBadges cv={cv}/></div>

            {/* Notas examen físico */}
            {cv.examenFisico&&cv.examenFisicoNotas&&(
              <p className="text-xs text-blue-600 mt-1">📋 Físico: {cv.examenFisicoNotas}</p>
            )}
            {cv.examenPsicotecnico&&cv.examenPsicotecnicoNotas&&(
              <p className="text-xs text-green-600 mt-1">📋 Psicotécnico: {cv.examenPsicotecnicoNotas}</p>
            )}

            {/* Historial */}
            {cv.historialEstados&&cv.historialEstados.length>0&&(
              <div className="mt-2">
                <button onClick={()=>setShowHistory(v=>!v)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  <History className="w-3 h-3"/>
                  {showHistory?'Ocultar historial':`Ver historial (${cv.historialEstados.length})`}
                </button>
                {showHistory&&(
                  <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-gray-200">
                    {cv.historialEstados.map((h,i)=>(
                      <div key={i} className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{h.estado}</span>
                        {h.motivo&&<span className="text-red-600"> — {h.motivo}</span>}
                        <span className="ml-1 text-gray-400">{new Date(h.fecha).toLocaleDateString('es-AR')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex flex-wrap gap-2 ml-4 justify-end max-w-[200px]">

            {/* Descargar */}
            <button onClick={()=>handleDownload(cv)} title="Descargar CV"
              className="px-3 py-2 text-white text-sm rounded-lg bg-manzur-primary hover:bg-manzur-secondary transition-colors">
              <Download className="w-4 h-4"/>
            </button>

            {/* Agendar — ambas pestañas de entrevista */}
            {isInterviewTab&&(
              <button onClick={()=>setSchedulingCV(isScheduling?null:cv.id!)} title="Agendar entrevista"
                className={`px-3 py-2 text-white text-sm rounded-lg transition-colors ${isScheduling?'bg-purple-800':'bg-purple-600 hover:bg-purple-700'}`}>
                <Calendar className="w-4 h-4"/>
              </button>
            )}

            {/* Enviar mail — solo en Terna */}
            {isTerna&&(
              <button onClick={()=>handleSendMail(cv)} title="Enviar email al candidato"
                className="px-3 py-2 text-white text-sm rounded-lg bg-sky-500 hover:bg-sky-600 transition-colors">
                <Mail className="w-4 h-4"/>
              </button>
            )}

            {/* Examen físico — solo en Terna */}
            {isTerna&&(
              <button onClick={()=>setExamModal({cv,tipo:'fisico'})}
                title="Solicitar examen físico"
                className={`px-3 py-2 text-sm rounded-lg border-2 transition-colors font-medium
                  ${cv.examenFisico
                    ? 'bg-blue-100 border-blue-400 text-blue-800'
                    : 'bg-white border-blue-300 text-blue-600 hover:bg-blue-50'}`}>
                <FlaskConical className="w-4 h-4"/>
              </button>
            )}

            {/* Examen psicotécnico — solo en Terna */}
            {isTerna&&(
              <button onClick={()=>setExamModal({cv,tipo:'psicotecnico'})}
                title="Solicitar examen psicotécnico"
                className={`px-3 py-2 text-sm rounded-lg border-2 transition-colors font-medium
                  ${cv.examenPsicotecnico
                    ? 'bg-green-100 border-green-400 text-green-800'
                    : 'bg-white border-green-300 text-green-600 hover:bg-green-50'}`}>
                <Brain className="w-4 h-4"/>
              </button>
            )}

            {/* Gestionar — no en Seleccionados ni Descartados */}
            {activeTab!=='descartados'&&activeTab!=='seleccionados'&&(
              <button onClick={()=>{setSchedulingCV(null);handleStartSelection(cv.id!);}} title="Gestionar selección"
                className="px-3 py-2 text-white text-sm rounded-lg bg-green-600 hover:bg-green-700 transition-colors">
                <UserCheck className="w-4 h-4"/>
              </button>
            )}

            {/* Descartar */}
            {(activeTab==='entrevistaRRHH'||activeTab==='entrevistaCoord'||activeTab==='terna')&&(
              <button onClick={()=>setDiscardingCV(cv)} title="Descartar candidato"
                className="px-3 py-2 text-white text-sm rounded-lg bg-red-500 hover:bg-red-600 transition-colors">
                <ThumbsDown className="w-4 h-4"/>
              </button>
            )}

            {/* Reactivar — solo en Descartados */}
            {activeTab==='descartados'&&(
              <button onClick={()=>handleReactivar(cv)} title="Reactivar candidato"
                className="px-3 py-2 text-white text-sm rounded-lg bg-amber-500 hover:bg-amber-600 transition-colors flex items-center gap-1">
                <RotateCcw className="w-4 h-4"/>
                <span className="text-xs font-medium">Reactivar</span>
              </button>
            )}

            {/* Quitar del proceso */}
            {(activeTab==='entrevistaRRHH'||activeTab==='entrevistaCoord')&&(
              <button onClick={()=>handleRemoveFromSelection(cv)} title="Quitar del proceso"
                className="px-3 py-2 text-white text-sm rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors">
                <ArrowLeftCircle className="w-4 h-4"/>
              </button>
            )}

            {/* Eliminar */}
            <button onClick={()=>handleDelete(cv)} title="Eliminar CV"
              className="px-3 py-2 text-white text-sm rounded-lg bg-gray-500 hover:bg-gray-600 transition-colors">
              <Trash2 className="w-4 h-4"/>
            </button>
          </div>
        </div>

        {/* Scheduler inline */}
        {isScheduling&&isInterviewTab&&(
          <InterviewScheduler cv={cv} label={schedulerLabel} onClose={()=>setSchedulingCV(null)}/>
        )}

        {/* Editor de selección */}
        {isEditing&&(
          <div className="p-4 border-t border-manzur-secondary bg-gray-50">
            <h4 className="font-medium text-manzur-primary mb-3">Gestionar Proceso de Selección</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Puesto *</label>
                <select value={selectionData.puesto} onChange={e=>setSelectionData({...selectionData,puesto:e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">Seleccione un puesto</option>
                  {PUESTOS.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select value={selectionData.estado} onChange={e=>setSelectionData({...selectionData,estado:e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {getAvailableEstados(activeTab).map(e=><option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
                <textarea value={selectionData.notas} onChange={e=>setSelectionData({...selectionData,notas:e.target.value})}
                  rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-lg" onBlur={() => {}}/>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>handleSaveSelection(cv.id!)}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-green-600 hover:bg-green-700">
                  <Check className="w-4 h-4"/>Guardar
                </button>
                <button onClick={()=>setEditingCV(null)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg bg-gray-200 hover:bg-gray-300">
                  <X className="w-4 h-4"/>Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {discardingCV&&<DiscardModal cv={discardingCV} onConfirm={(m,n)=>handleDiscard(discardingCV,m,n)} onCancel={()=>setDiscardingCV(null)}/>}
      {examModal&&<ExamModal cv={examModal.cv} tipo={examModal.tipo} onConfirm={(n)=>handleSaveExam(examModal.cv,examModal.tipo,n)} onCancel={()=>setExamModal(null)}/>}

      {/* Pestañas */}
      <div className="flex flex-wrap border-b-2 border-gray-200">
        {TABS.map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium transition-colors text-sm whitespace-nowrap
              ${activeTab===tab.id?`border-b-2 ${tab.accent} ${tab.active}`:'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
            <span className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs text-white ${activeTab===tab.id?'bg-gray-700':'bg-gray-400'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Banners contextuales */}
      {activeTab==='entrevistaRRHH'&&(
        <p className="text-sm text-blue-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
          Candidatos en entrevista con RRHH. Usá <Calendar className="w-3.5 h-3.5 inline"/> para agendar por Meet, Zoom o Teams.
        </p>
      )}
      {activeTab==='entrevistaCoord'&&(
        <p className="text-sm text-purple-700 bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
          Candidatos en entrevista con Coordinador. Agendá la reunión y avanzalos a <strong>Terna Preseleccionados</strong>.
        </p>
      )}
      {activeTab==='terna'&&(
        <p className="text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
          Terna de candidatos preseleccionados. Podés enviarles un <Mail className="w-3.5 h-3.5 inline"/> mail, solicitar
          <FlaskConical className="w-3.5 h-3.5 inline mx-1 text-blue-600"/> examen físico
          o <Brain className="w-3.5 h-3.5 inline mx-1 text-green-600"/> psicotécnico, y avanzarlos a <strong>Seleccionado</strong>.
        </p>
      )}
      {activeTab==='seleccionados'&&(
        <p className="text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
          <Trophy className="w-3.5 h-3.5 inline mr-1"/>Candidatos que ingresaron a la empresa.
        </p>
      )}
      {activeTab==='descartados'&&(
        <p className="text-sm text-red-700 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
          <AlertTriangle className="w-3.5 h-3.5 inline mr-1"/>Candidatos No Aptos.
          Usá <RotateCcw className="w-3.5 h-3.5 inline"/> <strong>Reactivar</strong> para devolverlos a la lista con nota del descarte anterior.
        </p>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="font-medium text-manzur-primary text-sm">Área:</label>
          <select value={selectedArea} onChange={e=>setSelectedArea(e.target.value)}
            className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg">
            <option value="Todos">Todas</option>
            {AREAS.map(a=><option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-medium text-manzur-primary text-sm">Formación:</label>
          <select value={selectedFormacion} onChange={e=>setSelectedFormacion(e.target.value)}
            className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg">
            <option value="Todos">Todas</option>
            {NIVELES_FORMACION.map(n=><option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button onClick={fetchCVs}
          className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg bg-manzur-primary hover:bg-manzur-secondary transition-colors ml-auto">
          <RefreshCw className="w-4 h-4"/>Actualizar
        </button>
      </div>

      <div className="text-sm text-manzur-primary">Total: {displayCvs.length} CV{displayCvs.length!==1?'s':''}</div>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando...</p>
      ) : Object.keys(groupedCvs).length===0 ? (
        <p className="text-center text-gray-500 py-8">
          {activeTab==='todos'?'No hay CVs disponibles'
          :activeTab==='entrevistaRRHH'?'No hay candidatos en Entrevista RRHH'
          :activeTab==='entrevistaCoord'?'No hay candidatos en Entrevista Coordinador'
          :activeTab==='terna'?'No hay candidatos en la terna'
          :activeTab==='seleccionados'?'No hay candidatos seleccionados aún'
          :'No hay candidatos descartados'}
        </p>
      ) : (
        Object.entries(groupedCvs).map(([area,areaCvs])=>(
          <div key={area} className="mb-8">
            <h3 className="text-xl font-bold mb-4 pb-2 border-b-2 border-manzur-secondary text-manzur-primary">
              {area} ({areaCvs.length})
            </h3>
            <div className="space-y-3">
              {areaCvs.map(cv=><CVCard key={cv.id} cv={cv}/>)}
            </div>
          </div>
        ))
      )}
    </div>
  );
};