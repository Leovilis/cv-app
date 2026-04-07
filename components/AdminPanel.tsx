import React, { useState, useEffect, useCallback } from 'react';
import {
  Download, Trash2, RefreshCw, UserCheck, X, Check,
  Calendar, Video, ArrowLeftCircle, Clock, ChevronLeft, ChevronRight, ChevronUp,
  AlertTriangle, Trophy, ThumbsDown, RotateCcw, History,
  Mail, FlaskConical, Brain, FileText, Printer, ClipboardList
} from 'lucide-react';
import { CV } from '@/lib/types';

const AREAS_PUESTOS: Record<string, string[]> = {
  'PLANIFICACION ESTRATEGICA':           ['COORDINADOR PLANIFICACION ESTRATEGICA','ANALISTA PLANIF ESTRATEGICA','ANALISTA DE COSTOS'],
  'FINANZAS':                            ['COORDINADORA FINANZAS','TESORERO','ANALISTA DE FINANZAS','ADM FINANZAS'],
  'CONTABLE':                            ['COORDINADOR CONTABLE','ANALISTA CONTABLE BEBIDAS','ANALISTA CONTABLE SERVICIOS','ADM CONTABLE BEBIDAS','ADM CONTABLE SERVICIOS','ADM COMERCIAL'],
  'CONTROL DE GESTION':                  ['ANALISTA CONTROL DE GESTION'],
  'IMPUESTOS':                           ['ANALISTA DE IMPUESTOS','ADM IMPUESTOS','ADM DE FACTURACION'],
  'AUDITORIA BEBIDAS':                   ['COORDINADORA AUDITORIA','AUDITOR INTERNO DE BEBIDAS'],
  'AUDITORIA PRODUCCION Y SERVICIOS':    ['RESPONSABLE AUDITORIA PyS','AUDITOR INTERNO PyS'],
  'SISTEMAS':                            ['COORDINADOR SISTEMAS','TECNICO INFROMATICO'],
  'RRHH HARD':                           ['RESPONSABLE RRHH HARD','ANALISTA RRHH HARD','ANALISTA NOVEDADES RRHH HARD'],
  'RRHH SOFT':                           ['COORDINADORA RRHH SOFT','ANALISTA RRHH SOFT'],
  'GESTION DE CALIDAD':                  ['COORDINADORA GESTION DE CALIDAD','ANALISTA GESTION DE CALIDAD'],
  'GESTION DOCUMENTAL':                  ['ANALISTA DE HABILITACIONES E INOCUIDAD ALIMENTARIA'],
  'RSE':                                 ['RESPONSABLE RSE'],
  'DATA ANALYTICS':                      ['RESPONSABLE DATA ANALYTICS','ANALISTA DE DATOS'],
  'COMPRAS':                             ['RESPONSABLE COMPRAS','ADMINISTRATIVO DE COMPRAS'],
  'MARKETING':                           ['GERENCIA MARKETING','ANALISTA MARKETING'],
  'MAESTRANZA':                          ['MAESTRANZA'],
  'COORDINACION GENERAL':                ['COORDINADOR GENERAL'],
  'DISTRIBUIDORA':                       ['PREVENTISTA','MERCHANDASING','REPOSITOR','SUPERVISOR DE VENTAS','CHOFER DE REPARTO','AYUDANTE DE REPARTO','ENCARGADO DE DEPOSITO','AYUDANTE DE DEPOSITO','CAJERO','JEFE DE SUCURSAL'],
  'HOTELERIA, GASTRONOMIA Y TURISMO':    ['MOZO/A','COCINERO','AYUDANTE DE COCINA','PANADERO/PASTELERO','RECEPCIONISTA','MUCAMO/A','MANTENIMIENTO','JARDINERO','MASAJISTA','ADMINISTRATIVO DE HOTEL','JEFE DE OPERACIONES HOTELERAS','ENCARGADO DE COMPRAS','SOMMELIER','EJECUTIVO DE ENOTURISMO','ENOLOGO','OBRERO DE VIÑEDOS','SERENO DE HOTEL'],
  'INDUSTRIA LACTEA':                    ['RESPONSABLE DE PLANTA','ADMINISTRATIVO DE PLANTA','OPERARIO DE ENVASADO','OPERARIO DE ETIQUETADO','OPERARIO DE FRACCIONADO','OPERARIO DE PRODUCCION','RESPONSABLE DE ALIMENTACION','RESPONSABLE DE CRIANZA','AYUDANTE DE CRIANZA','RESPONSABLE DE ORDEÑE','AYUDANTE DE ORDEÑE','SERENO DE TAMBO','AUXILIARES DE PRODUCCION','RESPONSABLE DE PRODUCCION','SUB RESPONSABLE DE PRODUCCION'],
};
const AREAS = Object.keys(AREAS_PUESTOS).sort();
const TODOS_LOS_PUESTOS = Array.from(new Set(Object.values(AREAS_PUESTOS).flat())).sort();

const NIVELES_FORMACION = ['Secundario','Terciario','Universitario','Formación Superior'];
const ESTADOS_SELECCION = [
  'En Curso','Entrevista RRHH','Entrevista Coordinador',
  'Terna Preseleccionados','Seleccionado','Descartado','Aprobado','Rechazado','Contratado'
];
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
  teams: { label:'Teams',       color:'bg-purple-600 hover:bg-purple-700', urlBase:'https://teams.microsoft.com/l/meeting/new', icon:'💼' },
  meet:  { label:'Google Meet', color:'bg-green-600 hover:bg-green-700',   urlBase:'https://meet.google.com/new', icon:'🎥' },
  zoom:  { label:'Zoom',        color:'bg-blue-600 hover:bg-blue-700',     urlBase:'https://zoom.us/start/videomeeting', icon:'📹' },
};
interface MeetingData { date:string; time:string; platform:'meet'|'zoom'|'teams'; notes:string; }

// ─── Interview Scheduler (reusable) ─────────────────────────────────────────
const InterviewScheduler: React.FC<{ cv:CV; label:string; onClose:()=>void }> = ({ cv, label, onClose }) => {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [meeting, setMeeting]     = useState<MeetingData>({ date:'', time:'10:00', platform:'teams', notes:'' });
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
  const buildUrl = () => {
    const subject    = `${label} — ${cv.nombre} ${cv.apellido} - ${cv.puestoSeleccionado||''}`;
    const bodyText   = `Tienes una Reunión`;

    if (meeting.platform === 'teams') {
      const email      = cv.email || cv.uploadedBy || '';
      const attendees  = email ? `&attendees=${encodeURIComponent(email)}` : '';
      // Construir startTime / endTime en formato ISO local (Teams espera YYYY-MM-DDTHH:MM:SS)
      const startISO   = meeting.date && meeting.time ? `${meeting.date}T${meeting.time}:00` : '';
      // Duración por defecto: 1 hora
      const endISO     = meeting.date && meeting.time
        ? (() => {
            const [h, m] = meeting.time.split(':').map(Number);
            const end = new Date(`${meeting.date}T${meeting.time}:00`);
            end.setHours(h + 1, m);
            return `${meeting.date}T${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}:00`;
          })()
        : '';
      const timeParams = startISO ? `&startTime=${encodeURIComponent(startISO)}&endTime=${encodeURIComponent(endISO)}` : '';
      return `https://teams.microsoft.com/l/meeting/new?subject=${encodeURIComponent(subject)}${timeParams}&content=${encodeURIComponent(bodyText)}${attendees}`;
    }

    return PLATFORM_CONFIG[meeting.platform].urlBase;
  };

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
type ExamResultado = 'Apto'|'Apto con observaciones'|'No Apto'|'';
const RESULTADO_CONFIG: Record<Exclude<ExamResultado,''>, {bg:string;border:string;text:string;icon:string}> = {
  'Apto':                  { bg:'bg-green-100', border:'border-green-500', text:'text-green-800',  icon:'✅' },
  'Apto con observaciones':{ bg:'bg-yellow-100',border:'border-yellow-500',text:'text-yellow-800', icon:'⚠️' },
  'No Apto':               { bg:'bg-red-100',   border:'border-red-500',   text:'text-red-800',    icon:'❌' },
};

const ExamModal: React.FC<{
  cv: CV;
  tipo: ExamType;
  onConfirm: (notas:string, fecha:string, resultado:ExamResultado) => void;
  onCancel: () => void;
  onCancelarExamen: () => void;
}> = ({ cv, tipo, onConfirm, onCancel, onCancelarExamen }) => {
  const yaAgendado   = tipo==='fisico' ? !!cv.examenFisico : !!cv.examenPsicotecnico;
  const notasInicial = tipo==='fisico' ? (cv.examenFisicoNotas||'') : (cv.examenPsicotecnicoNotas||'');
  const fechaInicial = tipo==='fisico'
    ? (cv.examenFisicoFecha ? new Date(cv.examenFisicoFecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
    : (cv.examenPsicotecnicoFecha ? new Date(cv.examenPsicotecnicoFecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const resultadoInicial: ExamResultado = tipo==='fisico'
    ? (cv.examenFisicoResultado||'')
    : (cv.examenPsicotecnicoResultado||'');

  const [notas,     setNotas]     = useState(notasInicial);
  const [fecha,     setFecha]     = useState(fechaInicial);
  const [resultado, setResultado] = useState<ExamResultado>(resultadoInicial);

  const cfg  = EXAM_BADGE[tipo];
  const icon = tipo==='fisico' ? <FlaskConical className="w-5 h-5"/> : <Brain className="w-5 h-5"/>;
  const resCfg = resultado ? RESULTADO_CONFIG[resultado] : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center flex-shrink-0 ${cfg.text}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{yaAgendado ? 'Editar' : 'Solicitar'} {cfg.label}</h3>
            <p className="text-sm text-gray-500">{cv.nombre} {cv.apellido} — DNI {cv.dni}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-3.5 h-3.5 inline mr-1"/>Fecha del examen *
            </label>
            <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"/>
          </div>
          {/* Resultado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resultado</label>
            <div className="flex gap-2">
              {(['','Apto','Apto con observaciones','No Apto'] as ExamResultado[]).map(r=>(
                r==='' ? (
                  <button key="none" onClick={()=>setResultado('')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border-2 transition-all
                      ${resultado===''?'border-gray-400 bg-gray-100 text-gray-700':'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}>
                    Pendiente
                  </button>
                ) : (
                  <button key={r} onClick={()=>setResultado(r)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border-2 transition-all
                      ${resultado===r
                        ? `${RESULTADO_CONFIG[r].bg} ${RESULTADO_CONFIG[r].border} ${RESULTADO_CONFIG[r].text}`
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                    {RESULTADO_CONFIG[r].icon} {r}
                  </button>
                )
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales (opcional)</label>
            <textarea value={notas} onChange={e=>setNotas(e.target.value)} rows={3}
              placeholder={`Indicaciones para el ${cfg.label.toLowerCase()}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none"/>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={()=>{if(!fecha){alert('Seleccioná una fecha');return;}onConfirm(notas,fecha,resultado);}}
            className={`flex-1 py-2.5 ${cfg.bg} border-2 ${cfg.border} ${cfg.text} font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 hover:opacity-80`}>
            {icon} {yaAgendado ? 'Actualizar' : 'Confirmar solicitud'}
          </button>
          <button onClick={onCancel} className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm">
            Cerrar
          </button>
        </div>
        {yaAgendado && (
          <button onClick={()=>{if(confirm(`¿Cancelar el ${cfg.label} de ${cv.nombre} ${cv.apellido}?`)) onCancelarExamen();}}
            className="mt-3 w-full py-2 text-red-600 border border-red-300 hover:bg-red-50 font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
            <X className="w-4 h-4"/> Cancelar {cfg.label}
          </button>
        )}
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

// ─── References Modal ────────────────────────────────────────────────────────
interface ReferenciaEntry { empresa: string; contacto: string; cargo: string; telefono: string; comentario: string; }
const emptyRef = (): ReferenciaEntry => ({ empresa:'', contacto:'', cargo:'', telefono:'', comentario:'' });

const ReferencesModal: React.FC<{
  cv: CV;
  onSave: (texto:string) => void;
  onClose: () => void;
}> = ({ cv, onSave, onClose }) => {
  const [refs, setRefs]         = useState<ReferenciaEntry[]>(() => {
    if (cv.referenciasLaborales) {
      try { return JSON.parse(cv.referenciasLaborales); } catch {}
    }
    return [emptyRef()];
  });
  const [mailTo, setMailTo]     = useState('');
  const [saving, setSaving]     = useState(false);

  const updateRef = (i:number, field:keyof ReferenciaEntry, val:string) =>
    setRefs(prev => prev.map((r,idx) => idx===i ? {...r,[field]:val} : r));

  const handleSave = async () => {
    setSaving(true);
    await onSave(JSON.stringify(refs));
    setSaving(false);
  };

  const handlePrint = () => {
    const win = window.open('','_blank','width=900,height=700');
    if (!win) return;
    const fechaHoy = new Date().toLocaleDateString('es-AR',{day:'numeric',month:'long',year:'numeric'});
    const refsHtml = refs.map((r,i) => `
      <div class="ref-block">
        <div class="ref-num">Referencia ${i+1}</div>
        <table class="ref-table">
          <tr><td class="label">Empresa / Empleador</td><td>${r.empresa||'—'}</td></tr>
          <tr><td class="label">Contacto</td><td>${r.contacto||'—'}</td></tr>
          <tr><td class="label">Cargo del contacto</td><td>${r.cargo||'—'}</td></tr>
          <tr><td class="label">Teléfono</td><td>${r.telefono||'—'}</td></tr>
          <tr><td class="label">Comentarios</td><td>${r.comentario||'—'}</td></tr>
        </table>
      </div>`).join('');
    win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
      <title>Referencias — ${cv.nombre} ${cv.apellido}</title>
      <style>
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Segoe UI',Arial,sans-serif; color:#1a1a2e; padding:32px; font-size:13px; }
        .header { border-bottom:3px solid #2d3a8c; padding-bottom:16px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:flex-end; }
        .header h1 { font-size:20px; color:#2d3a8c; }
        .header .meta { font-size:11px; color:#666; text-align:right; }
        .section { margin-bottom:18px; }
        .section-title { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:#2d3a8c; border-bottom:1px solid #c7d2fe; padding-bottom:4px; margin-bottom:10px; }
        .data-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px 24px; }
        .data-item { display:flex; gap:6px; }
        .data-label { color:#555; min-width:110px; }
        .data-value { font-weight:600; }
        .ref-block { background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:12px 16px; margin-bottom:12px; }
        .ref-num { font-weight:700; color:#2d3a8c; font-size:12px; margin-bottom:8px; }
        .ref-table { width:100%; border-collapse:collapse; }
        .ref-table td { padding:4px 6px; vertical-align:top; }
        .ref-table .label { color:#555; width:160px; font-size:12px; }
        .footer { margin-top:32px; padding-top:12px; border-top:1px solid #e2e8f0; font-size:11px; color:#999; text-align:center; }
        @media print { body { padding:20px; } }
      </style></head><body>
      <div class="header">
        <div><h1>Ficha de Referencias Laborales</h1><div style="font-size:13px;color:#444;margin-top:4px;">${cv.nombre} ${cv.apellido}</div></div>
        <div class="meta">Generado: ${fechaHoy}<br/>Manzur Administraciones</div>
      </div>
      <div class="section">
        <div class="section-title">Datos del Candidato</div>
        <div class="data-grid">
          <div class="data-item"><span class="data-label">DNI:</span><span class="data-value">${cv.dni}</span></div>
          <div class="data-item"><span class="data-label">Email:</span><span class="data-value">${cv.email||cv.uploadedBy||'—'}</span></div>
          <div class="data-item"><span class="data-label">Teléfono:</span><span class="data-value">(${cv.telefonoArea}) ${cv.telefonoNumero}</span></div>
          <div class="data-item"><span class="data-label">Nacimiento:</span><span class="data-value">${cv.fechaNacimiento}</span></div>
          <div class="data-item"><span class="data-label">Formación:</span><span class="data-value">${cv.nivelFormacion}</span></div>
          <div class="data-item"><span class="data-label">Residencia:</span><span class="data-value">${cv.lugarResidencia||'—'}</span></div>
          <div class="data-item"><span class="data-label">Área:</span><span class="data-value">${cv.area||'—'}</span></div>
          <div class="data-item"><span class="data-label">Puesto postulado:</span><span class="data-value">${cv.puestoSeleccionado||cv.subArea||'—'}</span></div>
          ${cv.estadoSeleccion?`<div class="data-item"><span class="data-label">Estado:</span><span class="data-value">${cv.estadoSeleccion}</span></div>`:''}
          ${cv.notasAdmin?`<div class="data-item" style="grid-column:1/-1"><span class="data-label">Notas admin:</span><span class="data-value">${cv.notasAdmin}</span></div>`:''}
        </div>
      </div>
      <div class="section">
        <div class="section-title">Referencias Laborales</div>
        ${refsHtml || '<p style="color:#999;font-style:italic">Sin referencias cargadas.</p>'}
      </div>
      <div class="footer">Documento generado por el sistema de selección de Manzur Administraciones</div>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(()=>win.print(), 400);
  };

  const handleMail = () => {
    if (!mailTo.trim()) { alert('Ingresá un email de destino'); return; }
    const subject = encodeURIComponent(`Referencias Laborales — ${cv.nombre} ${cv.apellido}`);
    const lines: string[] = [
      `FICHA DE REFERENCIAS LABORALES`,
      ``,
      `Candidato: ${cv.nombre} ${cv.apellido}`,
      `DNI: ${cv.dni}`,
      `Teléfono: (${cv.telefonoArea}) ${cv.telefonoNumero}`,
      `Email: ${cv.email||cv.uploadedBy||'—'}`,
      `Formación: ${cv.nivelFormacion}`,
      `Residencia: ${cv.lugarResidencia||'—'}`,
      `Área: ${cv.area||'—'}`,
      `Puesto: ${cv.puestoSeleccionado||cv.subArea||'—'}`,
      ``,
      `─────────────────────────────`,
      `REFERENCIAS LABORALES`,
      `─────────────────────────────`,
    ];
    refs.forEach((r,i) => {
      lines.push(``, `Referencia ${i+1}:`);
      if (r.empresa)    lines.push(`  Empresa/Empleador: ${r.empresa}`);
      if (r.contacto)   lines.push(`  Contacto:          ${r.contacto}`);
      if (r.cargo)      lines.push(`  Cargo del contacto:${r.cargo}`);
      if (r.telefono)   lines.push(`  Teléfono:          ${r.telefono}`);
      if (r.comentario) lines.push(`  Comentarios:       ${r.comentario}`);
    });
    lines.push(``, `—`, `Manzur Administraciones`);
    window.open(`mailto:${encodeURIComponent(mailTo)}?subject=${subject}&body=${encodeURIComponent(lines.join('\n'))}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-400 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-5 h-5 text-blue-700"/>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">Referencias Laborales</h3>
              <p className="text-sm text-gray-500">{cv.nombre} {cv.apellido} — {cv.puestoSeleccionado||cv.subArea||'Sin puesto asignado'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5"/></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">

          {/* Ficha candidato */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3">Datos del Candidato</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              <div><span className="text-gray-500">DNI:</span> <span className="font-medium">{cv.dni}</span></div>
              <div><span className="text-gray-500">Teléfono:</span> <span className="font-medium">({cv.telefonoArea}) {cv.telefonoNumero}</span></div>
              <div><span className="text-gray-500">Nacimiento:</span> <span className="font-medium">{cv.fechaNacimiento}</span></div>
              <div><span className="text-gray-500">Formación:</span> <span className="font-medium">{cv.nivelFormacion}</span></div>
              <div><span className="text-gray-500">Residencia:</span> <span className="font-medium">{cv.lugarResidencia||'—'}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{cv.email||cv.uploadedBy||'—'}</span></div>
              <div><span className="text-gray-500">Área:</span> <span className="font-medium">{cv.area||'—'}</span></div>
              <div><span className="text-gray-500">Puesto:</span> <span className="font-medium text-blue-800">{cv.puestoSeleccionado||cv.subArea||'—'}</span></div>
              {cv.estadoSeleccion&&<div><span className="text-gray-500">Estado:</span> <span className="font-medium">{cv.estadoSeleccion}</span></div>}
              {cv.notasAdmin&&<div className="col-span-2"><span className="text-gray-500">Notas:</span> <span className="font-medium">{cv.notasAdmin}</span></div>}
            </div>
          </div>

          {/* Referencias */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Referencias Laborales</p>
              <button onClick={()=>setRefs(r=>[...r,emptyRef()])}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-300 rounded-lg px-2.5 py-1 hover:bg-blue-50 transition-colors">
                + Agregar referencia
              </button>
            </div>

            <div className="space-y-4">
              {refs.map((r,i)=>(
                <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase">Referencia {i+1}</span>
                    {refs.length>1&&(
                      <button onClick={()=>setRefs(prev=>prev.filter((_,idx)=>idx!==i))}
                        className="text-red-400 hover:text-red-600 transition-colors">
                        <X className="w-3.5 h-3.5"/>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Empresa / Empleador</label>
                      <input value={r.empresa} onChange={e=>updateRef(i,'empresa',e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del contacto</label>
                      <input value={r.contacto} onChange={e=>updateRef(i,'contacto',e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cargo del contacto</label>
                      <input value={r.cargo} onChange={e=>updateRef(i,'cargo',e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
                      <input value={r.telefono} onChange={e=>updateRef(i,'telefono',e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Comentarios obtenidos</label>
                      <textarea value={r.comentario} onChange={e=>updateRef(i,'comentario',e.target.value)}
                        rows={3} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enviar por mail */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Enviar por email</p>
            <div className="flex gap-2">
              <input value={mailTo} onChange={e=>setMailTo(e.target.value)}
                placeholder="destinatario@ejemplo.com"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"/>
              <button onClick={handleMail}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors flex-shrink-0">
                <Mail className="w-4 h-4"/>Enviar
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 flex-shrink-0 gap-3">
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
            <Printer className="w-4 h-4"/>Exportar PDF
          </button>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Cerrar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
              <Check className="w-4 h-4"/>{saving?'Guardando...':'Guardar referencias'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Selection Editor (must be outside AdminPanel to avoid focus loss) ────────
const SelectionEditor: React.FC<{
  cv: CV;
  availableEstados: string[];
  onSave: (data:{puesto:string;estado:string;notas:string}) => void;
  onCancel: () => void;
}> = ({ cv, availableEstados, onSave, onCancel }) => {
  // Puesto puede ser varios separados por coma
  const puestosIniciales = cv.puestoSeleccionado
    ? cv.puestoSeleccionado.split(',').map(p=>p.trim()).filter(Boolean)
    : cv.subArea ? [cv.subArea] : [];

  // Detectar área inicial buscando los puestos en AREAS_PUESTOS
  const areaInicial = (() => {
    for (const [area, puestos] of Object.entries(AREAS_PUESTOS)) {
      if (puestosIniciales.some(p => puestos.includes(p))) return area;
    }
    return AREAS.find(a => a.toLowerCase() === cv.area?.toLowerCase()) || '';
  })();

  const [areaSelec,    setAreaSelec]    = useState(areaInicial);
  const [puestosSelec, setPuestosSelec] = useState<string[]>(puestosIniciales);
  const [estado,       setEstado]       = useState(cv.estadoSeleccion||availableEstados[0]||'En Curso');
  const [notas,        setNotas]        = useState(cv.notasAdmin||'');

  const puestosDeArea = areaSelec ? (AREAS_PUESTOS[areaSelec] || []) : [];

  const togglePuesto = (p: string) =>
    setPuestosSelec(prev => prev.includes(p) ? prev.filter(x=>x!==p) : [...prev, p]);

  const handleAreaChange = (nuevaArea: string) => {
    setAreaSelec(nuevaArea);
    const validos = AREAS_PUESTOS[nuevaArea] || [];
    setPuestosSelec(prev => prev.filter(p => validos.includes(p)));
  };

  return (
    <div className="p-4 border-t border-manzur-secondary bg-gray-50">
      <h4 className="font-medium text-manzur-primary mb-3">Gestionar Proceso de Selección</h4>
      <div className="space-y-3">

        {/* Área */}
        <div>
          <label className="block text-sm font-medium mb-1">Área *</label>
          <select value={areaSelec} onChange={e=>handleAreaChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">Seleccione un área</option>
            {AREAS.map(a=><option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Puestos — checkboxes multi-selección */}
        {areaSelec && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Puesto/s *
              {puestosSelec.length > 0 && (
                <span className="ml-2 text-xs font-normal text-green-700 bg-green-100 border border-green-300 rounded-full px-2 py-0.5">
                  {puestosSelec.length} seleccionado{puestosSelec.length!==1?'s':''}
                </span>
              )}
            </label>
            {cv.subArea && !cv.puestoSeleccionado && (
              <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-1 mb-2">
                📋 El candidato se postuló como: <strong>{cv.subArea}</strong>
              </p>
            )}
            <div className="border border-gray-200 rounded-lg bg-white max-h-48 overflow-y-auto divide-y divide-gray-100">
              {puestosDeArea.map(p => (
                <label key={p} className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${puestosSelec.includes(p)?'bg-green-50':''}`}>
                  <input type="checkbox" checked={puestosSelec.includes(p)} onChange={()=>togglePuesto(p)}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"/>
                  <span className={`text-sm ${puestosSelec.includes(p)?'font-semibold text-green-800':'text-gray-700'}`}>{p}</span>
                </label>
              ))}
            </div>
            {puestosSelec.length > 0 && (
              <p className="mt-1.5 text-xs text-gray-500">
                Seleccionados: <span className="font-medium text-gray-700">{puestosSelec.join(' · ')}</span>
              </p>
            )}
          </div>
        )}

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select value={estado} onChange={e=>setEstado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {availableEstados.map(e=><option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
          <textarea value={notas} onChange={e=>setNotas(e.target.value)}
            rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/>
        </div>

        <div className="flex gap-2">
          <button onClick={()=>{
              if(!puestosSelec.length){alert('Seleccioná al menos un puesto');return;}
              onSave({puesto:puestosSelec.join(', '),estado,notas});
            }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-green-600 hover:bg-green-700">
            <Check className="w-4 h-4"/>Guardar
          </button>
          <button onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg bg-gray-200 hover:bg-gray-300">
            <X className="w-4 h-4"/>Cancelar
          </button>
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
  const [selectedPuesto, setSelectedPuesto]       = useState('Todos');
  const [loading, setLoading]                     = useState(true);
  const [editingCV, setEditingCV]                 = useState<string|null>(null);
  const [schedulingCV, setSchedulingCV]           = useState<string|null>(null);
  const [discardingCV, setDiscardingCV]           = useState<CV|null>(null);
  const [examModal, setExamModal]                 = useState<{cv:CV; tipo:ExamType}|null>(null);
  const [referencesCV, setReferencesCV]           = useState<CV|null>(null);

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
  };

  const handleSaveSelection = async (cvId:string, data:{puesto:string;estado:string;notas:string}) => {
    if(!data.puesto.trim()){alert('Debe ingresar el puesto');return;}
    try {
      const r=await fetch('/api/cv/update-selection',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({cvId,puestoSeleccionado:data.puesto,estadoSeleccion:data.estado,notasAdmin:data.notas}),
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
  const handleSaveExam = async (cv:CV, tipo:ExamType, notas:string, fecha:string, resultado:ExamResultado) => {
    const field           = tipo==='fisico' ? 'examenFisico'              : 'examenPsicotecnico';
    const fieldFecha      = tipo==='fisico' ? 'examenFisicoFecha'         : 'examenPsicotecnicoFecha';
    const fieldNotas      = tipo==='fisico' ? 'examenFisicoNotas'         : 'examenPsicotecnicoNotas';
    const fieldResultado  = tipo==='fisico' ? 'examenFisicoResultado'     : 'examenPsicotecnicoResultado';
    const fechaISO = fecha ? new Date(fecha+'T00:00:00').toISOString() : new Date().toISOString();
    try {
      const r=await fetch('/api/cv/update-exam',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ cvId:cv.id, [field]:true, [fieldFecha]:fechaISO, [fieldNotas]:notas, [fieldResultado]:resultado }),
      });
      if(r.ok){setExamModal(null);fetchCVs();}
      else{const d=await r.json();alert(d.error||'Error al guardar examen');}
    } catch { alert('Error al guardar examen'); }
  };

  const handleCancelarExamen = async (cv:CV, tipo:ExamType) => {
    const field           = tipo==='fisico' ? 'examenFisico'          : 'examenPsicotecnico';
    const fieldFecha      = tipo==='fisico' ? 'examenFisicoFecha'     : 'examenPsicotecnicoFecha';
    const fieldNotas      = tipo==='fisico' ? 'examenFisicoNotas'     : 'examenPsicotecnicoNotas';
    const fieldResultado  = tipo==='fisico' ? 'examenFisicoResultado' : 'examenPsicotecnicoResultado';
    try {
      const r=await fetch('/api/cv/update-exam',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ cvId:cv.id, [field]:false, [fieldFecha]:null, [fieldNotas]:'', [fieldResultado]:'' }),
      });
      if(r.ok){setExamModal(null);fetchCVs();}
      else{const d=await r.json();alert(d.error||'Error al cancelar examen');}
    } catch { alert('Error al cancelar examen'); }
  };

  const handleSaveReferencias = async (cvId:string, texto:string) => {
    try {
      const r = await fetch('/api/cv/update-selection',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ cvId, referenciasLaborales: texto }),
      });
      if(r.ok) fetchCVs();
      else { const d=await r.json(); alert(d.error||'Error al guardar referencias'); }
    } catch { alert('Error al guardar referencias'); }
  };

  const handleSetPrioridad = async (cvId:string, prioridad:number) => {
    try {
      await fetch('/api/cv/update-selection',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({cvId, prioridadTerna: prioridad}),
      });
      fetchCVs();
    } catch { alert('Error al guardar prioridad'); }
  };

  // ── Enviar mail ───────────────────────────────────────────────────────────
  const handleSendMail = (cv:CV) => {
    const email = cv.email || cv.uploadedBy;
    if(!email){alert('No hay email registrado para este candidato.');return;}
    const subject = encodeURIComponent(`Proceso de selección — ${cv.puestoSeleccionado||'Manzur Administraciones'}`);
    const examLines:string[] = [];
    if(cv.examenFisico && cv.examenFisicoFecha)
      examLines.push(`• Examen Físico: ${new Date(cv.examenFisicoFecha).toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}`);
    if(cv.examenPsicotecnico && cv.examenPsicotecnicoFecha)
      examLines.push(`• Examen Psicotécnico: ${new Date(cv.examenPsicotecnicoFecha).toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}`);
    const examSection = examLines.length > 0
      ? `\nTenés agendados los siguientes exámenes:\n${examLines.join('\n')}\n`
      : '';
    const body = encodeURIComponent(`Estimado/a ${cv.nombre} ${cv.apellido},\n\n${examSection}\n`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`,'_blank');
  };

  // ── Filtros ───────────────────────────────────────────────────────────────
  const base = (list:CV[]) => list.filter(cv=>{
    if(selectedArea!=='Todos'&&cv.area!==selectedArea) return false;
    if(selectedFormacion!=='Todos'&&cv.nivelFormacion!==selectedFormacion) return false;
    return true;
  });

  const allCvs        = base(cvs.filter(cv=>!cv.puestoSeleccionado&&cv.estadoSeleccion!=='Descartado'));
  const entRRHH       = base(cvs.filter(cv=>cv.estadoSeleccion==='Entrevista RRHH'));
  const entCoord      = base(cvs.filter(cv=>cv.estadoSeleccion==='Entrevista Coordinador'));
  const terna         = base(cvs.filter(cv=>cv.estadoSeleccion==='Terna Preseleccionados'));
  const seleccionados = base(cvs.filter(cv=>cv.estadoSeleccion==='Seleccionado'));
  const descartados   = base(cvs.filter(cv=>cv.estadoSeleccion==='Descartado'));

  // CVs de la pestaña activa antes del filtro de puesto
  const cvsSinFiltroPuesto =
    activeTab==='todos'           ? allCvs :
    activeTab==='entrevistaRRHH'  ? entRRHH :
    activeTab==='entrevistaCoord' ? entCoord :
    activeTab==='terna'           ? terna :
    activeTab==='seleccionados'   ? seleccionados : descartados;

  // Puestos disponibles según el área seleccionada (solo en pestañas != todos)
  const puestosDisponibles = activeTab !== 'todos'
    ? Array.from(new Set(
        cvsSinFiltroPuesto
          .map(cv => cv.puestoSeleccionado || cv.subArea || '')
          .filter(Boolean)
      )).sort()
    : [];

  // Aplicar filtro de puesto (solo en pestañas != todos)
  const displayCvs = activeTab !== 'todos' && selectedPuesto !== 'Todos'
    ? cvsSinFiltroPuesto.filter(cv =>
        (cv.puestoSeleccionado || cv.subArea || '') === selectedPuesto
      )
    : cvsSinFiltroPuesto;

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
    const resFisicoCfg = cv.examenFisicoResultado ? RESULTADO_CONFIG[cv.examenFisicoResultado] : null;
    const resPsiCfg    = cv.examenPsicotecnicoResultado ? RESULTADO_CONFIG[cv.examenPsicotecnicoResultado] : null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {hasFisico&&(
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${EXAM_BADGE.fisico.bg} ${EXAM_BADGE.fisico.border} ${EXAM_BADGE.fisico.text}`}>
            <FlaskConical className="w-3.5 h-3.5"/>
            {EXAM_BADGE.fisico.label}
            {cv.examenFisicoFecha&&(
              <span className="font-normal opacity-75">· {new Date(cv.examenFisicoFecha).toLocaleDateString('es-AR',{day:'numeric',month:'short',year:'numeric'})}</span>
            )}
            {resFisicoCfg&&(
              <span className={`ml-1 px-1.5 py-0.5 rounded-full border text-xs font-semibold ${resFisicoCfg.bg} ${resFisicoCfg.border} ${resFisicoCfg.text}`}>
                {resFisicoCfg.icon} {cv.examenFisicoResultado}
              </span>
            )}
          </div>
        )}
        {hasPsi&&(
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${EXAM_BADGE.psicotecnico.bg} ${EXAM_BADGE.psicotecnico.border} ${EXAM_BADGE.psicotecnico.text}`}>
            <Brain className="w-3.5 h-3.5"/>
            {EXAM_BADGE.psicotecnico.label}
            {cv.examenPsicotecnicoFecha&&(
              <span className="font-normal opacity-75">· {new Date(cv.examenPsicotecnicoFecha).toLocaleDateString('es-AR',{day:'numeric',month:'short',year:'numeric'})}</span>
            )}
            {resPsiCfg&&(
              <span className={`ml-1 px-1.5 py-0.5 rounded-full border text-xs font-semibold ${resPsiCfg.bg} ${resPsiCfg.border} ${resPsiCfg.text}`}>
                {resPsiCfg.icon} {cv.examenPsicotecnicoResultado}
              </span>
            )}
          </div>
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

            {/* Indicador de referencias cargadas */}
            {cv.referenciasLaborales&&(()=>{
              try {
                const refs: ReferenciaEntry[] = JSON.parse(cv.referenciasLaborales!);
                const cargadas = refs.filter(r=>r.empresa||r.contacto||r.comentario);
                if (!cargadas.length) return null;
                return (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0"/>
                    <span>{cargadas.length} referencia{cargadas.length!==1?'s':''} cargada{cargadas.length!==1?'s':''}</span>
                  </div>
                );
              } catch { return null; }
            })()}

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

            {/* Referencias — solo en Entrevista RRHH */}
            {activeTab==='entrevistaRRHH'&&(
              <button onClick={()=>setReferencesCV(cv)} title="Ficha de referencias"
                className={`px-3 py-2 text-sm rounded-lg border-2 transition-colors font-medium
                  ${cv.referenciasLaborales
                    ? 'bg-blue-100 border-blue-400 text-blue-800'
                    : 'bg-white border-blue-300 text-blue-600 hover:bg-blue-50'}`}>
                <FileText className="w-4 h-4"/>
              </button>
            )}

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

            {/* Quitar del proceso — todas las pestañas con proceso activo */}
            {activeTab!=='todos'&&activeTab!=='descartados'&&(
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
          <SelectionEditor
            cv={cv}
            availableEstados={getAvailableEstados(activeTab)}
            onSave={(data)=>handleSaveSelection(cv.id!,data)}
            onCancel={()=>setEditingCV(null)}
          />
        )}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {discardingCV&&<DiscardModal cv={discardingCV} onConfirm={(m,n)=>handleDiscard(discardingCV,m,n)} onCancel={()=>setDiscardingCV(null)}/>}
      {examModal&&<ExamModal cv={examModal.cv} tipo={examModal.tipo}
        onConfirm={(n,f,res)=>handleSaveExam(examModal.cv,examModal.tipo,n,f,res)}
        onCancel={()=>setExamModal(null)}
        onCancelarExamen={()=>handleCancelarExamen(examModal.cv,examModal.tipo)}/>}
      {referencesCV&&<ReferencesModal
        cv={referencesCV}
        onSave={async(texto)=>{ await handleSaveReferencias(referencesCV.id!,texto); }}
        onClose={()=>setReferencesCV(null)}/>}

      {/* Pestañas */}
      <div className="flex flex-wrap border-b-2 border-gray-200">
        {TABS.map(tab=>(
          <button key={tab.id} onClick={()=>{ setActiveTab(tab.id); setSelectedPuesto('Todos'); }}
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

        {/* Área — siempre visible */}
        <div className="flex items-center gap-2">
          <label className="font-medium text-manzur-primary text-sm">Área:</label>
          <select value={selectedArea} onChange={e=>{ setSelectedArea(e.target.value); setSelectedPuesto('Todos'); }}
            className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg">
            <option value="Todos">Todas</option>
            {AREAS.map(a=><option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Formación — solo en "Todos los CVs" */}
        {activeTab==='todos' && (
          <div className="flex items-center gap-2">
            <label className="font-medium text-manzur-primary text-sm">Formación:</label>
            <select value={selectedFormacion} onChange={e=>setSelectedFormacion(e.target.value)}
              className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg">
              <option value="Todos">Todas</option>
              {NIVELES_FORMACION.map(n=><option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}

        {/* Puesto — solo en pestañas != todos, dependiente del área */}
        {activeTab !== 'todos' && puestosDisponibles.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="font-medium text-manzur-primary text-sm">Puesto:</label>
            <select value={selectedPuesto} onChange={e=>setSelectedPuesto(e.target.value)}
              className="px-3 py-2 text-sm border border-manzur-secondary rounded-lg max-w-[260px]">
              <option value="Todos">Todos</option>
              {puestosDisponibles.map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        )}

        <button onClick={fetchCVs}
          className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg bg-manzur-primary hover:bg-manzur-secondary transition-colors ml-auto">
          <RefreshCw className="w-4 h-4"/>Actualizar
        </button>
      </div>

      <div className="text-sm text-manzur-primary">Total: {displayCvs.length} CV{displayCvs.length!==1?'s':''}</div>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando...</p>
      ) : displayCvs.length===0 ? (
        <p className="text-center text-gray-500 py-8">
          {activeTab==='todos'?'No hay CVs disponibles'
          :activeTab==='entrevistaRRHH'?'No hay candidatos en Entrevista RRHH'
          :activeTab==='entrevistaCoord'?'No hay candidatos en Entrevista Coordinador'
          :activeTab==='terna'?'No hay candidatos en la terna'
          :activeTab==='seleccionados'?'No hay candidatos seleccionados aún'
          :'No hay candidatos descartados'}
        </p>
      ) : activeTab==='terna' ? (
        // ── Terna: agrupado y ordenado por área → puesto, con prioridad ─────
        (() => {
          // Agrupar por área+puesto, ordenado alfabéticamente
          const grupos: Record<string, CV[]> = {};
          [...displayCvs]
            .sort((a,b)=>{
              const aKey = `${a.area||''}|${a.puestoSeleccionado||a.subArea||''}`;
              const bKey = `${b.area||''}|${b.puestoSeleccionado||b.subArea||''}`;
              return aKey.localeCompare(bKey,'es');
            })
            .forEach(cv=>{
              const key = `${cv.area||'Sin área'} — ${cv.puestoSeleccionado||cv.subArea||'Sin puesto'}`;
              if(!grupos[key]) grupos[key]=[];
              grupos[key].push(cv);
            });

          return Object.entries(grupos).map(([grupKey, grupCvs])=>{
            // Ordenar dentro del grupo por prioridad (los sin prioridad al final)
            const ordered = [...grupCvs].sort((a,b)=>{
              const pa = a.prioridadTerna ?? 9999;
              const pb = b.prioridadTerna ?? 9999;
              return pa - pb;
            });
            return (
              <div key={grupKey} className="mb-8">
                <h3 className="text-lg font-bold mb-3 pb-2 border-b-2 border-amber-300 text-amber-800 flex items-center gap-2">
                  <Trophy className="w-4 h-4"/>
                  {grupKey}
                  <span className="ml-1 text-sm font-normal text-amber-600">({grupCvs.length} candidato{grupCvs.length!==1?'s':''})</span>
                </h3>
                <div className="space-y-3">
                  {ordered.map((cv, idx)=>(
                    <div key={cv.id} className="flex items-stretch gap-3">
                      {/* Control de prioridad */}
                      <div className="flex flex-col items-center justify-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-2 py-2 min-w-[52px]">
                        <span className={`text-lg font-black leading-none ${cv.prioridadTerna ? 'text-amber-700' : 'text-gray-300'}`}>
                          {cv.prioridadTerna ?? '—'}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            disabled={idx===0}
                            onClick={()=>{
                              // Subir: intercambiar prioridades con el anterior
                              const prev = ordered[idx-1];
                              const myPrio  = cv.prioridadTerna  ?? idx+1;
                              const prevPrio= prev.prioridadTerna ?? idx;
                              handleSetPrioridad(cv.id!, prevPrio);
                              handleSetPrioridad(prev.id!, myPrio);
                            }}
                            title="Subir prioridad"
                            className="p-0.5 rounded hover:bg-amber-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                            <ChevronUp className="w-3.5 h-3.5 text-amber-700"/>
                          </button>
                          <button
                            disabled={idx===ordered.length-1}
                            onClick={()=>{
                              // Bajar: intercambiar prioridades con el siguiente
                              const next = ordered[idx+1];
                              const myPrio   = cv.prioridadTerna  ?? idx+1;
                              const nextPrio = next.prioridadTerna ?? idx+2;
                              handleSetPrioridad(cv.id!, nextPrio);
                              handleSetPrioridad(next.id!, myPrio);
                            }}
                            title="Bajar prioridad"
                            className="p-0.5 rounded hover:bg-amber-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                            <ChevronRight className="w-3.5 h-3.5 text-amber-700 rotate-90"/>
                          </button>
                        </div>
                      </div>
                      {/* Card normal */}
                      <div className="flex-1 min-w-0">
                        <CVCard cv={cv}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          });
        })()
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