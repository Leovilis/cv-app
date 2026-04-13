// pages/admin/index.tsx
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function AdminLogin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Si ya está autenticado como admin, redirigir al panel
  if (status === 'authenticated' && session?.user?.email === 'sistemas@ddonpedrosrl.com') {
    router.replace('/admin/panel');
    return null;
  }

  // Si está autenticado pero NO es admin, redirigir a talentos
  if (status === 'authenticated' && session?.user?.email !== 'sistemas@ddonpedrosrl.com') {
    router.replace('/talentos');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('admin-credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales incorrectas');
      } else if (result?.ok) {
        router.push('/admin/panel');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-manzur-primary border-t-transparent rounded-full animate-spin"/>
          <p className="text-manzur-primary text-sm font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo width={120} height={50} />
          </div>
          <h1 className="text-2xl font-bold text-manzur-primary">MANZUR</h1>
          <p className="text-xs tracking-wider text-gray-500 mb-2">ADMINISTRACIONES</p>
          <h2 className="text-xl font-semibold text-gray-800 mt-4">
            Acceso Administradores
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Ingrese sus credenciales corporativas
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-400 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              Email corporativo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sistemas@ddonpedrosrl.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-manzur-primary focus:border-manzur-primary transition-all duration-200 outline-none"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Lock className="inline w-4 h-4 mr-1" />
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-manzur-primary focus:border-manzur-primary transition-all duration-200 outline-none pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-manzur-primary text-white font-semibold py-3 px-6 rounded-xl hover:bg-manzur-secondary disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ingresando...
              </span>
            ) : (
              'Ingresar al panel'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Acceso exclusivo para administradores del sistema
          </p>
        </div>

        <div className="mt-4 text-center">
          <a
            href="/"
            className="text-sm text-manzur-primary hover:text-manzur-secondary transition-colors"
          >
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}