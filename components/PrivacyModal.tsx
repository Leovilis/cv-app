// components/PrivacyModal.tsx
import React, { useState } from 'react';
import { Shield, Check, X, FileText, ExternalLink } from 'lucide-react';

interface PrivacyModalProps {
  onAccept: () => void;
  onClose: () => void;
  onOpenTerms?: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ onAccept, onClose }) => {
  const [aceptado, setAceptado] = useState(false);
  const [mostrarPolitica, setMostrarPolitica] = useState<'privacidad' | 'terminos' | null>(null);

  const PoliticaPrivacidad = () => (
    <div className="space-y-4 text-sm text-gray-700 max-h-[60vh] overflow-y-auto pr-2">
      <h4 className="font-bold text-lg text-manzur-primary sticky top-0 bg-white py-2">Política de Privacidad</h4>
      <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR')}</p>
      
      <div className="space-y-3">
        <div>
          <h5 className="font-semibold text-manzur-primary mt-3">1. Información que Recopilamos</h5>
          <p>En Manzur Administraciones, recopilamos la siguiente información personal:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Datos de identificación (nombre, apellido, DNI)</li>
            <li>Información de contacto (teléfono, email)</li>
            <li>Datos académicos y profesionales (formación)</li>
            <li>Curriculum Vitae (documento PDF)</li>
            <li>Información geográfica (lugar de residencia)</li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-manzur-primary mt-3">2. Uso de la Información</h5>
          <p>Utilizamos sus datos personales para:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Procesar postulaciones a búsquedas laborales activas</li>
            <li>Gestionar el proceso de selección de personal</li>
            <li>Contactarlo para entrevistas y seguimiento</li>
            <li>Evaluar su perfil profesional</li>
            <li>Mantener un historial de postulaciones</li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-manzur-primary mt-3">3. Protección de Datos</h5>
          <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Almacenamiento seguro en Firebase con autenticación</li>
            <li>Acceso restringido solo a personal autorizado de RRHH</li>
            <li>Encriptación de datos sensibles</li>
            <li>Auditorías regulares de seguridad</li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-manzur-primary mt-3">4. Sus Derechos (Ley 25.326)</h5>
          <p>Como titular de datos personales, usted tiene derecho a:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Acceder a sus datos personales</li>
            <li>Solicitar la rectificación de datos incorrectos</li>
            <li>Solicitar la eliminación de sus datos</li>
            <li>Oponerse al tratamiento de sus datos</li>
            <li>Solicitar la portabilidad de sus datos</li>
          </ul>
          <p className="mt-2 text-sm bg-gray-50 p-3 rounded-lg">
            Para ejercer estos derechos, contacte a: <strong className="text-manzur-primary">rrhhsoft@manzuradministraciones.com</strong>
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-manzur-primary mt-3">5. Retención de Datos</h5>
          <p>Conservamos sus datos personales durante el tiempo necesario para cumplir con los fines descritos en esta política. Los CV no seleccionados se mantienen por 2 años para futuras búsquedas.</p>
        </div>

        <div>
          <h5 className="font-semibold text-manzur-primary mt-3">6. Consentimiento</h5>
          <p>Al aceptar esta política, usted otorga su consentimiento explícito para el tratamiento de sus datos personales según lo descrito.</p>
        </div>
      </div>
    </div>
  );

  const TerminosCondiciones = () => (
    <div className="space-y-4 text-sm text-gray-700 max-h-[60vh] overflow-y-auto pr-2">
      <h4 className="font-bold text-lg text-manzur-primary sticky top-0 bg-white py-2">Términos y Condiciones</h4>
      <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR')}</p>
      
      <div className="space-y-3">
        <div>
          <h5 className="font-semibold text-manzur-primary mt-3">1. Aceptación de los Términos</h5>
          <p>Al utilizar el sistema de gestión de candidatos de Manzur Administraciones, usted acepta cumplir con estos Términos y Condiciones.</p>
        </div>

        <div>
          <h5 className="font-semibold text-manzur-primary mt-3">2. Descripción del Servicio</h5>
          <p>El sistema permite a los candidatos:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Subir su Curriculum Vitae en formato PDF</li>
            <li>Postularse a búsquedas laborales activas</li>
            <li>Ser contactados por el equipo de RRHH</li>
            <li>Participar en procesos de selección</li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-manzur-primary mt-3">3. Responsabilidades del Usuario</h5>
          <p>Usted se compromete a:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Proporcionar información veraz y actualizada</li>
            <li>No subir contenido falso, ilegal o que viole derechos de terceros</li>
            <li>No utilizar el sistema para fines no autorizados</li>
            <li>Mantener la confidencialidad de su información</li>
            <li>Notificar cualquier cambio en sus datos</li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-manzur-primary mt-3">4. Propiedad Intelectual</h5>
          <p>El sistema, su diseño, código y contenido son propiedad exclusiva de Manzur Administraciones. No está permitido copiar, modificar o distribuir el software sin autorización.</p>
        </div>

        <div>
          <h5 className="font-semibold text-manzur-primary mt-3">5. Limitación de Responsabilidad</h5>
          <p>Manzur Administraciones no garantiza:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>La obtención de empleo como resultado de la postulación</li>
            <li>La disponibilidad continua del servicio</li>
            <li>La exactitud de la información proporcionada por terceros</li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-manzur-primary mt-3">6. Modificaciones</h5>
          <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados a través de nuestra página web.</p>
        </div>

        <div>
          <h5 className="font-semibold text-manzur-primary mt-3">7. Ley Aplicable</h5>
          <p>Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa será resuelta por los tribunales de San Salvador de Jujuy.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-manzur-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-manzur-primary"/>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {mostrarPolitica === 'privacidad' ? 'Política de Privacidad' : 
                 mostrarPolitica === 'terminos' ? 'Términos y Condiciones' : 
                 'Aceptación de Políticas'}
              </h3>
              <p className="text-sm text-gray-500">
                {!mostrarPolitica && 'Por favor, lea y acepte nuestras políticas para continuar'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!mostrarPolitica ? (
            <div className="space-y-6">
              {/* Resumen de políticas */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>📋 Importante:</strong> Para poder enviar su CV y participar en nuestros procesos de selección,
                  debe leer y aceptar nuestra Política de Privacidad y Términos y Condiciones.
                </p>
              </div>

              {/* Botones para ver políticas completas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setMostrarPolitica('privacidad')}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-manzur-primary hover:bg-blue-50 transition-all text-left"
                >
                  <FileText className="w-8 h-8 text-manzur-primary flex-shrink-0"/>
                  <div>
                    <p className="font-semibold text-gray-900">Política de Privacidad</p>
                    <p className="text-xs text-gray-500">Conozca cómo protegemos sus datos personales</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 ml-auto"/>
                </button>

                <button
                  onClick={() => setMostrarPolitica('terminos')}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-manzur-primary hover:bg-blue-50 transition-all text-left"
                >
                  <FileText className="w-8 h-8 text-manzur-primary flex-shrink-0"/>
                  <div>
                    <p className="font-semibold text-gray-900">Términos y Condiciones</p>
                    <p className="text-xs text-gray-500">Términos que rigen el uso del sistema</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 ml-auto"/>
                </button>
              </div>

              {/* Checkbox de aceptación */}
              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aceptado}
                    onChange={(e) => setAceptado(e.target.checked)}
                    className="w-5 h-5 mt-0.5 accent-manzur-primary"
                  />
                  <div className="text-sm text-gray-700">
                    <p>
                      He leído y acepto la <button 
                        onClick={() => setMostrarPolitica('privacidad')}
                        className="text-manzur-primary font-semibold hover:underline"
                      >Política de Privacidad</button> y los 
                      <button 
                        onClick={() => setMostrarPolitica('terminos')}
                        className="text-manzur-primary font-semibold hover:underline"
                      > Términos y Condiciones</button>.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Acepto que mis datos sean tratados según lo establecido en las políticas.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          ) : mostrarPolitica === 'privacidad' ? (
            <PoliticaPrivacidad />
          ) : (
            <TerminosCondiciones />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 flex-shrink-0 gap-3">
          {mostrarPolitica ? (
            <>
              <button
                onClick={() => setMostrarPolitica(null)}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ← Volver
              </button>
              <button
                onClick={() => setMostrarPolitica(null)}
                className="px-4 py-2 text-sm font-medium text-white bg-manzur-primary hover:bg-manzur-secondary rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => aceptado ? onAccept() : alert('Debe aceptar las políticas para continuar')}
                className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-lg transition-colors
                  ${aceptado 
                    ? 'bg-manzur-primary text-white hover:bg-manzur-secondary' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                disabled={!aceptado}
              >
                <Check className="w-4 h-4"/>
                Aceptar y continuar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};