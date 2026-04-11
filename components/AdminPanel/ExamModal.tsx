// components/AdminPanel/ExamModal.tsx
import React, { useState } from 'react';
import { Calendar, Clock, Mail, X, FlaskConical, Brain } from 'lucide-react';
import { CV } from '@/lib/types';
import { EXAM_BADGE, RESULTADO_CONFIG } from '@/lib/constants';
import { ExamModalProps } from './types';

export const ExamModal: React.FC<ExamModalProps> = ({ cv, tipo, onConfirm, onCancel, onCancelarExamen }) => {
  const yaAgendado = tipo === 'fisico' ? !!cv.examenFisico : !!cv.examenPsicotecnico;
  const notasInicial = tipo === 'fisico' ? (cv.examenFisicoNotas || '') : (cv.examenPsicotecnicoNotas || '');
  const fechaInicial = tipo === 'fisico'
    ? (cv.examenFisicoFecha ? new Date(cv.examenFisicoFecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
    : (cv.examenPsicotecnicoFecha ? new Date(cv.examenPsicotecnicoFecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

  const [notas, setNotas] = useState(notasInicial);
  const [fecha, setFecha] = useState(fechaInicial);
  const [hora, setHora] = useState('08:00');
  const [empresa, setEmpresa] = useState('');
  const [direccion, setDireccion] = useState('');
  const [resultado, setResultado] = useState<'Apto' | 'Apto con observaciones' | 'No Apto' | ''>('');

  const cfg = EXAM_BADGE[tipo];
  const icon = tipo === 'fisico' ? <FlaskConical className="w-5 h-5"/> : <Brain className="w-5 h-5"/>;

  const formatFechaES = (isoDate: string) => {
    if (!isoDate) return '';
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleEnviarMail = () => {
    const email = cv.email || cv.uploadedBy;
    const nombre = `${cv.nombre} ${cv.apellido}`;

    let subject = '';
    let body = '';

    if (tipo === 'fisico') {
      if (!fecha || !hora || !empresa || !direccion) {
        alert('Completá fecha, hora, empresa y dirección antes de enviar el mail.');
        return;
      }
      subject = 'Estudios Preocupacionales — Proceso de Selección Manzur Administraciones';
      body = `Hola ${nombre},\n\n¡Felicitaciones! Queremos contarte que avanzaste a la siguiente etapa del proceso de selección.\n\nEn esta instancia deberás realizar los estudios preocupacionales, según el siguiente detalle:\n\nFecha: ${formatFechaES(fecha)}\nHora: ${hora} hs\nLugar: ${empresa}\nDirección: ${direccion}\n\nPor favor, presentate con DNI, en ayunas y con la primera orina de la mañana.\nTe pedimos además asistir sin acompañantes, con buena higiene personal y, en caso de usar anteojos, concurrir con los mismos.\nEs importante contar con puntualidad para esta instancia.\nAnte cualquier inconveniente o imposibilidad de asistir, te solicitamos informarlo con anticipación.\n\nSaludos,`;
    } else {
      subject = 'Evaluación Psicotécnica — Proceso de Selección Manzur Administraciones';
      body = `Hola ${nombre},\n\n¡Felicitaciones! Queremos contarte que avanzaste a la siguiente etapa del proceso de selección.\n\nLa próxima instancia corresponde a la evaluación psicotécnica. En breve serás contactado/a para coordinar día, horario y lugar de realización.\nTe pedimos estar atento/a a los medios de contacto informados en tu postulación.\n\nSaludos,`;
    }

    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 my-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center flex-shrink-0 ${cfg.text}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{yaAgendado ? 'Editar' : 'Solicitar'} {cfg.label}</h3>
            <p className="text-sm text-gray-500">{cv.nombre} {cv.apellido} — DNI {cv.dni}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-3.5 h-3.5 inline mr-1"/>Fecha del examen *
            </label>
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {tipo === 'fisico' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-3.5 h-3.5 inline mr-1"/>Hora *
                </label>
                <input
                  type="time"
                  value={hora}
                  onChange={e => setHora(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa / Centro médico *</label>
                <input
                  type="text"
                  value={empresa}
                  onChange={e => setEmpresa(e.target.value)}
                  placeholder="Ej: Centro Médico San Martín"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                <input
                  type="text"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  placeholder="Ej: Av. Belgrano 123, San Salvador de Jujuy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resultado</label>
            <div className="flex gap-2">
              {(['', 'Apto', 'Apto con observaciones', 'No Apto'] as const).map(r => (
                r === '' ? (
                  <button
                    key="none"
                    onClick={() => setResultado('')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border-2 transition-all
                      ${resultado === '' ? 'border-gray-400 bg-gray-100 text-gray-700' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}
                  >
                    Pendiente
                  </button>
                ) : (
                  <button
                    key={r}
                    onClick={() => setResultado(r)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border-2 transition-all
                      ${resultado === r
                        ? `${RESULTADO_CONFIG[r].bg} ${RESULTADO_CONFIG[r].border} ${RESULTADO_CONFIG[r].text}`
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                  >
                    {RESULTADO_CONFIG[r].icon} {r}
                  </button>
                )
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales (opcional)</label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={2}
              placeholder={`Indicaciones para el ${cfg.label.toLowerCase()}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div className={`rounded-lg border p-3 text-xs ${cfg.bg} ${cfg.border}`}>
            <p className={`font-semibold mb-1 flex items-center gap-1 ${cfg.text}`}>
              <Mail className="w-3.5 h-3.5"/>Vista previa del mail
            </p>
            {tipo === 'fisico' ? (
              <p className="text-gray-600 leading-relaxed">
                Se notificará a <strong>{cv.email || cv.uploadedBy}</strong> con fecha
                {fecha ? ` ${formatFechaES(fecha)}` : ' (sin fecha)'}, a las <strong>{hora} hs</strong>
                {empresa ? ` en ${empresa}` : ''}{direccion ? `, ${direccion}` : ''}.
              </p>
            ) : (
              <p className="text-gray-600 leading-relaxed">
                Se notificará a <strong>{cv.email || cv.uploadedBy}</strong> que avanzó a evaluación psicotécnica y será contactado/a para coordinar.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-5 flex-wrap">
          <button
            onClick={() => {
              if (!fecha) { alert('Seleccioná una fecha'); return; }
              onConfirm(notas, fecha, resultado);
            }}
            className={`flex-1 py-2.5 ${cfg.bg} border-2 ${cfg.border} ${cfg.text} font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 hover:opacity-80`}
          >
            {icon} {yaAgendado ? 'Actualizar' : 'Confirmar solicitud'}
          </button>
          <button
            onClick={handleEnviarMail}
            className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Mail className="w-4 h-4"/>Enviar mail
          </button>
          <button
            onClick={onCancel}
            className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm"
          >
            Cerrar
          </button>
        </div>

        {yaAgendado && (
          <button
            onClick={() => {
              if (confirm(`¿Cancelar el ${cfg.label} de ${cv.nombre} ${cv.apellido}?`)) onCancelarExamen();
            }}
            className="mt-3 w-full py-2 text-red-600 border border-red-300 hover:bg-red-50 font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <X className="w-4 h-4"/> Cancelar {cfg.label}
          </button>
        )}
      </div>
    </div>
  );
};