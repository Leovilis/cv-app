import React, { useState } from 'react';
import { Upload, User, Calendar, Briefcase, CreditCard, Phone, GraduationCap } from 'lucide-react';
import { CVFormData } from '@/lib/types';

const AREAS = [
  'Auditoría',
  'Contable',
  'Compras',
  'Finanzas',
  'Data Analytics',
  'Sistemas',
  'RRHH Hard y Soft',
  'Calidad',
  'Control Interno',
  'RSE'
];

const NIVELES_FORMACION = [
  'Secundario',
  'Terciario',
  'Universitario',
  'Formación Superior'
];

interface CVUploadFormProps {
  onSuccess: () => void;
}

export const CVUploadForm: React.FC<CVUploadFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<CVFormData>({
    nombre: '',
    apellido: '',
    dni: '',
    telefonoArea: '',
    telefonoNumero: '',
    fechaNacimiento: '',
    nivelFormacion: '',
    area: '',
    cv: null
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CVFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const validateDate = (date: string) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(date)) return false;
    
    const [, day, month, year] = date.match(regex)!;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return d.getDate() == parseInt(day) && 
           d.getMonth() == parseInt(month) - 1 && 
           d.getFullYear() == parseInt(year);
  };

  const validateDNI = (dni: string) => {
    return /^\d{7,8}$/.test(dni);
  };

  const validatePhone = (area: string, numero: string) => {
    return /^\d{2,4}$/.test(area) && /^\d{6,8}$/.test(numero);
  };

  const handleSubmit = async () => {
    const newErrors: Partial<Record<keyof CVFormData, string>> = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    if (!validateDNI(formData.dni)) newErrors.dni = 'DNI inválido (7-8 dígitos)';
    if (!validatePhone(formData.telefonoArea, formData.telefonoNumero)) {
      newErrors.telefonoArea = 'Teléfono inválido';
    }
    if (!validateDate(formData.fechaNacimiento)) {
      newErrors.fechaNacimiento = 'Formato inválido (dd/MM/yyyy)';
    }
    if (!formData.nivelFormacion) newErrors.nivelFormacion = 'Seleccione un nivel de formación';
    if (!formData.cv) newErrors.cv = 'Debe subir un CV en PDF';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('apellido', formData.apellido);
      formDataToSend.append('dni', formData.dni);
      formDataToSend.append('telefonoArea', formData.telefonoArea);
      formDataToSend.append('telefonoNumero', formData.telefonoNumero);
      formDataToSend.append('fechaNacimiento', formData.fechaNacimiento);
      formDataToSend.append('nivelFormacion', formData.nivelFormacion);
      formDataToSend.append('area', formData.area || 'Genérico');
      formDataToSend.append('cv', formData.cv!);

      const response = await fetch('/api/cv/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir el CV');
      }

      if (data.replaced) {
        alert(`CV actualizado exitosamente. Se reemplazó el CV anterior.`);
      }

      setFormData({
        nombre: '',
        apellido: '',
        dni: '',
        telefonoArea: '',
        telefonoNumero: '',
        fechaNacimiento: '',
        nivelFormacion: '',
        area: '',
        cv: null
      });
      setErrors({});
      
      onSuccess();
    } catch (error: any) {
      alert(error.message || 'Error al subir el CV');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, cv: file });
      setErrors({ ...errors, cv: undefined });
    } else {
      setErrors({ ...errors, cv: 'Solo se permiten archivos PDF' });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-manzur-primary">
            <User className="inline w-4 h-4 mr-1" />
            Nombre *
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
            disabled={loading}
          />
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-manzur-primary">
            <User className="inline w-4 h-4 mr-1" />
            Apellido *
          </label>
          <input
            type="text"
            value={formData.apellido}
            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
            className="w-full px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
            disabled={loading}
          />
          {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-manzur-primary">
            <CreditCard className="inline w-4 h-4 mr-1" />
            DNI *
          </label>
          <input
            type="text"
            placeholder="12345678"
            value={formData.dni}
            onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })}
            maxLength={8}
            className="w-full px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
            disabled={loading}
          />
          {errors.dni && <p className="text-red-500 text-sm mt-1">{errors.dni}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-manzur-primary">
            <Calendar className="inline w-4 h-4 mr-1" />
            Fecha de Nacimiento *
          </label>
          <input
            type="text"
            placeholder="25/12/1990"
            value={formData.fechaNacimiento}
            onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
            className="w-full px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
            disabled={loading}
          />
          {errors.fechaNacimiento && <p className="text-red-500 text-sm mt-1">{errors.fechaNacimiento}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-manzur-primary">
          <Phone className="inline w-4 h-4 mr-1" />
          Teléfono *
        </label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Área"
            value={formData.telefonoArea}
            onChange={(e) => setFormData({ ...formData, telefonoArea: e.target.value.replace(/\D/g, '') })}
            maxLength={4}
            className="px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Número"
            value={formData.telefonoNumero}
            onChange={(e) => setFormData({ ...formData, telefonoNumero: e.target.value.replace(/\D/g, '') })}
            maxLength={8}
            className="col-span-2 px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
            disabled={loading}
          />
        </div>
        {errors.telefonoArea && <p className="text-red-500 text-sm mt-1">{errors.telefonoArea}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-manzur-primary">
          <GraduationCap className="inline w-4 h-4 mr-1" />
          Nivel de Formación *
        </label>
        <select
          value={formData.nivelFormacion}
          onChange={(e) => setFormData({ ...formData, nivelFormacion: e.target.value })}
          className="w-full px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
          disabled={loading}
        >
          <option value="">Seleccione su nivel de formación</option>
          {NIVELES_FORMACION.map(nivel => (
            <option key={nivel} value={nivel}>{nivel}</option>
          ))}
        </select>
        {errors.nivelFormacion && <p className="text-red-500 text-sm mt-1">{errors.nivelFormacion}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-manzur-primary">
          <Briefcase className="inline w-4 h-4 mr-1" />
          Área (opcional)
        </label>
        <select
          value={formData.area}
          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
          className="w-full px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
          disabled={loading}
        >
          <option value="">Seleccione un área</option>
          {AREAS.map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-manzur-primary">
          <Upload className="inline w-4 h-4 mr-1" />
          Curriculum Vitae (PDF) *
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="w-full px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
          disabled={loading}
        />
        {errors.cv && <p className="text-red-500 text-sm mt-1">{errors.cv}</p>}
        {formData.cv && <p className="text-green-600 text-sm mt-1">✓ {formData.cv.name}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 text-white font-medium rounded-lg bg-manzur-primary hover:bg-manzur-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Enviando...' : 'Enviar CV'}
      </button>
    </div>
  );
};