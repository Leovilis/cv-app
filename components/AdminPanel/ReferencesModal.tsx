// components/AdminPanel/ReferencesModal.tsx
import React, { useState } from 'react';
import { X, Check, Mail, Printer, ClipboardList } from 'lucide-react';
import { CV, ReferenciaEntry } from '@/lib/types';
import { ReferencesModalProps } from './types';

const emptyRef = (): ReferenciaEntry => ({
  empresa: '',
  contacto: '',
  cargo: '',
  telefono: '',
  comentario: ''
});

export const ReferencesModal: React.FC<ReferencesModalProps> = ({ cv, onSave, onClose }) => {
  const [refs, setRefs] = useState<ReferenciaEntry[]>(() => {
    if (cv.referenciasLaborales) {
      try {
        return JSON.parse(cv.referenciasLaborales);
      } catch { }
    }
    return [emptyRef()];
  });
  const [mailTo, setMailTo] = useState('');
  const [saving, setSaving] = useState(false);

  const updateRef = (i: number, field: keyof ReferenciaEntry, val: string) =>
    setRefs(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const handleSave = async () => {
    setSaving(true);
    await onSave(JSON.stringify(refs));
    setSaving(false);
  };

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    const fechaHoy = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

    const refsHtml = refs.map((r, i) => `
      <div class="ref-block">
        <div class="ref-num">Referencia ${i + 1}</div>
        <table class="ref-table">
          <tr><td class="label">Empresa / Empleador</td><td>${r.empresa || '—'}</td></tr>
          <tr><td class="label">Contacto</td><td>${r.contacto || '—'}</td></tr>
          <tr><td class="label">Cargo del contacto</td><td>${r.cargo || '—'}</td></tr>
          <tr><td class="label">Teléfono</td><td>${r.telefono || '—'}</td></tr>
          <tr><td class="label">Comentarios</td><td>${r.comentario || '—'}</td></tr>
        </table>
      </div>
    `).join('');

    win.document.write(`<!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Referencias — ${cv.nombre} ${cv.apellido}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; padding: 32px; font-size: 13px; }
        .header { border-bottom: 3px solid #2d3a8c; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        .header h1 { font-size: 20px; color: #2d3a8c; }
        .header .meta { font-size: 11px; color: #666; text-align: right; }
        .section { margin-bottom: 18px; }
        .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #2d3a8c; border-bottom: 1px solid #c7d2fe; padding-bottom: 4px; margin-bottom: 10px; }
        .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; }
        .data-item { display: flex; gap: 6px; }
        .data-label { color: #555; min-width: 110px; }
        .data-value { font-weight: 600; }
        .ref-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin-bottom: 12px; }
        .ref-num { font-weight: 700; color: #2d3a8c; font-size: 12px; margin-bottom: 8px; }
        .ref-table { width: 100%; border-collapse: collapse; }
        .ref-table td { padding: 4px 6px; vertical-align: top; }
        .ref-table .label { color: #555; width: 160px; font-size: 12px; }
        .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #999; text-align: center; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Ficha de Referencias Laborales</h1>
          <div style="font-size:13px;color:#444;margin-top:4px;">${cv.nombre} ${cv.apellido}</div>
        </div>
        <div class="meta">Generado: ${fechaHoy}<br/>Manzur Administraciones</div>
      </div>
      <div class="section">
        <div class="section-title">Datos del Candidato</div>
        <div class="data-grid">
          <div class="data-item"><span class="data-label">DNI:</span><span class="data-value">${cv.dni}</span></div>
          <div class="data-item"><span class="data-label">Email:</span><span class="data-value">${cv.email || cv.uploadedBy || '—'}</span></div>
          <div class="data-item"><span class="data-label">Teléfono:</span><span class="data-value">(${cv.telefonoArea}) ${cv.telefonoNumero}</span></div>
          <div class="data-item"><span class="data-label">Nacimiento:</span><span class="data-value">${cv.fechaNacimiento}</span></div>
          <div class="data-item"><span class="data-label">Formación:</span><span class="data-value">${cv.nivelFormacion}</span></div>
          <div class="data-item"><span class="data-label">Residencia:</span><span class="data-value">${cv.lugarResidencia || '—'}</span></div>
          <div class="data-item"><span class="data-label">Área:</span><span class="data-value">${cv.area || '—'}</span></div>
          <div class="data-item"><span class="data-label">Puesto postulado:</span><span class="data-value">${cv.puestoSeleccionado || cv.subArea || '—'}</span></div>
          ${cv.estadoSeleccion ? `<div class="data-item"><span class="data-label">Estado:</span><span class="data-value">${cv.estadoSeleccion}</span></div>` : ''}
          ${cv.notasAdmin ? `<div class="data-item" style="grid-column:1/-1"><span class="data-label">Notas admin:</span><span class="data-value">${cv.notasAdmin}</span></div>` : ''}
        </div>
      </div>
      <div class="section">
        <div class="section-title">Referencias Laborales</div>
        ${refsHtml || '<p style="color:#999;font-style:italic">Sin referencias cargadas.</p>'}
      </div>
      <div class="footer">Documento generado por el sistema de selección de Manzur Administraciones</div>
    </body>
    </html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  const handleMail = () => {
    if (!mailTo.trim()) {
      alert('Ingresá un email de destino');
      return;
    }
    const subject = encodeURIComponent(`Referencias Laborales — ${cv.nombre} ${cv.apellido}`);
    const lines: string[] = [
      `FICHA DE REFERENCIAS LABORALES`,
      ``,
      `Candidato: ${cv.nombre} ${cv.apellido}`,
      `DNI: ${cv.dni}`,
      `Teléfono: (${cv.telefonoArea}) ${cv.telefonoNumero}`,
      `Email: ${cv.email || cv.uploadedBy || '—'}`,
      `Formación: ${cv.nivelFormacion}`,
      `Residencia: ${cv.lugarResidencia || '—'}`,
      `Área: ${cv.area || '—'}`,
      `Puesto: ${cv.puestoSeleccionado || cv.subArea || '—'}`,
      ``,
      `─────────────────────────────`,
      `REFERENCIAS LABORALES`,
      `─────────────────────────────`,
    ];
    refs.forEach((r, i) => {
      lines.push(``, `Referencia ${i + 1}:`);
      if (r.empresa) lines.push(`  Empresa/Empleador: ${r.empresa}`);
      if (r.contacto) lines.push(`  Contacto:          ${r.contacto}`);
      if (r.cargo) lines.push(`  Cargo del contacto:${r.cargo}`);
      if (r.telefono) lines.push(`  Teléfono:          ${r.telefono}`);
      if (r.comentario) lines.push(`  Comentarios:       ${r.comentario}`);
    });
    lines.push(``, `—`, `Manzur Administraciones`);
    window.open(`mailto:${encodeURIComponent(mailTo)}?subject=${subject}&body=${encodeURIComponent(lines.join('\n'))}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-400 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-5 h-5 text-blue-700"/>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">Referencias Laborales</h3>
              <p className="text-sm text-gray-500">{cv.nombre} {cv.apellido} — {cv.puestoSeleccionado || cv.subArea || 'Sin puesto asignado'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3">Datos del Candidato</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              <div><span className="text-gray-500">DNI:</span> <span className="font-medium">{cv.dni}</span></div>
              <div><span className="text-gray-500">Teléfono:</span> <span className="font-medium">({cv.telefonoArea}) {cv.telefonoNumero}</span></div>
              <div><span className="text-gray-500">Nacimiento:</span> <span className="font-medium">{cv.fechaNacimiento}</span></div>
              <div><span className="text-gray-500">Formación:</span> <span className="font-medium">{cv.nivelFormacion}</span></div>
              <div><span className="text-gray-500">Residencia:</span> <span className="font-medium">{cv.lugarResidencia || '—'}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{cv.email || cv.uploadedBy || '—'}</span></div>
              <div><span className="text-gray-500">Área:</span> <span className="font-medium">{cv.area || '—'}</span></div>
              <div><span className="text-gray-500">Puesto:</span> <span className="font-medium text-blue-800">{cv.puestoSeleccionado || cv.subArea || '—'}</span></div>
              {cv.estadoSeleccion && <div><span className="text-gray-500">Estado:</span> <span className="font-medium">{cv.estadoSeleccion}</span></div>}
              {cv.notasAdmin && <div className="col-span-2"><span className="text-gray-500">Notas:</span> <span className="font-medium">{cv.notasAdmin}</span></div>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Referencias Laborales</p>
              <button
                onClick={() => setRefs(r => [...r, emptyRef()])}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-300 rounded-lg px-2.5 py-1 hover:bg-blue-50 transition-colors"
              >
                + Agregar referencia
              </button>
            </div>

            <div className="space-y-4">
              {refs.map((r, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase">Referencia {i + 1}</span>
                    {refs.length > 1 && (
                      <button
                        onClick={() => setRefs(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5"/>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Empresa / Empleador</label>
                      <input
                        value={r.empresa}
                        onChange={e => updateRef(i, 'empresa', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del contacto</label>
                      <input
                        value={r.contacto}
                        onChange={e => updateRef(i, 'contacto', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cargo del contacto</label>
                      <input
                        value={r.cargo}
                        onChange={e => updateRef(i, 'cargo', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
                      <input
                        value={r.telefono}
                        onChange={e => updateRef(i, 'telefono', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Comentarios obtenidos</label>
                      <textarea
                        value={r.comentario}
                        onChange={e => updateRef(i, 'comentario', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Enviar por email</p>
            <div className="flex gap-2">
              <input
                value={mailTo}
                onChange={e => setMailTo(e.target.value)}
                placeholder="destinatario@ejemplo.com"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={handleMail}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors flex-shrink-0"
              >
                <Mail className="w-4 h-4"/>Enviar
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 flex-shrink-0 gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4"/>Exportar PDF
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4"/>{saving ? 'Guardando...' : 'Guardar referencias'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};