// components/Layout.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/useAuth';
import { LogOut, Shield, User } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const isAdminRoute = router.pathname.startsWith('/admin');

  const handleLogout = async () => {
    // Si es admin, redirigir a /admin después de cerrar sesión
    if (isAdmin) {
      await signOut({ redirect: false });
      router.push('/admin');
    } else {
      // Si es usuario normal, redirigir a la página principal
      await signOut({ redirect: false });
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-manzur-primary" />
              <span className="font-bold text-lg text-manzur-primary">
                {isAdminRoute ? 'Panel de Administración' : 'Manzur Administraciones'}
              </span>
            </div>
            
            <div>
              {isAdminRoute && user && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Salir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};