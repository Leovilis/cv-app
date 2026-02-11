import React from 'react';
import { LogOut } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/lib/useAuth';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo width={150} height={60} />
          <div>
            <h1 className="text-xl font-bold text-manzur-primary">MANZUR</h1>
            <p className="text-sm tracking-wider">ADMINISTRACIONES</p>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-manzur-primary hover:bg-manzur-secondary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

