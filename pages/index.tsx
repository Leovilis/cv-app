import React, { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/components/LoginPage';
import { CVUploadForm } from '@/components/CVUploadForm';
import { AdminPanel } from '@/components/AdminPanel';
import { AdminSearchPanel } from '@/components/AdminSearchPanel';

type AdminTab = 'panel' | 'busquedas';

export default function Home() {
  const { user, loading, authenticated, isAdmin } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTab>('panel');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-manzur-primary border-t-transparent rounded-full animate-spin"/>
          <p className="text-manzur-primary text-sm font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginPage />;
  }

  return (
    <Layout>
      {isAdmin ? (
        <>
          {/* Pestañas admin — scroll horizontal en mobile */}
          <div className="flex border-b-2 border-gray-200 mb-5 sm:mb-8 overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
            <button
              onClick={() => setAdminTab('panel')}
              className={`px-4 sm:px-6 py-3 font-semibold text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                adminTab === 'panel'
                  ? 'border-b-2 border-manzur-primary text-manzur-primary'
                  : 'text-gray-500 hover:text-manzur-primary'
              }`}
            >
              Panel de Administración
            </button>
            <button
              onClick={() => setAdminTab('busquedas')}
              className={`px-4 sm:px-6 py-3 font-semibold text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                adminTab === 'busquedas'
                  ? 'border-b-2 border-manzur-primary text-manzur-primary'
                  : 'text-gray-500 hover:text-manzur-primary'
              }`}
            >
              Búsquedas Activas
            </button>
          </div>

          {adminTab === 'panel'    && <AdminPanel />}
          {adminTab === 'busquedas' && <AdminSearchPanel />}
        </>
      ) : (
        <>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-center text-manzur-primary">
              Formulario de Talentos
            </h2>
            <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
              Complete el formulario para enviar su CV
            </p>

            {showSuccess && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm flex items-center gap-2">
                <span className="text-lg">✓</span>
                CV enviado exitosamente
              </div>
            )}

            <CVUploadForm
              onSuccess={() => {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 5000);
              }}
            />
          </div>
        </>
      )}
    </Layout>
  );
}