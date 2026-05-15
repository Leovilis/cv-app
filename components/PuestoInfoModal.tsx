// components/PuestoInfoModal.tsx
import React from 'react';
import { X, Briefcase, ListChecks, Target, MapPin, Building2 } from 'lucide-react';
import { BusquedaActiva } from '@/lib/types';

interface PuestoInfoModalProps {
  busqueda: BusquedaActiva;
  onClose: () => void;
}

export const PuestoInfoModal: React.FC<PuestoInfoModalProps> = ({ busqueda, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-manzur-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-manzur-primary"/>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{busqueda.titulo}</h3>
              <p className="text-sm text-gray-500">
                {busqueda.area} / {busqueda.puesto}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          
          {/* Ubicación */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-manzur-primary"/>
              <span className="text-sm">Ubicación: <strong>{busqueda.lugarResidencia}</strong></span>
            </div>
          </div>

          {/* Descripción del puesto */}
          {busqueda.acercaDelPuesto && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-manzur-primary"/>
                Sobre el puesto
              </h4>
              <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
                {busqueda.acercaDelPuesto}
              </div>
            </div>
          )}

          {/* Principales responsabilidades */}
          {busqueda.principalesResponsabilidades && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-manzur-primary"/>
                Principales responsabilidades
              </h4>
              <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
                {busqueda.principalesResponsabilidades}
              </div>
            </div>
          )}

          {/* Requisitos */}
          {busqueda.requisitos && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-manzur-primary"/>
                Requisitos
              </h4>
              <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
                {busqueda.requisitos}
              </div>
            </div>
          )}

          {/* Si no hay información */}
          {!busqueda.acercaDelPuesto && !busqueda.principalesResponsabilidades && !busqueda.requisitos && (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300"/>
              <p>No hay información detallada disponible para este puesto.</p>
              <p className="text-sm mt-1">Pronto estará disponible más información.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};