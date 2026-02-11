import React from 'react';
import { Mail } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/lib/useAuth';

export const LoginPage: React.FC = () => {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Logo width={200} height={80} />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2 text-manzur-primary">
          MANZUR
        </h1>
        <p className="text-center mb-8 tracking-wider text-black">
          ADMINISTRACIONES
        </p>
        <p className="text-center mb-6 text-gray-600">Banco de Curriculums</p>
        <button
          onClick={() => signIn()}
          className="w-full py-3 text-white font-medium rounded-lg flex items-center justify-center gap-2 bg-manzur-primary hover:bg-manzur-secondary transition-colors"
        >
          <Mail className="w-5 h-5" />
          Ingresar
        </button>
      </div>
    </div>
  );
};