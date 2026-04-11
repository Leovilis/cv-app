// components/AdminPanel/QuitarProcesoModal.tsx
import React, { useState } from 'react';
import { ArrowLeftCircle, AlertTriangle } from 'lucide-react';
import { MOTIVOS_QUITAR_PROCESO } from '@/lib/types';
import { QuitarProcesoModalProps } from './types';

export const QuitarProcesoModal: React.FC<QuitarProcesoModalProps> = ({ cv, onConfirm, onCancel }) => {
  const [motivo, setMotivo] = useState('');
  const [notas, setNotas] = useState('');
  const [otroMotivo, setOtroMotivo] = useState('');

  const motivoFinal = motivo === 'Otro motivo' ? otroMotivo : motivo;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <ArrowLeftCircle className="w-5 h-5 text-orange-600"/>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Quitar del proceso</h3>
            <p className="text-sm text-gray-500">{cv.nombre} {cv.apellido}</p>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 text-sm text-orange-700">
          <AlertTriangle className="w-4 h-4 inline mr-1"/>
          El candidato será removido del proceso de selección. Podés reactivarlo más tarde desde Descartados.
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
            <select
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Seleccione un motivo</option>
              {MOTIVOS_QUITAR_PROCESO.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {motivo === 'Otro motivo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especificar motivo</label>
              <input
                type="text"
                value={otroMotivo}
                onChange={e => setOtroMotivo(e.target.value)}
                placeholder="Describa el motivo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => {
              if (!motivo) { alert('Seleccioná un motivo'); return; }
              if (motivo === 'Otro motivo' && !otroMotivo.trim()) { alert('Especificá el motivo'); return; }
              onConfirm(motivoFinal, notas);
            }}
            className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeftCircle className="w-4 h-4"/>Confirmar
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};