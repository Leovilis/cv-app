import React, { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/components/LoginPage';
import { CVUploadForm } from '@/components/CVUploadForm';
import { AdminPanel } from '@/components/AdminPanel';

export default function Home() {
  const { user, loading, authenticated, isAdmin } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);

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
          <h2 className="text-3xl font-bold mb-8 text-manzur-primary">
            Panel de Administración
          </h2>
          <AdminPanel />
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
