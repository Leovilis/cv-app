// components/Layout.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/useAuth';
import { LogOut, Shield, User, Menu, X } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const isAdminRoute = router.pathname.startsWith('/admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const redirectUrl = isAdmin ? '/admin' : '/';
    await signOut({ redirect: false, callbackUrl: redirectUrl });
    router.push(redirectUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo y título */}
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-manzur-primary" />
              <span className="font-bold text-sm sm:text-base md:text-lg text-manzur-primary truncate">
                {isAdminRoute ? 'Panel de Administración' : 'Manzur Administraciones'}
              </span>
            </div>

            {/* Desktop menu - visible solo en desktop */}
            <div className="hidden md:flex items-center gap-4">
              {isAdminRoute && user && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="max-w-[200px] truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Salir</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu - solo botón de salir y menú hamburguesa */}
            <div className="flex items-center gap-2 md:hidden">
              {isAdminRoute && user && (
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
              
              {/* Botón menú hamburguesa - solo en admin route y mobile */}
              {isAdminRoute && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg text-gray-600 hover:text-manzur-primary hover:bg-gray-100 transition-colors"
                  aria-label="Menú"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>

          {/* Mobile dropdown menu - información del usuario */}
          {mobileMenuOpen && isAdminRoute && user && (
            <div className="md:hidden py-3 border-t border-gray-100">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {children}
      </main>
    </div>
  );
};