// pages/auth/signin.tsx
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Logo } from '@/components/Logo';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Si ya está autenticado, redirigir según el tipo de usuario
  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.email === 'sistemas@ddonpedrosrl.com') {
        router.replace('/admin/panel');
      } else {
        router.replace('/talentos');
      }
    }
  }, [status, session, router]);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn('google', { 
        callbackUrl: '/talentos'
      });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // No mostrar nada mientras carga la sesión
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-manzur-primary border-t-transparent rounded-full animate-spin"/>
          <p className="text-manzur-primary text-sm font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado, no mostrar el formulario (la redirección se hará en el useEffect)
  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo width={120} height={50} />
          </div>
          <h1 className="text-2xl font-bold text-manzur-primary">MANZUR</h1>
          <p className="text-xs tracking-wider text-gray-500 mb-2">ADMINISTRACIONES</p>
          <h2 className="text-xl font-semibold text-gray-800 mt-4">
            Cargar mi CV
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Inicia sesión con tu cuenta de Google para continuar
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-6 py-3 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
        >
          {isGoogleLoading ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          <span className="font-medium text-gray-700">
            {isGoogleLoading ? 'Conectando...' : 'Continuar con Google'}
          </span>
        </button>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Al iniciar sesión, aceptas nuestros{' '}
            <a href="#" className="text-manzur-primary hover:underline">Términos</a> y{' '}
            <a href="#" className="text-manzur-primary hover:underline">Política de Privacidad</a>
          </p>
        </div>

        {/* <div className="mt-4 text-center">
          <a
            href="/admin"
            className="text-sm text-manzur-primary hover:text-manzur-secondary transition-colors"
          >
            ← ¿Eres administrador? Accede aquí
          </a>
        </div> */}
      </div>
    </div>
  );
}