// components/AdminPanel/InterviewScheduler.tsx
import React, { useState } from 'react';
import { Calendar, Clock, Video, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { CV, MeetingData } from '@/lib/types';
import { PLATFORM_CONFIG } from '@/lib/constants';
import { InterviewSchedulerProps} from './types';

export const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({ cv, label, onClose }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [meeting, setMeeting] = useState<MeetingData>({ date: '', time: '10:00', platform: 'teams', notes: '' });
  const [scheduled, setScheduled] = useState(false);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };
  const selectDate = (day: number) => setMeeting(m => ({ ...m, date: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` }));
  const isToday = (day: number) => today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
  const isPast = (day: number) => { const d = new Date(viewYear, viewMonth, day); d.setHours(0, 0, 0, 0); const t = new Date(); t.setHours(0, 0, 0, 0); return d < t; };
  const selectedDateStr = meeting.date ? new Date(meeting.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : null;

  const buildUrl = () => {
    const subject = `${label} — ${cv.nombre} ${cv.apellido} - ${cv.puestoSeleccionado || ''}`;
    const bodyText = `Tienes una Reunión`;

    if (meeting.platform === 'teams') {
      const email = cv.email || cv.uploadedBy || '';
      const attendees = email ? `&attendees=${encodeURIComponent(email)}` : '';
      const startISO = meeting.date && meeting.time ? `${meeting.date}T${meeting.time}:00` : '';
      const endISO = meeting.date && meeting.time
        ? (() => {
            const [h, m] = meeting.time.split(':').map(Number);
            const end = new Date(`${meeting.date}T${meeting.time}:00`);
            end.setHours(h + 1, m);
            return `${meeting.date}T${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}:00`;
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
          <p className="font-semibold text-purple-900">¡Reunión agendada!</p>
          <p className="text-sm text-gray-600 mt-1">{selectedDateStr} a las {meeting.time} hs — {PLATFORM_CONFIG[meeting.platform].label}</p>
          <button onClick={() => setScheduled(false)} className="mt-4 text-sm text-purple-700 underline">Volver al calendario</button>
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
              {dayNames.map(d => <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = meeting.date === dateStr;
                const past = isPast(day);
                return (
                  <button
                    key={day}
                    disabled={past}
                    onClick={() => selectDate(day)}
                    className={`text-xs py-1.5 rounded transition-colors
                      ${past ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-purple-200 cursor-pointer'}
                      ${isToday(day) && !isSelected ? 'ring-1 ring-purple-400 font-bold' : ''}
                      ${isSelected ? 'bg-purple-600 text-white font-bold' : 'text-gray-700'}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            {meeting.date && <p className="mt-2 text-xs text-purple-700 capitalize">{selectedDateStr}</p>}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1"><Clock className="w-3 h-3 inline mr-1"/>Horario</label>
              <input
                type="time"
                value={meeting.time}
                onChange={e => setMeeting(m => ({ ...m, time: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2"><Video className="w-3 h-3 inline mr-1"/>Plataforma</label>
              <div className="flex gap-2">
                {(Object.keys(PLATFORM_CONFIG) as Array<keyof typeof PLATFORM_CONFIG>).map(key => (
                  <button
                    key={key}
                    onClick={() => setMeeting(m => ({ ...m, platform: key }))}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium border-2 transition-all
                      ${meeting.platform === key ? 'border-purple-600 bg-purple-100 text-purple-900' : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'}`}
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              />
            </div>

            <button
              onClick={() => { if (!meeting.date || !meeting.time) return; setScheduled(true); window.open(buildUrl(), '_blank'); }}
              disabled={!meeting.date || !meeting.time}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all
                ${meeting.date && meeting.time ? `${PLATFORM_CONFIG[meeting.platform].color} shadow-md` : 'bg-gray-300 cursor-not-allowed'}`}
            >
              <Video className="w-4 h-4"/>Crear reunión en {PLATFORM_CONFIG[meeting.platform].label}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};