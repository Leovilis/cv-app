// components/PuestoModal.tsx
import React, { useState } from 'react';
import { X, Save, Briefcase, ListChecks, Gift, FileText } from 'lucide-react';
import { BusquedaActiva } from '@/lib/types';

interface PuestoModalProps {
  busqueda: BusquedaActiva;
  onSave: (data: { acercaDelPuesto: string; requisitos: string; beneficios: string }) => Promise<void>;
  onClose: () => void;
}

export const PuestoModal: React.FC<PuestoModalProps> = ({ busqueda, onSave, onClose }) => {
  const [acercaDelPuesto, setAcercaDelPuesto] = useState(busqueda.acercaDelPuesto || '');
  const [requisitos, setRequisitos] = useState(busqueda.requisitos || '');
  const [beneficios, setBeneficios] = useState(busqueda.beneficios || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ acercaDelPuesto, requisitos, beneficios });
      onClose();
    } catch (error) {
      alert('Error al guardar la información del puesto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-manzur-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-manzur-primary"/>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Acerca del Puesto</h3>
              <p className="text-sm text-gray-500">
                {busqueda.titulo} - {busqueda.area} / {busqueda.puesto}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          
          {/* Descripción del puesto */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-manzur-primary"/>
              Descripción del Puesto
            </label>
            <textarea
              value={acercaDelPuesto}
              onChange={(e) => setAcercaDelPuesto(e.target.value)}
              rows={5}
              placeholder="Describa las responsabilidades, tareas diarias, objetivos del puesto..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-manzur-primary resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Esta información será visible para los postulantes.
            </p>
          </div>

          {/* Requisitos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-manzur-primary"/>
              Requisitos del Puesto
            </label>
            <textarea
              value={requisitos}
              onChange={(e) => setRequisitos(e.target.value)}
              rows={4}
              placeholder="• Formación requerida&#10;• Experiencia mínima&#10;• Conocimientos específicos&#10;• Habilidades blandas..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-manzur-primary resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Puede usar viñetas (•) para listar los requisitos.
            </p>
          </div>

          {/* Beneficios */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Gift className="w-4 h-4 text-manzur-primary"/>
              Beneficios Ofrecidos
            </label>
            <textarea
              value={beneficios}
              onChange={(e) => setBeneficios(e.target.value)}
              rows={3}
              placeholder="• Obra social&#10;• Vacaciones pagas&#10;• Horario flexible&#10;• Capacitaciones..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-manzur-primary resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Describa los beneficios adicionales del puesto.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-manzur-primary hover:bg-manzur-secondary rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4"/>
            {saving ? 'Guardando...' : 'Guardar Información'}
          </button>
        </div>
      </div>
    </div>
  );
};