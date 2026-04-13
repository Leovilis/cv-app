// pages/talentos/index.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Shield, CheckCircle, LogOut } from 'lucide-react';
import { CVUploadForm } from '@/components/CVUploadForm';
import { Logo } from '@/components/Logo';
import { Footer } from '@/components/Footer';
import { signOut } from 'next-auth/react';

export default function TalentosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Si es admin, redirigir al panel
  useEffect(() => {
    if (session?.user?.email === 'sistemas@ddonpedrosrl.com') {
      router.push('/admin/panel');
    }
  }, [session, router]);

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      router.push('/');
    }, 3000);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-manzur-primary border-t-transparent rounded-full animate-spin"/>
          <p className="text-manzur-primary text-sm font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-manzur-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Volver al inicio</span>
            </button>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {session.user?.email}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo width={120} height={50} />
              </div>
              <h1 className="text-xl font-bold text-manzur-primary">MANZUR</h1>
              <p className="text-xs tracking-wider text-gray-500 mb-2">ADMINISTRACIONES</p>
              <h2 className="text-2xl font-semibold text-gray-800 mt-4">
                Formulario de Talentos
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Completá el formulario para postularte a nuestras búsquedas activas
              </p>
            </div>

            {showSuccess && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                ¡CV enviado exitosamente!
              </div>
            )}

            <CVUploadForm onSuccess={handleSuccess} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}