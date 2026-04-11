// components/CVUploadForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Upload, User, Calendar, Briefcase, CreditCard, Phone,
  GraduationCap, MapPin, Search, ChevronRight, Shield,
  CheckCircle, LogOut, X, Plus, Trash2
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { CVFormData, BusquedaActiva, AREAS, AREAS_PUESTOS, NIVELES_FORMACION } from '@/lib/types';
import { PrivacyModal } from './PrivacyModal';
import { Footer } from './Footer';

interface CVUploadFormProps {
  onSuccess: () => void;
}

interface PuestoSeleccionado {
  area: string;
  subArea: string;
}

interface FormState extends CVFormData {
  puestos: PuestoSeleccionado[]; // hasta 3
}

// ─── Modal de éxito ──────────────────────────────────────────────────────────
const SuccessModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-9 h-9 text-green-600"/>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">¡CV enviado con éxito!</h2>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        Tu postulación fue recibida correctamente. Nos pondremos en contacto si tu perfil es de interés.
      </p>
      <div className="space-y-3">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full py-3 bg-manzur-primary hover:bg-manzur-secondary text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4"/>
          Cerrar sesión
        </button>
        <button
          onClick={onClose}
          className="w-full py-2.5 text-gray-500 hover:text-gray-700 text-sm transition-colors"
        >
          Quedarse en la página
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Form ───────────────────────────────────────────────────────────────
export const CVUploadForm: React.FC<CVUploadFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<FormState>({
    nombre: '', apellido: '', dni: '', telefonoArea: '', telefonoNumero: '',
    fechaNacimiento: '', nivelFormacion: '', area: '', lugarResidencia: '',
    cv: null, busquedasPostuladas: [],
    puestos: [{ area: '', subArea: '' }],
  });

  const [errors, setErrors]                     = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading]                   = useState(false);
  const [postulaBusqueda, setPostulaBusqueda]   = useState(false);
  const [busquedas, setBusquedas]               = useState<BusquedaActiva[]>([]);
  const [loadingBusquedas, setLoadingBusquedas] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacidadAceptada, setPrivacidadAceptada] = useState(false);
  const [showSuccess, setShowSuccess]           = useState(false);

  useEffect(() => {
    if (!postulaBusqueda) return;
    setLoadingBusquedas(true);
    fetch('/api/active-searches/list')
      .then(r => r.json())
      .then(data => setBusquedas(data.busquedas || []))
      .catch(() => setBusquedas([]))
      .finally(() => setLoadingBusquedas(false));
  }, [postulaBusqueda]);

  // Cuando se activa búsqueda activa → limpiar puestos seleccionados
  const handlePostulaBusquedaChange = (checked: boolean) => {
    setPostulaBusqueda(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        puestos: [{ area: '', subArea: '' }],
        busquedasPostuladas: [],
      }));
    } else {
      setFormData(prev => ({ ...prev, busquedasPostuladas: [] }));
    }
  };

  const toggleBusqueda = (id: string) => {
    setFormData(prev => ({
      ...prev,
      busquedasPostuladas: prev.busquedasPostuladas.includes(id)
        ? prev.busquedasPostuladas.filter(b => b !== id)
        : [...prev.busquedasPostuladas, id],
    }));
  };

  // ── Gestión de puestos (hasta 3) ─────────────────────────────────────────
  const updatePuesto = (idx: number, field: keyof PuestoSeleccionado, val: string) => {
    setFormData(prev => ({
      ...prev,
      puestos: prev.puestos.map((p, i) =>
        i === idx ? { ...p, [field]: val, ...(field === 'area' ? { subArea: '' } : {}) } : p
      ),
    }));
  };

  const addPuesto = () => {
    if (formData.puestos.length >= 3) return;
    setFormData(prev => ({ ...prev, puestos: [...prev.puestos, { area: '', subArea: '' }] }));
  };

  const removePuesto = (idx: number) => {
    if (formData.puestos.length <= 1) return;
    setFormData(prev => ({ ...prev, puestos: prev.puestos.filter((_, i) => i !== idx) }));
  };

  const validateDate = (date: string) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(date)) return false;
    const [, day, month, year] = date.match(regex)!;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return d.getDate() == parseInt(day) && d.getMonth() == parseInt(month) - 1 && d.getFullYear() == parseInt(year);
  };

 // En el handleSubmit, modifica la parte del fetch:

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!privacidadAceptada) { 
    setShowPrivacyModal(true); 
    return; 
  }

  const newErrors: Record<string, string> = {};
  if (!formData.nombre.trim())          newErrors.nombre = 'El nombre es requerido';
  if (!formData.apellido.trim())        newErrors.apellido = 'El apellido es requerido';
  if (!/^\d{7,8}$/.test(formData.dni)) newErrors.dni = 'DNI inválido (7-8 dígitos)';
  if (!/^\d{2,4}$/.test(formData.telefonoArea) || !/^\d{6,8}$/.test(formData.telefonoNumero))
    newErrors.telefonoArea = 'Teléfono inválido';
  if (!validateDate(formData.fechaNacimiento))
    newErrors.fechaNacimiento = 'Formato inválido (dd/MM/yyyy)';
  if (!formData.nivelFormacion)         newErrors.nivelFormacion = 'Seleccione un nivel de formación';
  if (!formData.lugarResidencia.trim()) newErrors.lugarResidencia = 'El lugar de residencia es requerido';
  if (!formData.cv)                     newErrors.cv = 'Debe subir un CV en PDF';
  if (postulaBusqueda && formData.busquedasPostuladas.length === 0)
    newErrors.busquedasPostuladas = 'Seleccioná al menos una búsqueda';

  // if (!postulaBusqueda) {
  //   formData.puestos.forEach((p, i) => {
  //     if (p.area && !p.subArea)
  //       newErrors[`subArea_${i}`] = 'Seleccioná el puesto para esta área';
  //   });
  // }

  if (Object.keys(newErrors).length > 0) { 
    setErrors(newErrors); 
    console.log('❌ Errores de validación:', newErrors);  // ← Agregar log
    return; 
  }

  setLoading(true);
  try {
    const puestosValidos = postulaBusqueda
      ? []
      : formData.puestos.filter(p => p.area && p.subArea);

    const areaPrincipal    = puestosValidos[0]?.area    || '';
    const subAreaPrincipal = puestosValidos[0]?.subArea || '';

    const fd = new FormData();
    fd.append('nombre',            formData.nombre);
    fd.append('apellido',          formData.apellido);
    fd.append('dni',               formData.dni);
    fd.append('telefonoArea',      formData.telefonoArea);
    fd.append('telefonoNumero',    formData.telefonoNumero);
    fd.append('fechaNacimiento',   formData.fechaNacimiento);
    fd.append('nivelFormacion',    formData.nivelFormacion);
    fd.append('area',              areaPrincipal || 'Genérico');
    fd.append('subArea',           subAreaPrincipal);
    fd.append('puestosPostulados', JSON.stringify(puestosValidos));
    fd.append('lugarResidencia',   formData.lugarResidencia);
    fd.append('busquedasPostuladas', JSON.stringify(formData.busquedasPostuladas));
    fd.append('privacidadAceptada', 'true');
    fd.append('fechaAceptacion',   new Date().toISOString());
    fd.append('cv',                formData.cv!);

    console.log('📤 Enviando datos al servidor...');  // ← Agregar log
    console.log('Área principal:', areaPrincipal);
    console.log('Busquedas:', formData.busquedasPostuladas);

    const response = await fetch('/api/cv/upload', { method: 'POST', body: fd });
    
    console.log('📥 Respuesta recibida. Status:', response.status);  // ← Agregar log
    
    const data = await response.json();
    console.log('📦 Datos de respuesta:', data);  // ← Agregar log
    
    if (!response.ok) throw new Error(data.error || 'Error al subir el CV');

    // Reset form
    setFormData({
      nombre:'', apellido:'', dni:'', telefonoArea:'', telefonoNumero:'',
      fechaNacimiento:'', nivelFormacion:'', area:'', lugarResidencia:'',
      cv: null, busquedasPostuladas: [],
      puestos: [{ area: '', subArea: '' }],
    });
    setErrors({});
    setPostulaBusqueda(false);
    setShowSuccess(true);
    onSuccess();
  } catch (error: any) {
    console.error('❌ Error en el envío:', error);  // ← Agregar log
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

  const inputCls     = "w-full px-4 py-3 border border-manzur-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-manzur-primary text-base bg-white";
  const inputDisCls  = "w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-gray-50 text-gray-400 cursor-not-allowed";
  const labelCls     = "block text-sm font-medium mb-1.5 text-manzur-primary";
  const errorCls     = "text-red-500 text-xs mt-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Modal de éxito */}
      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)}/>}

      {/* Modal de privacidad */}
      {showPrivacyModal && (
        <PrivacyModal
          onAccept={() => { setPrivacidadAceptada(true); setShowPrivacyModal(false); }}
          onClose={() => setShowPrivacyModal(false)}
        />
      )}

      {/* Banner privacidad */}
      {privacidadAceptada ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-sm text-green-700">
          <Shield className="w-4 h-4 flex-shrink-0"/>
          <span>✓ Política de Privacidad y Términos aceptados</span>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <Shield className="w-4 h-4 flex-shrink-0"/>
            <span>Debe aceptar la Política de Privacidad para enviar su CV</span>
          </div>
          <button onClick={() => setShowPrivacyModal(true)}
            className="px-3 py-1.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors whitespace-nowrap">
            Ver y aceptar
          </button>
        </div>
      )}

      {/* Nombre y Apellido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}><User className="inline w-4 h-4 mr-1"/>Nombre *</label>
          <input type="text" value={formData.nombre}
            onChange={e => setFormData({...formData, nombre: e.target.value})}
            className={inputCls} disabled={loading} autoComplete="given-name"/>
          {errors.nombre && <p className={errorCls}>{errors.nombre}</p>}
        </div>
        <div>
          <label className={labelCls}><User className="inline w-4 h-4 mr-1"/>Apellido *</label>
          <input type="text" value={formData.apellido}
            onChange={e => setFormData({...formData, apellido: e.target.value})}
            className={inputCls} disabled={loading} autoComplete="family-name"/>
          {errors.apellido && <p className={errorCls}>{errors.apellido}</p>}
        </div>
      </div>

      {/* DNI y Fecha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}><CreditCard className="inline w-4 h-4 mr-1"/>DNI *</label>
          <input type="tel" inputMode="numeric" placeholder="12345678" value={formData.dni}
            onChange={e => setFormData({...formData, dni: e.target.value.replace(/\D/g,'')})}
            maxLength={8} className={inputCls} disabled={loading}/>
          {errors.dni && <p className={errorCls}>{errors.dni}</p>}
        </div>
        <div>
          <label className={labelCls}><Calendar className="inline w-4 h-4 mr-1"/>Fecha de Nacimiento *</label>
          <input type="text" inputMode="numeric" placeholder="25/12/1990" value={formData.fechaNacimiento}
            onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})}
            className={inputCls} disabled={loading}/>
          {errors.fechaNacimiento && <p className={errorCls}>{errors.fechaNacimiento}</p>}
        </div>
      </div>

      {/* Teléfono */}
      <div>
        <label className={labelCls}><Phone className="inline w-4 h-4 mr-1"/>Teléfono *</label>
        <div className="grid grid-cols-3 gap-2">
          <input type="tel" inputMode="numeric" placeholder="Área" value={formData.telefonoArea}
            onChange={e => setFormData({...formData, telefonoArea: e.target.value.replace(/\D/g,'')})}
            maxLength={4} className={`${inputCls} text-center`} disabled={loading}/>
          <input type="tel" inputMode="numeric" placeholder="Número" value={formData.telefonoNumero}
            onChange={e => setFormData({...formData, telefonoNumero: e.target.value.replace(/\D/g,'')})}
            maxLength={8} className={`${inputCls} col-span-2`} disabled={loading}/>
        </div>
        {errors.telefonoArea && <p className={errorCls}>{errors.telefonoArea}</p>}
      </div>

      {/* Formación */}
      <div>
        <label className={labelCls}><GraduationCap className="inline w-4 h-4 mr-1"/>Nivel de Formación *</label>
        <select value={formData.nivelFormacion}
          onChange={e => setFormData({...formData, nivelFormacion: e.target.value})}
          className={inputCls} disabled={loading}>
          <option value="">Seleccione su nivel de formación</option>
          {NIVELES_FORMACION.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        {errors.nivelFormacion && <p className={errorCls}>{errors.nivelFormacion}</p>}
      </div>

      {/* Lugar de Residencia */}
      <div>
        <label className={labelCls}><MapPin className="inline w-4 h-4 mr-1"/>Lugar de Residencia *</label>
        <input type="text" placeholder="Ej: San Salvador de Jujuy" value={formData.lugarResidencia}
          onChange={e => setFormData({...formData, lugarResidencia: e.target.value})}
          className={inputCls} disabled={loading} autoComplete="address-level2"/>
        {errors.lugarResidencia && <p className={errorCls}>{errors.lugarResidencia}</p>}
      </div>

      {/* ── Búsquedas activas ── */}
      <div className="border border-manzur-secondary rounded-xl overflow-hidden">
        <label className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors select-none
          ${postulaBusqueda ? 'bg-manzur-primary text-white' : 'bg-gray-50 hover:bg-gray-100 text-manzur-primary'}`}>
          <input type="checkbox" checked={postulaBusqueda}
            onChange={e => handlePostulaBusquedaChange(e.target.checked)}
            className="w-5 h-5 accent-white flex-shrink-0" disabled={loading}/>
          <Search className="w-4 h-4 flex-shrink-0"/>
          <span className="font-medium text-sm leading-tight">Quiero postularme a una búsqueda activa</span>
        </label>

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
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98]
                        ${selected ? 'border-manzur-primary bg-blue-50' : 'border-gray-200 hover:border-manzur-secondary'}`}>
                      <input type="checkbox" checked={selected} onChange={() => toggleBusqueda(b.id!)}
                        className="w-5 h-5 mt-0.5 accent-manzur-primary flex-shrink-0" disabled={loading}/>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 leading-tight">{b.titulo}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{b.area} · {(b as any).puesto || b.titulo} · {b.lugarResidencia}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            {errors.busquedasPostuladas && <p className={errorCls}>{errors.busquedasPostuladas}</p>}
          </div>
        )}
      </div>

      {/* ── Áreas (opcional, hasta 3) ── */}
      <div className="border border-manzur-secondary rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-manzur-secondary flex items-center justify-between">
          <p className="text-sm font-medium text-manzur-primary flex items-center gap-1.5">
            <Briefcase className="w-4 h-4"/>
            Áreas<span className="text-gray-400 font-normal">(opcional)</span>
          </p>
          {!postulaBusqueda && formData.puestos.length < 3 && (
            <button type="button" onClick={addPuesto}
              className="flex items-center gap-1 text-xs text-manzur-primary hover:text-manzur-secondary font-medium border border-manzur-secondary rounded-lg px-2.5 py-1 hover:bg-blue-50 transition-colors">
              <Plus className="w-3.5 h-3.5"/>Agregar área
            </button>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Aviso cuando hay búsqueda activa seleccionada */}
          {postulaBusqueda && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
              <Search className="w-4 h-4 flex-shrink-0 mt-0.5"/>
              <span>Como te postulaste a una búsqueda activa, el área y puesto se completan automáticamente desde la búsqueda seleccionada.</span>
            </div>
          )}

          {formData.puestos.map((p, idx) => (
            <div key={idx} className={`space-y-3 ${idx > 0 ? 'pt-4 border-t border-gray-100' : ''}`}>
              {formData.puestos.length > 1 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Área {idx + 1}
                  </span>
                  {!postulaBusqueda && (
                    <button type="button" onClick={() => removePuesto(idx)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  )}
                </div>
              )}

              {/* Área */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  {formData.puestos.length > 1 ? `Área ${idx + 1}` : 'Área'}
                </label>
                <select
                  value={p.area}
                  onChange={e => updatePuesto(idx, 'area', e.target.value)}
                  className={postulaBusqueda ? inputDisCls : inputCls}
                  disabled={loading || postulaBusqueda}
                >
                  <option value="">— Elegí un área —</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              {/* Sub-área - Completamente eliminado, el postulante NO elige puestos */}
            </div>
          ))}

          {!postulaBusqueda && formData.puestos.length < 3 && (
            <p className="text-xs text-gray-400 text-center pt-1">
              Podés agregar hasta {3 - formData.puestos.length} área{3 - formData.puestos.length !== 1 ? 's' : ''} más
            </p>
          )}
        </div>
      </div>

      {/* CV PDF */}
      <div>
        <label className={labelCls}><Upload className="inline w-4 h-4 mr-1"/>Curriculum Vitae (PDF) *</label>
        <label className={`flex flex-col items-center justify-center gap-2 w-full px-4 py-6 border-2 border-dashed border-manzur-secondary rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Upload className="w-8 h-8 text-manzur-secondary"/>
          <span className="text-sm text-gray-600 text-center">
            {formData.cv ? (
              <span className="text-green-600 font-medium">✓ {formData.cv.name}</span>
            ) : (
              <>
                <span className="font-medium text-manzur-primary">Seleccionar archivo PDF</span>
                <br/>
                <span className="text-xs text-gray-400">Tocá para elegir desde tu dispositivo</span>
              </>
            )}
          </span>
          <input type="file" accept="application/pdf" onChange={handleFileChange}
            className="hidden" disabled={loading}/>
        </label>
        {errors.cv && <p className={errorCls}>{errors.cv}</p>}
      </div>

      {/* Submit */}
      <button 
        type="submit"
        disabled={loading || !privacidadAceptada}
        className={`w-full py-4 text-white font-semibold rounded-xl transition-all text-base shadow-md
          ${!privacidadAceptada
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-manzur-primary hover:bg-manzur-secondary active:scale-[0.98]'}`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
            Enviando...
          </span>
        ) : 'Enviar CV'}
      </button>

      <p className="text-xs text-center text-gray-400">
        Al enviar su CV, acepta nuestra{' '}
        <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-manzur-primary hover:underline">
          Política de Privacidad
        </button>{' '}y{' '}
        <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-manzur-primary hover:underline">
          Términos y Condiciones
        </button>
      </p>
    </form>
  );
};