import React, { useState } from 'react';
import { Mail, ChevronDown, ChevronUp, LogIn } from 'lucide-react';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { Logo } from './Logo';
import { useAuth } from '@/lib/useAuth';

export const LoginPage: React.FC = () => {
  const { signIn } = useAuth();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleAdminSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Ingresá tu email y contraseña');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await nextAuthSignIn('admin-credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('Credenciales incorrectas. Intentá de nuevo.');
      }
    } catch {
      setError('Ocurrió un error. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">

        <div className="flex justify-center mb-6">
          <Logo width={200} height={80} />
        </div>

        <h1 className="text-2xl font-bold text-center mb-2 text-manzur-primary">MANZUR</h1>
        <p className="text-center mb-8 tracking-wider text-black">ADMINISTRACIONES</p>
        <p className="text-center mb-6 text-gray-600">Selección de Talentos</p>

        {/* Botón público — cargar CV */}
        <button
          onClick={() => signIn()}
          className="w-full py-3 text-white font-medium rounded-lg flex items-center justify-center gap-2 bg-manzur-primary hover:bg-manzur-secondary transition-colors"
        >
          <Mail className="w-5 h-5" />
          Cargar mi CV
        </button>

        {/* Separador */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200"/>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Administración</span>
          <div className="flex-1 h-px bg-gray-200"/>
        </div>

       {/* Campos colapsables */}
        {showEmailForm && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@empresa.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-manzur-primary"
                disabled={loading}
                onKeyDown={e => e.key === 'Enter' && handleAdminSignIn()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-manzur-primary"
                disabled={loading}
                onKeyDown={e => e.key === 'Enter' && handleAdminSignIn()}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleAdminSignIn}
              disabled={loading}
              className="w-full py-2.5 text-white font-medium rounded-lg bg-manzur-primary hover:bg-manzur-secondary transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};