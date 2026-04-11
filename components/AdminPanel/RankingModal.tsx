// components/AdminPanel/RankingModal.tsx
import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import { RankingModalProps } from './types';

export const RankingModal: React.FC<RankingModalProps> = ({ cv, tipo, onConfirm, onCancel }) => {
  const [puntuacion, setPuntuacion] = useState<number>(5);
  const [notas, setNotas] = useState('');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-600"/>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Ranking - {tipo}</h3>
            <p className="text-sm text-gray-500">{cv.nombre} {cv.apellido}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Puntuación (1-10)</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                <button
                  key={star}
                  onClick={() => setPuntuacion(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  className="text-2xl focus:outline-none transition-transform hover:scale-110"
                >
                  <span className={
                    (hoveredStar !== null ? star <= hoveredStar : star <= puntuacion)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }>★</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Puntuación seleccionada: <strong>{puntuacion}/10</strong></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Observaciones</label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={3}
              placeholder={`Fortalezas, áreas de mejora, impresiones de la entrevista ${tipo}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => onConfirm(puntuacion, notas)}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4"/>Guardar puntuación
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