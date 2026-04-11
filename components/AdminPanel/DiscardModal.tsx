// components/AdminPanel/DiscardModal.tsx
import React, { useState } from 'react';
import { ThumbsDown, AlertTriangle } from 'lucide-react';
import { MOTIVOS_DESCARTE } from '@/lib/types';
import { DiscardModalProps } from './types';

export const DiscardModal: React.FC<DiscardModalProps> = ({ cv, onConfirm, onCancel }) => {
  const [motivo, setMotivo] = useState('');
  const [notas, setNotas] = useState('');

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
            <select
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="">Seleccione un motivo</option>
              {MOTIVOS_DESCARTE.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={3}
              placeholder="Detalles adicionales sobre el descarte..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => {
              if (!motivo) { alert('Seleccioná un motivo'); return; }
              onConfirm(motivo, notas);
            }}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2"
          >
            <ThumbsDown className="w-4 h-4"/>Confirmar descarte
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