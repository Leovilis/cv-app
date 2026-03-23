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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-manzur-primary text-xl">Cargando...</p>
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
          {/* Pestañas de admin */}
          <div className="flex gap-1 border-b-2 border-gray-200 mb-8">
            <button
              onClick={() => setAdminTab('panel')}
              className={`px-6 py-3 font-semibold text-sm transition-colors ${
                adminTab === 'panel'
                  ? 'border-b-2 border-manzur-primary text-manzur-primary'
                  : 'text-gray-500 hover:text-manzur-primary'
              }`}
            >
              Panel de Administración
            </button>
            <button
              onClick={() => setAdminTab('busquedas')}
              className={`px-6 py-3 font-semibold text-sm transition-colors ${
                adminTab === 'busquedas'
                  ? 'border-b-2 border-manzur-primary text-manzur-primary'
                  : 'text-gray-500 hover:text-manzur-primary'
              }`}
            >
              Búsquedas Activas
            </button>
          </div>

          {adminTab === 'panel' && <AdminPanel />}
          {adminTab === 'busquedas' && <AdminSearchPanel />}
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold mb-2 text-center text-manzur-primary">
            Cargar Curriculum Vitae
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Complete el formulario para enviar su CV
          </p>

          {showSuccess && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              ✓ CV enviado exitosamente
            </div>
          )}

          <CVUploadForm
            onSuccess={() => {
              setShowSuccess(true);
              setTimeout(() => setShowSuccess(false), 5000);
            }}
          />
        </>
      )}
    </Layout>
  );
}