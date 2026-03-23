import React, { useState, useEffect } from 'react';
import { Upload, User, Calendar, Briefcase, CreditCard, Phone, GraduationCap, MapPin, Search } from 'lucide-react';
import { CVFormData, BusquedaActiva } from '@/lib/types';

const AREAS = [
  'Auditoría', 'Contable', 'Compras', 'Finanzas', 'Data Analytics',
  'Sistemas', 'RRHH Hard y Soft', 'Calidad', 'Control Interno', 'RSE'
];

const NIVELES_FORMACION = ['Secundario', 'Terciario', 'Universitario', 'Formación Superior'];

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
    lugarResidencia: '',
    cv: null,
    busquedasPostuladas: [],
  });

  const [errors, setErrors]             = useState<Partial<Record<keyof CVFormData, string>>>({});
  const [loading, setLoading]           = useState(false);
  const [postulaBusqueda, setPostulaBusqueda] = useState(false);
  const [busquedas, setBusquedas]       = useState<BusquedaActiva[]>([]);
  const [loadingBusquedas, setLoadingBusquedas] = useState(false);

  // Cargar búsquedas activas cuando el usuario tilda el checkbox
  useEffect(() => {
    if (!postulaBusqueda) return;
    setLoadingBusquedas(true);
    fetch('/api/active-searches/list')
      .then(r => r.json())
      .then(data => setBusquedas(data.busquedas || []))
      .catch(() => setBusquedas([]))
      .finally(() => setLoadingBusquedas(false));
  }, [postulaBusqueda]);

  const toggleBusqueda = (id: string) => {
    setFormData(prev => ({
      ...prev,
      busquedasPostuladas: prev.busquedasPostuladas.includes(id)
        ? prev.busquedasPostuladas.filter(b => b !== id)
        : [...prev.busquedasPostuladas, id],
    }));
  };

  const validateDate = (date: string) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(date)) return false;
    const [, day, month, year] = date.match(regex)!;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return d.getDate() == parseInt(day) && d.getMonth() == parseInt(month) - 1 && d.getFullYear() == parseInt(year);
  };

  const handleSubmit = async () => {
    const newErrors: Partial<Record<keyof CVFormData, string>> = {};

    if (!formData.nombre.trim())        newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim())      newErrors.apellido = 'El apellido es requerido';
    if (!/^\d{7,8}$/.test(formData.dni)) newErrors.dni = 'DNI inválido (7-8 dígitos)';
    if (!/^\d{2,4}$/.test(formData.telefonoArea) || !/^\d{6,8}$/.test(formData.telefonoNumero))
      newErrors.telefonoArea = 'Teléfono inválido';
    if (!validateDate(formData.fechaNacimiento))
      newErrors.fechaNacimiento = 'Formato inválido (dd/MM/yyyy)';
    if (!formData.nivelFormacion)       newErrors.nivelFormacion = 'Seleccione un nivel de formación';
    if (!formData.lugarResidencia.trim()) newErrors.lugarResidencia = 'El lugar de residencia es requerido';
    if (!formData.cv)                   newErrors.cv = 'Debe subir un CV en PDF';
    if (postulaBusqueda && formData.busquedasPostuladas.length === 0)
      newErrors.busquedasPostuladas = 'Seleccioná al menos una búsqueda activa';

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('nombre',          formData.nombre);
      fd.append('apellido',        formData.apellido);
      fd.append('dni',             formData.dni);
      fd.append('telefonoArea',    formData.telefonoArea);
      fd.append('telefonoNumero',  formData.telefonoNumero);
      fd.append('fechaNacimiento', formData.fechaNacimiento);
      fd.append('nivelFormacion',  formData.nivelFormacion);
      fd.append('area',            formData.area || 'Genérico');
      fd.append('lugarResidencia', formData.lugarResidencia);
      fd.append('busquedasPostuladas', JSON.stringify(formData.busquedasPostuladas));
      fd.append('cv',              formData.cv!);

      const response = await fetch('/api/cv/upload', { method: 'POST', body: fd });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al subir el CV');

      if (data.repostulacionDescartado) {
        console.warn('⚠️ Repostulación de candidato descartado:', data.motivoDescarteAnterior);
      } else if (data.replaced) {
        alert('CV actualizado exitosamente. Se reemplazó el CV anterior.');
      }

      setFormData({
        nombre: '', apellido: '', dni: '', telefonoArea: '', telefonoNumero: '',
        fechaNacimiento: '', nivelFormacion: '', area: '', lugarResidencia: '',
        cv: null, busquedasPostuladas: [],
      });
      setErrors({});
      setPostulaBusqueda(false);
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

      {/* Nombre y Apellido */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-manzur-primary">
            <User className="inline w-4 h-4 mr-1"/>Nombre *
          </label>
          <input type="text" value={formData.nombre}
            onChange={e => setFormData({...formData, nombre: e.target.value})}
            className="w-full px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
            disabled={loading}/>
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-manzur-primary">
            <User className="inline w-4 h-4 mr-1"/>Apellido *
          </label>
          <input type="text" value={formData.apellido}
            onChange={e => setFormData({...formData, apellido: e.target.value})}
            className="w-full px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
            disabled={loading}/>
          {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
        </div>
      </div>

      {/* DNI y Fecha de Nacimiento */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-manzur-primary">
            <CreditCard className="inline w-4 h-4 mr-1"/>DNI *
          </label>
          <input type="text" placeholder="12345678" value={formData.dni}
            onChange={e => setFormData({...formData, dni: e.target.value.replace(/\D/g,'')})}
            maxLength={8}
            className="w-full px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
            disabled={loading}/>
          {errors.dni && <p className="text-red-500 text-sm mt-1">{errors.dni}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-manzur-primary">
            <Calendar className="inline w-4 h-4 mr-1"/>Fecha de Nacimiento *
          </label>
          <input type="text" placeholder="25/12/1990" value={formData.fechaNacimiento}
            onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})}
            className="w-full px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
            disabled={loading}/>
          {errors.fechaNacimiento && <p className="text-red-500 text-sm mt-1">{errors.fechaNacimiento}</p>}
        </div>
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium mb-2 text-manzur-primary">
          <Phone className="inline w-4 h-4 mr-1"/>Teléfono *
        </label>
        <div className="grid grid-cols-3 gap-2">
          <input type="text" placeholder="Área" value={formData.telefonoArea}
            onChange={e => setFormData({...formData, telefonoArea: e.target.value.replace(/\D/g,'')})}
            maxLength={4}
            className="px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
            disabled={loading}/>
          <input type="text" placeholder="Número" value={formData.telefonoNumero}
            onChange={e => setFormData({...formData, telefonoNumero: e.target.value.replace(/\D/g,'')})}
            maxLength={8}
            className="col-span-2 px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
            disabled={loading}/>
        </div>
        {errors.telefonoArea && <p className="text-red-500 text-sm mt-1">{errors.telefonoArea}</p>}
      </div>

      {/* Nivel de Formación */}
      <div>
        <label className="block text-sm font-medium mb-2 text-manzur-primary">
          <GraduationCap className="inline w-4 h-4 mr-1"/>Nivel de Formación *
        </label>
        <select value={formData.nivelFormacion}
          onChange={e => setFormData({...formData, nivelFormacion: e.target.value})}
          className="w-full px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
          disabled={loading}>
          <option value="">Seleccione su nivel de formación</option>
          {NIVELES_FORMACION.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        {errors.nivelFormacion && <p className="text-red-500 text-sm mt-1">{errors.nivelFormacion}</p>}
      </div>

      {/* Lugar de Residencia */}
      <div>
        <label className="block text-sm font-medium mb-2 text-manzur-primary">
          <MapPin className="inline w-4 h-4 mr-1"/>Lugar de Residencia *
        </label>
        <input type="text" placeholder="Ej: San Salvador de Jujuy" value={formData.lugarResidencia}
          onChange={e => setFormData({...formData, lugarResidencia: e.target.value})}
          className="w-full px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
          disabled={loading}/>
        {errors.lugarResidencia && <p className="text-red-500 text-sm mt-1">{errors.lugarResidencia}</p>}
      </div>

      {/* Área */}
      <div>
        <label className="block text-sm font-medium mb-2 text-manzur-primary">
          <Briefcase className="inline w-4 h-4 mr-1"/>Área (opcional)
        </label>
        <select value={formData.area}
          onChange={e => setFormData({...formData, area: e.target.value})}
          className="w-full px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
          disabled={loading}>
          <option value="">Seleccione un área</option>
          {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Búsquedas activas */}
      <div className="border border-manzur-secondary rounded-lg overflow-hidden">
        {/* Checkbox trigger */}
        <label className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors select-none
          ${postulaBusqueda ? 'bg-manzur-primary text-white' : 'bg-gray-50 hover:bg-gray-100 text-manzur-primary'}`}>
          <input
            type="checkbox"
            checked={postulaBusqueda}
            onChange={e => {
              setPostulaBusqueda(e.target.checked);
              if (!e.target.checked) setFormData(prev => ({...prev, busquedasPostuladas: []}));
            }}
            className="w-4 h-4 accent-white"
            disabled={loading}
          />
          <Search className="w-4 h-4 flex-shrink-0"/>
          <span className="font-medium text-sm">Quiero postularme a una búsqueda activa</span>
        </label>

        {/* Lista desplegable de búsquedas */}
        {postulaBusqueda && (
          <div className="p-4 border-t border-manzur-secondary bg-white">
            {loadingBusquedas ? (
              <p className="text-sm text-gray-500 text-center py-2">Cargando búsquedas...</p>
            ) : busquedas.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-3 italic">
                No hay búsquedas activas por el momento.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-3">Podés seleccionar más de una:</p>
                {busquedas.map(b => {
                  const selected = formData.busquedasPostuladas.includes(b.id!);
                  return (
                    <label key={b.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                        ${selected
                          ? 'border-manzur-primary bg-blue-50'
                          : 'border-gray-200 hover:border-manzur-secondary'}`}>
                      <input type="checkbox" checked={selected} onChange={() => toggleBusqueda(b.id!)}
                        className="w-4 h-4 mt-0.5 accent-manzur-primary" disabled={loading}/>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{b.titulo}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {b.area} · {b.lugarResidencia}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            {errors.busquedasPostuladas && (
              <p className="text-red-500 text-sm mt-2">{errors.busquedasPostuladas}</p>
            )}
          </div>
        )}
      </div>

      {/* CV PDF */}
      <div>
        <label className="block text-sm font-medium mb-2 text-manzur-primary">
          <Upload className="inline w-4 h-4 mr-1"/>Curriculum Vitae (PDF) *
        </label>
        <input type="file" accept="application/pdf" onChange={handleFileChange}
          className="w-full px-4 py-2 border border-manzur-secondary rounded-lg focus:outline-none"
          disabled={loading}/>
        {errors.cv && <p className="text-red-500 text-sm mt-1">{errors.cv}</p>}
        {formData.cv && <p className="text-green-600 text-sm mt-1">✓ {formData.cv.name}</p>}
      </div>

      <button onClick={handleSubmit} disabled={loading}
        className="w-full py-3 text-white font-medium rounded-lg bg-manzur-primary hover:bg-manzur-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? 'Enviando...' : 'Enviar CV'}
      </button>
    </div>
  );
};