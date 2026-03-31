import React from 'react';
import { LogOut } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/lib/useAuth';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">

        {/* Logo + nombre */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex-shrink-0">
            <Logo width={90} height={36} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-manzur-primary leading-tight sm:text-xs">MANZUR</h1>
            <p className="text-xs tracking-wider text-gray-600">ADMINISTRACIONES</p>
          </div>
        </div>

        {/* Usuario + salir */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Email — oculto en mobile muy pequeño */}
            <span className="hidden sm:block text-xs text-gray-500 truncate max-w-[160px]">
              {user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 px-3 py-2 text-white text-sm rounded-lg bg-manzur-primary hover:bg-manzur-secondary transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};